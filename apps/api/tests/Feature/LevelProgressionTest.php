<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Services\LevelService;
use App\Services\XpLedgerService;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 2 : le niveau global est calcule cote serveur a partir de l XP cumule.
 */
class LevelProgressionTest extends TestCase
{
    use RefreshDatabase;

    private XpLedgerService $ledger;

    private LevelService $levels;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40);

        $this->ledger = app(XpLedgerService::class);
        $this->levels = app(LevelService::class);
    }

    #[Test]
    public function le_niveau_suit_le_total_xp_cumule(): void
    {
        $user = $this->makeUser();

        $this->assertSame(1, (int) $user->level_no);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 40);
        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 2, 40);

        $this->assertSame(80, $this->levels->totalXp($user));
        $this->assertSame(1, (int) $user->refresh()->level_no);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 3, 40);

        $this->assertSame(120, $this->levels->totalXp($user));
        $this->assertSame(2, (int) $user->refresh()->level_no);
    }

    #[Test]
    public function une_correction_compensatoire_fait_descendre_le_niveau(): void
    {
        $user = $this->makeUser();

        // Seuils de test : 0 / 100 / 300 / 1000. 200 XP correspond au niveau 2.
        $entry = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 200);
        $this->assertSame(2, (int) $user->refresh()->level_no);

        $this->ledger->compensate($entry, 150, 'Erreur de bareme.');

        $this->assertSame(50, $this->levels->totalXp($user));
        $this->assertSame(1, (int) $user->refresh()->level_no);
    }

    #[Test]
    public function la_progression_expose_le_niveau_suivant(): void
    {
        $user = $this->makeUser();

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 40);

        $progress = $this->levels->progress($user);

        $this->assertSame(40, $progress['xp_total']);
        $this->assertSame(1, $progress['level_no']);
        $this->assertSame(2, $progress['next_level_no']);
        $this->assertSame(60, $progress['xp_to_next_level']);
    }

    #[Test]
    public function les_seuils_de_niveau_sont_configurables_en_base(): void
    {
        \App\Models\Level::query()->where('level_no', 2)->update(['xp_threshold' => 50]);
        \Illuminate\Support\Facades\Cache::flush();

        $user = $this->makeUser();
        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 60);

        $this->assertSame(2, (int) $user->refresh()->level_no);
    }

    #[Test]
    public function les_xp_de_voie_comptent_dans_le_niveau_global(): void
    {
        $this->seed(\Database\Seeders\TrackSeeder::class);
        $user = $this->makeUser(['track_code' => 'codeur']);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 80, 'codeur');
        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 2, 40);

        $this->assertSame(80, $this->levels->trackXp($user, 'codeur'));
        $this->assertSame(120, $this->levels->totalXp($user));
        $this->assertSame(120, (int) $user->refresh()->xp_total);
        $this->assertSame(2, (int) $user->level_no);
    }
}
