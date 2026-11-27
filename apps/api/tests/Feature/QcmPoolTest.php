<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExerciseAttempt;
use App\Models\LearningPath;
use App\Models\LessonExercise;
use App\Models\PathStep;
use Database\Seeders\LearningPathSeeder;
use Database\Seeders\QuestSeeder;
use Database\Seeders\TrackSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Contenu seedé du parcours Full-Stack et tirage aléatoire des QCM.
 */
class QcmPoolTest extends TestCase
{
    use RefreshDatabase;

    private LearningPath $path;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seed([TrackSeeder::class, QuestSeeder::class, LearningPathSeeder::class]);

        $this->path = LearningPath::query()->where('code', 'P-FULLSTACK')->firstOrFail();
    }

    #[Test]
    public function le_seeder_definit_trois_modules_avec_sql_et_integration(): void
    {
        $modules = PathStep::query()
            ->where('learning_path_id', $this->path->getKey())
            ->orderBy('order_index')
            ->with('lessons')
            ->get();

        $this->assertCount(3, $modules);
        $this->assertSame([2, 2, 4], $modules->map(fn (PathStep $m) => $m->lessons->count())->all());

        $titles = $modules[2]->lessons->pluck('title')->implode(' | ');
        $this->assertStringContainsString('SQL', $titles);
        $this->assertStringContainsString('frontend React', $titles);
    }

    #[Test]
    public function chaque_qcm_du_parcours_a_un_pool_de_trois_questions_valides(): void
    {
        $exercises = $this->fullStackQcms();

        $this->assertCount(8, $exercises);

        foreach ($exercises as $exercise) {
            $pool = $exercise->validation_rules['pool'] ?? [];
            $this->assertCount(3, $pool, $exercise->title);
            $this->assertCount(3, array_unique(array_column($pool, 'id')), $exercise->title);

            foreach ($pool as $question) {
                $optionIds = array_column($question['options'], 'id');
                $this->assertContains($question['correct'], $optionIds, $exercise->title.' / '.$question['id']);
                $this->assertNotSame('', trim((string) $question['question']));
            }
        }
    }

    #[Test]
    public function le_seeder_est_idempotent(): void
    {
        $this->seed(LearningPathSeeder::class);

        $exercises = $this->fullStackQcms();
        $this->assertCount(8, $exercises);
        $this->assertCount(3, $exercises->first()->validation_rules['pool']);
    }

    #[Test]
    public function l_api_tire_des_questions_differentes_sans_divulguer_la_reponse(): void
    {
        $user = $this->enrolledUser();
        $module1 = $this->module(1);
        $exercise = $this->fullStackQcms()->first(fn (LessonExercise $e) => $e->lesson->path_step_id === $module1->getKey());
        $poolIds = array_column($exercise->validation_rules['pool'], 'id');

        $seen = [];
        for ($i = 0; $i < 40; $i++) {
            $payload = $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$module1->id}")->assertOk()->json('data');
            $json = json_encode($payload);
            $this->assertStringNotContainsString('"correct"', $json);
            $this->assertStringNotContainsString('explanation', $json);

            foreach ($payload['lecons'] as $lesson) {
                foreach ($lesson['exercices'] as $item) {
                    if ($item['id'] === $exercise->id) {
                        $this->assertSame(3, $item['taille_pool']);
                        $this->assertContains($item['question_id'], $poolIds);
                        $seen[$item['question_id']] = true;
                    }
                }
            }
        }

        // Avec 3 questions et 40 tirages, obtenir une seule question a une
        // probabilité d'environ 3 × (1/3)^40.
        $this->assertGreaterThan(1, count($seen));
        $this->assertNotNull($user);
    }

    #[Test]
    public function la_reponse_est_validee_contre_la_question_tiree(): void
    {
        $this->enrolledUser();
        $exercise = $this->exerciseOfModule(1);
        $pool = $exercise->validation_rules['pool'];
        $q2 = $pool[1];
        $wrong = collect($q2['options'])->firstWhere(fn ($o) => $o['id'] !== $q2['correct'])['id'];

        $this->postJson("/api/v1/exercises/{$exercise->id}/attempt", ['reponse' => $wrong, 'question_id' => $q2['id']])
            ->assertCreated()
            ->assertJsonPath('data.reussi', false);

        $this->postJson("/api/v1/exercises/{$exercise->id}/attempt", ['reponse' => $q2['correct'], 'question_id' => $q2['id']])
            ->assertCreated()
            ->assertJsonPath('data.reussi', true)
            ->assertJsonPath('data.tentative', 2);
    }

    #[Test]
    public function une_question_inconnue_est_refusee_en_422_sans_tentative(): void
    {
        $this->enrolledUser();
        $exercise = $this->exerciseOfModule(1);

        $this->postJson("/api/v1/exercises/{$exercise->id}/attempt", ['reponse' => 'a'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('question_id');

        $this->postJson("/api/v1/exercises/{$exercise->id}/attempt", ['reponse' => 'a', 'question_id' => 'q99'])
            ->assertStatus(422);

        $this->assertSame(0, ExerciseAttempt::query()->count());
    }

    /**
     * @return \Illuminate\Support\Collection<int, LessonExercise>
     */
    private function fullStackQcms()
    {
        return LessonExercise::query()
            ->where('validation_type', 'qcm')
            ->whereHas('lesson.step', fn ($q) => $q->where('learning_path_id', $this->path->getKey()))
            ->with('lesson')
            ->orderBy('id')
            ->get();
    }

    private function module(int $order): PathStep
    {
        return PathStep::query()
            ->where('learning_path_id', $this->path->getKey())
            ->where('order_index', $order)
            ->firstOrFail();
    }

    private function exerciseOfModule(int $order): LessonExercise
    {
        $module = $this->module($order);

        return $this->fullStackQcms()->first(fn (LessonExercise $e) => $e->lesson->path_step_id === $module->getKey());
    }

    private function enrolledUser(): \App\Models\User
    {
        $user = $this->makeUser(['track_code' => 'codeur']);
        Sanctum::actingAs($user, ['read', 'write']);
        $this->postJson("/api/v1/paths/{$this->path->id}/enroll")->assertSuccessful();

        return $user;
    }
}
