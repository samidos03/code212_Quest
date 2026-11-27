<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\LearningPath;
use App\Models\PathStep;
use App\Models\User;
use App\Support\XpSource;
use Database\Seeders\LearningPathSeeder;
use Database\Seeders\QuestSeeder;
use Database\Seeders\TrackSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * File de revue formateur : attente, renvoi commenté, nouvelle tentative,
 * approbation et retour visible côté apprenant, sur le contenu seedé.
 */
class TrainerReviewQueueTest extends TestCase
{
    use RefreshDatabase;

    private LearningPath $path;

    private PathStep $module1;

    private PathStep $module2;

    private User $student;

    private User $trainer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::SUBMISSION_APPROVED, 100);
        $this->seed([TrackSeeder::class, QuestSeeder::class, LearningPathSeeder::class]);

        $this->path = LearningPath::query()->where('code', 'P-FULLSTACK')->firstOrFail();
        $steps = PathStep::query()->where('learning_path_id', $this->path->getKey())->orderBy('order_index')->get();
        [$this->module1, $this->module2] = [$steps[0], $steps[1]];

        $this->student = $this->makeUser(['track_code' => 'codeur']);
        $this->trainer = $this->makeUser(['roles' => ['trainer']]);
    }

    #[Test]
    public function parcours_complet_attente_renvoi_nouvelle_tentative_approbation(): void
    {
        // 1. L'apprenant s'inscrit et dépose la quête finale sans faire de cours ni de QCM.
        $this->asStudent();
        $this->postJson("/api/v1/paths/{$this->path->id}/enroll")->assertSuccessful();
        $first = $this->submitFinalQuest('https://github.com/exemple/profil v1');

        // Un second dépôt pendant l'attente est refusé en 409.
        $quest = $this->module1->quest_id;
        $step = \App\Models\QuestStep::query()->where('quest_id', $quest)->firstOrFail();
        $this->postJson("/api/v1/quests/{$quest}/steps/{$step->id}/submit", ['contenu' => 'doublon'])
            ->assertStatus(409)
            ->assertJsonPath('message', 'Une tentative est déjà en attente de correction par un formateur.');

        // 2. Le formateur voit la tentative 1 dans la file.
        $this->asTrainer();
        $queue = $this->getJson('/api/v1/admin/submissions?statut=en_attente')->assertOk()->json('data');
        $this->assertCount(1, $queue);
        $this->assertSame(1, $queue[0]['tentative']);
        $submissionId = $queue[0]['id'];

        // 3. Un renvoi sans commentaire est refusé.
        $this->postJson("/api/v1/admin/submissions/{$submissionId}/review", ['decision' => 'a_revoir'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('feedback');

        // 4. Renvoi commenté : la file se vide.
        $this->postJson("/api/v1/admin/submissions/{$submissionId}/review", [
            'decision' => 'a_revoir',
            'feedback' => 'Ajoute la balise <main> et vérifie l’affichage mobile.',
        ])->assertOk()
            ->assertJsonPath('data.statut', 'a_revoir')
            ->assertJsonPath('data.feedback', 'Ajoute la balise <main> et vérifie l’affichage mobile.')
            ->assertJsonPath('data.correcteur.id', $this->trainer->id);

        $this->assertCount(0, $this->getJson('/api/v1/admin/submissions?statut=en_attente')->json('data'));

        // 5. L'apprenant voit le statut et le commentaire, le module 2 reste verrouillé.
        $this->asStudent();
        $module = $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module1->id}")->assertOk();
        $module->assertJsonPath('data.statut', 'a_revoir')
            ->assertJsonPath('data.quete_finale.soumission.statut', 'a_revoir')
            ->assertJsonPath('data.quete_finale.soumission.commentaire_formateur', 'Ajoute la balise <main> et vérifie l’affichage mobile.');
        $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module2->id}")->assertForbidden();

        // 6. Nouvelle tentative : une nouvelle entrée apparaît dans la file.
        $second = $this->submitFinalQuest('https://github.com/exemple/profil v2');
        $this->assertNotSame($first, $second);

        $this->asTrainer();
        $queue = $this->getJson('/api/v1/admin/submissions?statut=en_attente')->json('data');
        $this->assertCount(1, $queue);
        $this->assertSame(2, $queue[0]['tentative']);

        // 7. L'ancienne tentative ne peut plus être approuvée.
        $this->postJson("/api/v1/admin/submissions/{$submissionId}/review", ['decision' => 'approve'])
            ->assertStatus(409);

        // 8. Approbation de la tentative 2 : module 1 terminé, module 2 ouvert.
        $this->postJson("/api/v1/admin/submissions/{$queue[0]['id']}/review", ['decision' => 'approve', 'feedback' => 'Très propre.'])
            ->assertOk()
            ->assertJsonPath('data.statut', 'approuvee');

        $this->asStudent();
        $this->postJson("/api/v1/quests/{$quest}/steps/{$step->id}/submit", ['contenu' => 'après validation'])
            ->assertStatus(409);
        $modules = collect($this->getJson("/api/v1/paths/{$this->path->id}")->json('data.modules'))->keyBy('id');
        $this->assertSame('termine', $modules[$this->module1->id]['statut']);
        $this->assertSame('en_cours', $modules[$this->module2->id]['statut']);
        $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module1->id}")
            ->assertJsonPath('data.quete_finale.soumission.commentaire_formateur', 'Très propre.');
    }

    #[Test]
    public function un_apprenant_ne_peut_ni_lire_la_file_ni_corriger(): void
    {
        $this->asStudent();
        $this->postJson("/api/v1/paths/{$this->path->id}/enroll")->assertSuccessful();
        $this->submitFinalQuest('livrable');
        $submission = \App\Models\Submission::query()->firstOrFail();

        $this->getJson('/api/v1/admin/submissions')->assertForbidden();
        $this->postJson("/api/v1/admin/submissions/{$submission->id}/review", ['decision' => 'approve'])->assertForbidden();
        $this->assertSame('en_attente', $submission->refresh()->status);
    }

    private function submitFinalQuest(string $content): int
    {
        $quest = $this->module1->quest_id;
        $step = \App\Models\QuestStep::query()->where('quest_id', $quest)->orderBy('order_index')->firstOrFail();

        return (int) $this->postJson("/api/v1/quests/{$quest}/steps/{$step->id}/submit", ['contenu' => $content])
            ->assertSuccessful()
            ->assertJsonPath('data.statut', 'en_attente')
            ->json('data.id');
    }

    private function asStudent(): void
    {
        Sanctum::actingAs($this->student, ['read', 'write']);
    }

    private function asTrainer(): void
    {
        Sanctum::actingAs($this->trainer, ['read', 'write']);
    }
}
