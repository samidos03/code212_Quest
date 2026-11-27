<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\SubmissionStatus;
use App\Exceptions\IdempotencyConflictException;
use App\Models\Quest;
use App\Models\QuestStep;
use App\Models\QuestSubmission;
use App\Services\QuestService;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 4 : la soumission d etape est idempotente par (user, quete, etape).
 */
class QuestSubmissionTest extends TestCase
{
    use RefreshDatabase;

    private QuestService $quests;

    private Quest $quest;

    private QuestStep $step;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_ENROLLED, 10);
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40);

        $this->quests = app(QuestService::class);

        $this->quest = Quest::create([
            'code' => 'Q-TEST-001',
            'title' => 'Quete de test',
            'description' => null,
            'track_code' => null,
            'difficulty' => 'debutant',
            'status' => 'publie',
            'xp_reward' => 100,
            'germes_reward' => 10,
            'estimated_minutes' => 60,
        ]);

        $this->step = QuestStep::create([
            'quest_id' => $this->quest->getKey(),
            'title' => 'Premiere etape',
            'description' => null,
            'type' => 'qcm',
            'validation_mode' => 'manuelle',
            'order_index' => 1,
            'xp_reward' => 40,
            'duration_minutes' => 30,
        ]);
    }

    #[Test]
    public function deux_soumissions_identiques_ne_creent_qu_une_entree(): void
    {
        $user = $this->makeUser();
        $this->quests->enroll($user, $this->quest);

        $first = $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);
        $second = $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);

        $this->assertSame($first->getKey(), $second->getKey());
        $this->assertSame(1, QuestSubmission::query()->where('user_id', $user->getKey())->count());
    }

    #[Test]
    public function un_contenu_different_provoque_un_conflit_d_idempotence(): void
    {
        $user = $this->makeUser();
        $this->quests->enroll($user, $this->quest);

        $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);

        $this->expectException(IdempotencyConflictException::class);

        $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'B']);
    }

    #[Test]
    public function la_soumission_requiert_une_inscription(): void
    {
        $user = $this->makeUser();

        $this->expectException(\App\Exceptions\BusinessRuleException::class);

        $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);
    }

    #[Test]
    public function la_validation_attribue_le_xp_une_seule_fois(): void
    {
        $user = $this->makeUser();
        $trainer = $this->makeUser(['roles' => ['trainer']]);

        $this->quests->enroll($user, $this->quest);
        $submission = $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);

        $this->quests->review($submission, $trainer, SubmissionStatus::Approved, 'Bien joue.');

        $stepEntries = DB::table('xp_ledger')
            ->where('user_id', $user->getKey())
            ->where('source_event', XpSource::QUEST_STEP_APPROVED)
            ->get();

        $this->assertCount(1, $stepEntries);
        $this->assertSame(40, (int) $stepEntries->first()->xp_delta);

        // Le total de l'utilisateur est la somme du journal (inscription + etape).
        $this->assertSame(
            (int) DB::table('xp_ledger')->where('user_id', $user->getKey())->sum('xp_delta'),
            (int) $user->refresh()->xp_total
        );
    }

    #[Test]
    public function l_avancement_de_la_quete_suit_les_validations(): void
    {
        $user = $this->makeUser();
        $trainer = $this->makeUser(['roles' => ['trainer']]);

        $this->quests->enroll($user, $this->quest);
        $submission = $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);
        $this->quests->review($submission, $trainer, SubmissionStatus::Approved);

        $progress = $this->quests->progressFor($user, $this->quest);

        $this->assertSame(1, $progress['steps_total']);
        $this->assertSame(1, $progress['steps_approved']);
        $this->assertSame(100.0, $progress['percent']);
    }

    #[Test]
    public function la_contrainte_d_idempotence_est_en_base(): void
    {
        $user = $this->makeUser();
        $this->quests->enroll($user, $this->quest);
        $this->quests->submitStep($user, $this->quest, $this->step, ['reponse' => 'A']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        DB::table('quest_submissions')->insert([
            'user_id' => $user->getKey(),
            'quest_id' => $this->quest->getKey(),
            'quest_step_id' => $this->step->getKey(),
            'content' => json_encode(['reponse' => 'B']),
            'status' => 'en_attente',
            'idempotency_key' => 'autre-cle',
            'content_hash' => str_repeat('a', 64),
            'submitted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
