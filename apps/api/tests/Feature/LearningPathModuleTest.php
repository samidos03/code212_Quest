<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\SubmissionStatus;
use App\Models\ExerciseAttempt;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\LessonExercise;
use App\Models\ModuleLesson;
use App\Models\PathStep;
use App\Models\Quest;
use App\Models\QuestStep;
use App\Models\QuestSubmission;
use App\Models\Submission;
use App\Services\ModuleProgressionService;
use App\Services\QuestService;
use App\Services\SubmissionReviewService;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LearningPathModuleTest extends TestCase
{
    use RefreshDatabase;

    private LearningPath $path;
    private PathStep $module1;
    private PathStep $module2;
    private Quest $quest1;
    private QuestStep $quest1Step;
    private Quest $quest2;
    private QuestStep $quest2Step;
    private ModuleLesson $lesson1;
    private LessonExercise $exerciseQcm1;
    private LessonExercise $exerciseQcm2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_ENROLLED, 10);
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 100);
        $this->seedXpRule(XpSource::SUBMISSION_APPROVED, 100);

        // Voie de progression
        $this->seed(\Database\Seeders\TrackSeeder::class);

        // Parcours Full-Stack
        $this->path = LearningPath::create([
            'code' => 'P-TEST-FULLSTACK',
            'title' => 'Parcours Test Full-Stack',
            'description' => 'Description test',
            'track_code' => 'codeur',
            'level_no_from' => 1,
            'level_no_to' => 4,
            'xp_bonus' => 200,
            'germes_bonus' => 50,
            'position' => 1,
            'published' => true,
        ]);

        // Quête finale Module 1
        $this->quest1 = Quest::create([
            'code' => 'Q-TEST-001',
            'title' => 'Quête finale Module 1',
            'description' => 'Description quête 1',
            'track_code' => 'codeur',
            'difficulty' => 'debutant',
            'status' => 'publie',
            'xp_reward' => 100,
            'germes_reward' => 20,
            'estimated_minutes' => 60,
        ]);

        $this->quest1Step = QuestStep::create([
            'quest_id' => $this->quest1->getKey(),
            'title' => 'Livrable final Module 1',
            'description' => 'Critères de réussite',
            'type' => 'preuve',
            'validation_mode' => 'manuelle',
            'order_index' => 1,
            'xp_reward' => 100,
            'duration_minutes' => 60,
        ]);

        // Quête finale Module 2
        $this->quest2 = Quest::create([
            'code' => 'Q-TEST-002',
            'title' => 'Quête finale Module 2',
            'description' => 'Description quête 2',
            'track_code' => 'codeur',
            'difficulty' => 'debutant',
            'status' => 'publie',
            'xp_reward' => 120,
            'germes_reward' => 25,
            'estimated_minutes' => 60,
        ]);

        $this->quest2Step = QuestStep::create([
            'quest_id' => $this->quest2->getKey(),
            'title' => 'Livrable final Module 2',
            'description' => 'Critères de réussite',
            'type' => 'preuve',
            'validation_mode' => 'manuelle',
            'order_index' => 1,
            'xp_reward' => 120,
            'duration_minutes' => 60,
        ]);

        // Module 1
        $this->module1 = PathStep::create([
            'learning_path_id' => $this->path->getKey(),
            'title' => 'Module 1 : Fondations',
            'description' => 'Description module 1',
            'kind' => 'module',
            'ref_type' => 'quete',
            'ref_id' => $this->quest1->code,
            'quest_id' => $this->quest1->getKey(),
            'order_index' => 1,
            'xp_reward' => 100,
        ]);

        // Module 2
        $this->module2 = PathStep::create([
            'learning_path_id' => $this->path->getKey(),
            'title' => 'Module 2 : Avancé',
            'description' => 'Description module 2',
            'kind' => 'module',
            'ref_type' => 'quete',
            'ref_id' => $this->quest2->code,
            'quest_id' => $this->quest2->getKey(),
            'order_index' => 2,
            'xp_reward' => 120,
        ]);

        // Chapitre et quiz QCM sur Module 1
        $this->lesson1 = ModuleLesson::create([
            'path_step_id' => $this->module1->getKey(),
            'title' => 'Leçon 1 : HTML Sémantique',
            'summary' => 'Introduction sémantique concise',
            'key_points' => [
                '<main> identifie le contenu central et unique.',
                '<article> encapsule un composant autonome.',
            ],
            'content' => 'Le contenu détaillé du chapitre.',
            'example_code' => '<article><h1>Titre</h1></article>',
            'example_explanation' => 'Explication originale du code.',
            'order_index' => 1,
            'estimated_minutes' => 15,
        ]);

        $this->exerciseQcm1 = LessonExercise::create([
            'module_lesson_id' => $this->lesson1->getKey(),
            'title' => 'Quiz : Sémantique HTML5',
            'instructions' => 'Quelle balise englobe le contenu principal unique ?',
            'validation_type' => 'qcm',
            'validation_rules' => [
                'options' => [
                    ['id' => 'a', 'label' => '<section>'],
                    ['id' => 'b', 'label' => '<main>'],
                    ['id' => 'c', 'label' => '<div>'],
                ],
                'correct' => 'b',
                'explanation' => 'La balise <main> identifie formellement le contenu principal unique.',
            ],
            'order_index' => 1,
        ]);

        $lesson2 = ModuleLesson::create([
            'path_step_id' => $this->module2->getKey(),
            'title' => 'Leçon 1 : JavaScript DOM',
            'content' => 'Contenu JavaScript',
            'order_index' => 1,
        ]);

        $this->exerciseQcm2 = LessonExercise::create([
            'module_lesson_id' => $lesson2->getKey(),
            'title' => 'Quiz : Événements',
            'instructions' => 'Quelle méthode bloque l’action par défaut ?',
            'validation_type' => 'qcm',
            'validation_rules' => [
                'options' => [
                    ['id' => 'a', 'label' => 'event.preventDefault()'],
                    ['id' => 'b', 'label' => 'event.stopPropagation()'],
                ],
                'correct' => 'a',
                'explanation' => 'preventDefault() neutralise l’action par défaut.',
            ],
            'order_index' => 1,
        ]);
    }

    #[Test]
    public function un_apprenant_peut_s_inscrire_au_parcours_et_lire_les_modules(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user, ['read', 'write']);

        $response = $this->postJson("/api/v1/paths/{$this->path->id}/enroll");
        $response->assertStatus(201);
        $response->assertJsonPath('data.statut', 'en_cours');

        $this->assertTrue(
            LearningPathEnrollment::where('user_id', $user->id)
                ->where('learning_path_id', $this->path->id)
                ->exists()
        );

        // Lecture du module
        $showResponse = $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module1->id}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('data.titre', 'Module 1 : Fondations');
        $showResponse->assertJsonPath('data.statut', 'en_cours');
        $showResponse->assertJsonPath('data.exercices_total', 1);
        $showResponse->assertJsonPath('data.exercices_passes', 0);
        $showResponse->assertJsonPath('data.quete_finale.debloquee', true);
    }

    #[Test]
    public function les_reponses_qcm_sont_validees_serveur_sans_divulgation_des_bonnes_reponses_ni_regles(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user, ['read', 'write']);
        app(ModuleProgressionService::class)->enroll($user, $this->path);

        // Vérification de la ressource GET : les options sont exposées mais JAMAIS la réponse 'correct', ni 'explanation', ni 'validation_rules'
        $moduleResponse = $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module1->id}");
        $moduleResponse->assertOk();
        $exerciseJson = $moduleResponse->json('data.lecons.0.exercices.0');

        $this->assertArrayNotHasKey('validation_rules', $exerciseJson);
        $this->assertArrayNotHasKey('correct', $exerciseJson);
        $this->assertArrayNotHasKey('explanation', $exerciseJson);
        $this->assertArrayHasKey('options', $exerciseJson);
        $this->assertCount(3, $exerciseJson['options']);

        // Tentative erronée
        $fail = $this->postJson("/api/v1/exercises/{$this->exerciseQcm1->id}/attempt", [
            'reponse' => 'a',
        ]);
        $fail->assertStatus(201);
        $fail->assertJsonPath('data.reussi', false);
        // Le message d'erreur n'indique pas la bonne réponse ni l'explication
        $this->assertStringNotContainsString('La bonne réponse est', $fail->json('data.message'));
        $this->assertStringNotContainsString('<main>', $fail->json('data.message'));

        // Tentative réussie
        $success = $this->postJson("/api/v1/exercises/{$this->exerciseQcm1->id}/attempt", [
            'reponse' => 'b',
        ]);
        $success->assertStatus(201);
        $success->assertJsonPath('data.reussi', true);
        $this->assertStringContainsString('Bonne réponse', $success->json('data.message'));

        // Vérification en base de données
        $this->assertDatabaseHas('exercise_attempts', [
            'user_id' => $user->id,
            'lesson_exercise_id' => $this->exerciseQcm1->id,
            'passed' => true,
        ]);
    }

    #[Test]
    public function un_apprenant_peut_completer_le_parcours_via_les_quetes_finales_sans_faire_les_cours_ni_qcms(): void
    {
        $user = $this->makeUser();
        $trainer = $this->makeUser(['roles' => ['trainer']]);
        $progression = app(ModuleProgressionService::class);
        $questService = app(QuestService::class);
        $reviewService = app(SubmissionReviewService::class);

        // 1. Inscription au parcours
        $progression->enroll($user, $this->path);

        // 2. AUCUN chapitre ouvert, AUCUN QCM passé : le module 1 est 'en_cours' et sa quête est accessible
        $this->assertSame('en_cours', $progression->moduleStatus($user, $this->module1));
        $this->assertTrue($progression->canSubmitFinalQuest($user, $this->quest1));

        // Le module 2 reste strictement verrouillé tant que le module 1 n'est pas approuvé par un formateur
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));
        $this->assertFalse($progression->canSubmitFinalQuest($user, $this->quest2));

        // 3. Soumission directe de la quête finale Module 1 sans faire de QCM
        $questService->enroll($user, $this->quest1);
        $submission1 = $questService->submitStep(
            $user,
            $this->quest1,
            $this->quest1Step,
            ['content' => 'https://github.com/mon-livrable-sans-qcm']
        );

        $this->assertSame('en_attente', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));

        // 4. Formateur approuve la quête finale Module 1
        $subRecord1 = Submission::where('user_id', $user->id)
            ->where('quest_id', $this->quest1->id)
            ->firstOrFail();

        $reviewService->review($subRecord1, $trainer, SubmissionStatus::Approved, 'Livrable validé sans passer les cours.');

        // Module 1 est validé ('termine'), ce qui débloque le Module 2
        $this->assertSame('termine', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('en_cours', $progression->moduleStatus($user, $this->module2));
        $this->assertTrue($progression->canSubmitFinalQuest($user, $this->quest2));

        // 5. Soumission directe de la quête finale Module 2 toujours sans faire de QCM
        $questService->enroll($user, $this->quest2);
        $submission2 = $questService->submitStep(
            $user,
            $this->quest2,
            $this->quest2Step,
            ['content' => 'https://github.com/mon-livrable-module2']
        );

        $this->assertSame('en_attente', $progression->moduleStatus($user, $this->module2));

        // 6. Formateur approuve la quête finale Module 2
        $subRecord2 = Submission::where('user_id', $user->id)
            ->where('quest_id', $this->quest2->id)
            ->firstOrFail();

        $reviewService->review($subRecord2, $trainer, SubmissionStatus::Approved, 'Module 2 validé avec succès.');

        $this->assertSame('termine', $progression->moduleStatus($user, $this->module2));

        // Progression globale du parcours : 100% sans aucun exercice réalisé
        $progress = $progression->pathProgress($user, $this->path);
        $this->assertSame(100.0, $progress['progression_pourcentage']);
        $this->assertSame(2, $progress['modules_termines']);
    }

    #[Test]
    public function les_tentatives_ou_echecs_qcm_ne_bloquent_pas_la_soumission_de_la_quete_finale(): void
    {
        $user = $this->makeUser();
        $progression = app(ModuleProgressionService::class);
        $questService = app(QuestService::class);

        $progression->enroll($user, $this->path);

        // Échec intentionnel au quiz
        app(\App\Services\ExerciseValidationService::class)->validateAndRecord(
            $user,
            $this->exerciseQcm1,
            'c' // Mauvaise réponse
        );

        $summary = $progression->exerciseSummary($user, $this->module1);
        $this->assertSame(0, $summary['passes']);
        $this->assertFalse($summary['termines']);

        // Même après échec au quiz, la quête finale reste débloquée et submittable
        $this->assertTrue($progression->canSubmitFinalQuest($user, $this->quest1));

        $questService->enroll($user, $this->quest1);
        $submission = $questService->submitStep(
            $user,
            $this->quest1,
            $this->quest1Step,
            ['content' => 'https://github.com/mon-code-apres-echec-quiz']
        );

        $this->assertSame(SubmissionStatus::Pending, $submission->status);
    }

    #[Test]
    public function un_apprenant_non_inscrit_ne_peut_pas_lire_ni_tenter_un_exercice(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user, ['read', 'write']);

        $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module1->id}")
            ->assertForbidden();

        $this->postJson("/api/v1/exercises/{$this->exerciseQcm1->id}/attempt", [
            'reponse' => 'b',
        ])->assertForbidden();
    }

    #[Test]
    public function un_module_suivant_reste_inaccessible_directement_par_api(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user, ['read', 'write']);
        app(ModuleProgressionService::class)->enroll($user, $this->path);

        $this->getJson("/api/v1/paths/{$this->path->id}/modules/{$this->module2->id}")
            ->assertForbidden();

        $this->postJson("/api/v1/exercises/{$this->exerciseQcm2->id}/attempt", [
            'reponse' => 'a',
        ])->assertUnprocessable();
    }

    #[Test]
    public function soumission_attente_rejet_nouvelle_soumission_et_approbation(): void
    {
        $user = $this->makeUser();
        $trainer = $this->makeUser(['roles' => ['trainer']]);
        $progression = app(ModuleProgressionService::class);
        $questService = app(QuestService::class);
        $reviewService = app(SubmissionReviewService::class);

        // 1. Inscription parcours
        $progression->enroll($user, $this->path);

        // Module 1 est 'en_cours', Module 2 reste verrouillé
        $this->assertSame('en_cours', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));

        // 2. Soumission quête finale
        $questService->enroll($user, $this->quest1);
        $submission1 = $questService->submitStep(
            $user,
            $this->quest1,
            $this->quest1Step,
            ['content' => 'https://github.com/code-v1']
        );

        // Module 1 passe en attente, Module 2 reste verrouillé
        $this->assertSame('en_attente', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));

        // 3. Formateur rejette avec un commentaire
        $generalSub = Submission::where('user_id', $user->id)
            ->where('quest_id', $this->quest1->id)
            ->firstOrFail();

        $reviewService->review($generalSub, $trainer, SubmissionStatus::Rejected, 'Manque les styles responsive.');

        // Module 1 passe à "a_revoir", Module 2 reste verrouillé
        $this->assertSame('a_revoir', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));

        // 4. Apprenant soumet une 2e tentative (autorisée et tracée)
        $submission2 = $questService->submitStep(
            $user,
            $this->quest1,
            $this->quest1Step,
            ['content' => 'https://github.com/code-v2-responsive']
        );

        $this->assertSame(2, $submission2->attempt_number);
        $this->assertSame('en_attente', $progression->moduleStatus($user, $this->module1));
        $this->assertSame('verrouille', $progression->moduleStatus($user, $this->module2));

        // Chaque tentative possède sa propre entrée de file formateur et son propre contenu.
        $generalSub2 = Submission::query()
            ->where('quest_submission_id', $submission2->getKey())
            ->firstOrFail();
        $this->assertNotSame($generalSub->getKey(), $generalSub2->getKey());
        $this->assertSame('https://github.com/code-v2-responsive', $generalSub2->body);

        // Une décision tardive sur la tentative rejetée ne peut pas approuver la tentative 2.
        try {
            $reviewService->review($generalSub, $trainer, SubmissionStatus::Approved, 'Ancienne tentative.');
            $this->fail('Une tentative déjà rejetée ne doit pas pouvoir être approuvée ensuite.');
        } catch (\App\Exceptions\BusinessRuleException $exception) {
            $this->assertSame(409, $exception->status());
        }

        // 5. Formateur approuve exactement la tentative 2
        $reviewService->review($generalSub2, $trainer, SubmissionStatus::Approved, 'Excellent travail, validé.');

        // Module 1 passe à "termine"
        $this->assertSame('termine', $progression->moduleStatus($user, $this->module1));

        // Module 2 devient accessible après validation du module 1.
        $this->assertSame('en_cours', $progression->moduleStatus($user, $this->module2));

        $this->assertSame(SubmissionStatus::Rejected, $submission1->refresh()->status);
        $this->assertSame(SubmissionStatus::Approved, $submission2->refresh()->status);

        // Vérification de l'attribution unique des XP
        $xpEntries = DB::table('xp_ledger')
            ->where('user_id', $user->id)
            ->where('source_event', XpSource::SUBMISSION_APPROVED)
            ->get();

        $this->assertCount(1, $xpEntries);
        $this->assertSame(100, (int) $xpEntries->first()->xp_delta);
    }

    #[Test]
    public function un_apprenant_ne_peut_pas_approuver_une_production(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);
        $sub = Submission::create([
            'user_id' => $apprenant->id,
            'title' => 'Test',
            'status' => 'en_attente',
        ]);

        Sanctum::actingAs($apprenant, ['read', 'write']);
        $response = $this->postJson("/api/v1/submissions/{$sub->id}/approve", [
            'decision' => 'approuvee',
        ]);

        $response->assertForbidden();
    }
}
