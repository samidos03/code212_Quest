<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\XpLedgerEntry;
use App\Services\XpLedgerService;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 1 : le journal XP est append-only et idempotent.
 */
class LedgerIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private XpLedgerService $ledger;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40);

        $this->ledger = app(XpLedgerService::class);
    }

    #[Test]
    public function le_xp_ne_peut_pas_etre_attribue_deux_fois_pour_la_meme_source(): void
    {
        $user = $this->makeUser();

        $first = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);
        $second = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);

        $this->assertSame($first->getKey(), $second->getKey(), 'La deuxieme ecriture doit retourne l ecriture existante.');
        $this->assertSame(1, XpLedgerEntry::query()->where('user_id', $user->getKey())->count());
        $this->assertSame(40, (int) $user->refresh()->xp_total);
    }

    #[Test]
    public function la_contrainte_d_unicite_est_appliquee_en_base(): void
    {
        $user = $this->makeUser();

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);

        $this->expectException(QueryException::class);

        DB::table('xp_ledger')->insert([
            'user_id' => $user->getKey(),
            'track_type' => null,
            'xp_delta' => 40,
            'source_event' => XpSource::QUEST_STEP_APPROVED,
            'reference_id' => '42',
            'rule_version' => 1,
            'created_at' => now(),
        ]);
    }

    #[Test]
    public function une_ correction_se_fait_par_ecriture_compensatoire(): void
    {
        $user = $this->makeUser();

        $entry = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);
        $compensation = $this->ledger->compensate($entry, 15, 'Correction apres double comptage.');

        $this->assertSame(-15, (int) $compensation->xp_delta);
        $this->assertSame(XpSource::REVERSAL, $compensation->source_event);
        $this->assertSame(40, (int) $entry->refresh()->xp_delta, 'L ecriture d origine ne doit pas etre modifiee.');
        $this->assertSame(25, (int) $user->refresh()->xp_total);
    }

    #[Test]
    public function le_journal_interdit_les_mises_a_jour(): void
    {
        $user = $this->makeUser();
        $entry = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);

        $this->expectException(QueryException::class);

        DB::table('xp_ledger')->where('id', $entry->getKey())->update(['xp_delta' => 999]);
    }

    #[Test]
    public function le_journal_interdit_les_suppressions(): void
    {
        $user = $this->makeUser();
        $entry = $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 42, 40);

        $this->expectException(QueryException::class);

        DB::table('xp_ledger')->where('id', $entry->getKey())->delete();
    }

    #[Test]
    public function le_plafond_journalier_est_applique(): void
    {
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40, 50);

        $user = $this->makeUser();

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 1, 40);

        $this->expectException(\App\Exceptions\XpCapExceededException::class);

        $this->ledger->record($user, XpSource::QUEST_STEP_APPROVED, 2, 40);
    }
}
