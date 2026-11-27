<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Services\LeaderboardService;
use App\Services\XpLedgerService;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 6 : le classement respecte le consentement et n expose aucune
 * donnee personnelle.
 */
class LeaderboardConsentTest extends TestCase
{
    use RefreshDatabase;

    private LeaderboardService $leaderboard;

    private XpLedgerService $ledger;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40);

        $this->leaderboard = app(LeaderboardService::class);
        $this->ledger = app(XpLedgerService::class);
    }

    #[Test]
    public function un_utilisateur_sans_consentement_n_apparait_pas(): void
    {
        $optIn = $this->makeUser(['competition_opt_in' => true, 'pseudonym' => 'Alpha']);
        $optOut = $this->makeUser(['competition_opt_in' => false, 'pseudonym' => 'Beta']);

        $this->ledger->record($optIn, XpSource::QUEST_STEP_APPROVED, 1, 200);
        $this->ledger->record($optOut, XpSource::QUEST_STEP_APPROVED, 2, 500);

        $entries = $this->leaderboard->ranking();

        $this->assertCount(1, $entries);
        $this->assertSame('Alpha', $entries->first()['pseudonyme']);
    }

    #[Test]
    public function le_classement_ne_expose_aucune_donnee_personnelle(): void
    {
        $user = $this->makeUser([
            'competition_opt_in' => true,
            'pseudonym' => 'Alpha',
            'uca_matricule' => 'UCA-9999',
        ]);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 200);

        $entry = $this->leaderboard->ranking()->first();

        $this->assertArrayNotHasKey('email', $entry);
        $this->assertArrayNotHasKey('nom', $entry);
        $this->assertArrayNotHasKey('matricule', $entry);
        $this->assertSame('Alpha', $entry['pseudonyme']);
    }

    #[Test]
    public function un_utilisateur_anonymise_est_affiche_sans_pseudonyme(): void
    {
        $user = $this->makeUser([
            'competition_opt_in' => true,
            'pseudonym' => 'Alpha',
            'anonymize_leaderboard' => true,
        ]);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 200);

        $entry = $this->leaderboard->ranking()->first();

        $this->assertStringStartsWith('Anonyme', (string) $entry['pseudonyme']);
    }

    #[Test]
    public function la_route_classement_ne_returns_pas_de_donnees_personnelles(): void
    {
        $user = $this->makeUser([
            'competition_opt_in' => true,
            'pseudonym' => 'Alpha',
            'email' => 'alpha@uca.ma',
        ]);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 200);

        Sanctum::actingAs($user, ['read', 'write']);

        $response = $this->getJson('/api/v1/leaderboards');

        $response->assertOk();
        $response->assertJsonPath('data.0.pseudonyme', 'Alpha');

        $payload = $response->getContent();

        $this->assertStringNotContainsString('alpha@uca.ma', (string) $payload);
        $this->assertStringNotContainsString('uca_matricule', (string) $payload);
    }

    #[Test]
    public function la_position_est_absente_sans_consentement(): void
    {
        $user = $this->makeUser(['competition_opt_in' => false]);
        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 200);

        $this->assertNull($this->leaderboard->positionOf($user));
    }
}
