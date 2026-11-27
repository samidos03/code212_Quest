<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SubmissionStatus;
use App\Exceptions\BusinessRuleException;
use App\Models\ExerciseAttempt;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\LessonExercise;
use App\Models\PathStep;
use App\Models\Quest;
use App\Models\QuestSubmission;
use App\Models\User;
use Illuminate\Database\QueryException;

class ModuleProgressionService
{
    /**
     * Vérifie si un apprenant est inscrit à un parcours.
     */
    public function isEnrolled(User $user, LearningPath $path): bool
    {
        return LearningPathEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('learning_path_id', $path->getKey())
            ->exists();
    }

    /**
     * Inscrit un apprenant à un parcours (idempotent).
     */
    public function enroll(User $user, LearningPath $path): LearningPathEnrollment
    {
        $existing = LearningPathEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('learning_path_id', $path->getKey())
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        try {
            return LearningPathEnrollment::create([
                'user_id' => $user->getKey(),
                'learning_path_id' => $path->getKey(),
                'status' => 'en_cours',
                'enrolled_at' => now(),
            ]);
        } catch (QueryException $e) {
            $existing = LearningPathEnrollment::query()
                ->where('user_id', $user->getKey())
                ->where('learning_path_id', $path->getKey())
                ->first();

            if ($existing !== null) {
                return $existing;
            }

            throw $e;
        }
    }

    /**
     * Calcule le statut dérivé d'un module pour un utilisateur :
     * - 'non_inscrit'
     * - 'verrouille'
     * - 'en_cours'
     * - 'en_attente'
     * - 'a_revoir'
     * - 'termine'
     */
    public function moduleStatus(User $user, PathStep $step): string
    {
        $path = $step->learningPath;
        if (! $this->isEnrolled($user, $path)) {
            return 'non_inscrit';
        }

        // Vérifier les modules précédents dans le parcours :
        // Le module suivant reste strictement verrouillé tant que les modules précédents ne sont pas approuvés
        if ($step->order_index > 1) {
            $previousSteps = PathStep::query()
                ->where('learning_path_id', $path->getKey())
                ->where('order_index', '<', $step->order_index)
                ->orderBy('order_index')
                ->get();

            foreach ($previousSteps as $prev) {
                if ($this->internalModuleStatus($user, $prev) !== 'termine') {
                    return 'verrouille';
                }
            }
        }

        return $this->internalModuleStatus($user, $step);
    }

    /**
     * Détermine si tous les exercices d'un module sont réussis.
     * Note : les exercices sont optionnels et ne bloquent pas la quête finale.
     */
    public function areExercisesCompleted(User $user, PathStep $step): bool
    {
        $exerciseIds = LessonExercise::query()
            ->whereHas('lesson', static fn ($q) => $q->where('path_step_id', $step->getKey()))
            ->pluck('id')
            ->all();

        if (empty($exerciseIds)) {
            return true;
        }

        $passedCount = ExerciseAttempt::query()
            ->where('user_id', $user->getKey())
            ->whereIn('lesson_exercise_id', $exerciseIds)
            ->where('passed', true)
            ->distinct('lesson_exercise_id')
            ->count('lesson_exercise_id');

        return $passedCount >= count($exerciseIds);
    }

    /**
     * Refuse l'accès au contenu d'un module verrouillé ou hors inscription.
     */
    public function assertCanAccessModule(User $user, PathStep $step): void
    {
        $status = $this->moduleStatus($user, $step);

        if (in_array($status, ['non_inscrit', 'verrouille'], true)) {
            throw new BusinessRuleException(
                'Inscrivez-vous au parcours et terminez les modules précédents pour accéder à ce module.',
                [],
                403
            );
        }
    }

    /**
     * Un exercice QCM peut être tenté dès que le module est accessible.
     */
    public function assertCanAttemptExercise(User $user, LessonExercise $exercise): void
    {
        $step = $exercise->lesson?->step;

        if ($step === null) {
            throw new BusinessRuleException('Cet exercice n’est rattaché à aucun module.', [], 404);
        }

        if (! $this->isEnrolled($user, $step->learningPath)) {
            throw new BusinessRuleException('Vous devez vous inscrire au parcours avant de tenter cet exercice.', [], 403);
        }

        $status = $this->moduleStatus($user, $step);
        if (in_array($status, ['non_inscrit', 'verrouille'], true)) {
            throw new BusinessRuleException('Ce module est verrouillé. Terminez les modules précédents pour y accéder.', [], 422);
        }

        $alreadyPassed = ExerciseAttempt::query()
            ->where('user_id', $user->getKey())
            ->where('lesson_exercise_id', $exercise->getKey())
            ->where('passed', true)
            ->exists();

        if ($alreadyPassed) {
            throw new BusinessRuleException('Vous avez déjà réussi ce quiz.', [], 409);
        }
    }

    /**
     * Résumé des exercices d'un module (total et réussis).
     *
     * @return array{total: int, passes: int, termines: bool}
     */
    public function exerciseSummary(User $user, PathStep $step): array
    {
        $exerciseIds = LessonExercise::query()
            ->whereHas('lesson', static fn ($q) => $q->where('path_step_id', $step->getKey()))
            ->pluck('id')
            ->all();

        $total = count($exerciseIds);
        if ($total === 0) {
            return ['total' => 0, 'passes' => 0, 'termines' => true];
        }

        $passedCount = ExerciseAttempt::query()
            ->where('user_id', $user->getKey())
            ->whereIn('lesson_exercise_id', $exerciseIds)
            ->where('passed', true)
            ->distinct('lesson_exercise_id')
            ->count('lesson_exercise_id');

        return [
            'total' => $total,
            'passes' => $passedCount,
            'termines' => $passedCount >= $total,
        ];
    }

    /**
     * Vérifie si la quête finale du module peut être soumise par l'apprenant.
     * Les cours et exercices sont strictement optionnels :
     * seule la validation des modules précédents conditionne l'accès à la quête finale.
     */
    public function canSubmitFinalQuest(User $user, Quest $quest): bool
    {
        $step = $this->stepForQuest($quest);
        if ($step === null) {
            return true; // Quête hors parcours, autorisée
        }

        $status = $this->moduleStatus($user, $step);

        return in_array($status, ['en_cours', 'disponible', 'quete_debloquee', 'a_revoir'], true);
    }

    /**
     * Vérifie l'inscription au parcours et l'état serveur avant la soumission finale.
     */
    public function assertCanSubmitFinalQuest(User $user, Quest $quest): void
    {
        $step = $this->stepForQuest($quest);

        if ($step === null) {
            return;
        }

        $path = $step->learningPath;
        if (! $this->isEnrolled($user, $path)) {
            throw new BusinessRuleException('Vous devez vous inscrire au parcours avant de soumettre cette quête.', [], 403);
        }

        if (! $this->canSubmitFinalQuest($user, $quest)) {
            throw new BusinessRuleException(
                'Cette quête finale est verrouillée tant que les modules précédents ne sont pas validés par un formateur.',
                [],
                422
            );
        }
    }

    /**
     * Recherche le module de parcours associé à une quête.
     */
    public function stepForQuest(Quest $quest): ?PathStep
    {
        return PathStep::query()
            ->where('quest_id', $quest->getKey())
            ->orWhere(function ($q) use ($quest): void {
                $q->where('ref_type', 'quete')
                    ->where(function ($sub) use ($quest): void {
                        $sub->where('ref_id', (string) $quest->getKey())
                            ->orWhere('ref_id', $quest->code);
                    });
            })
            ->first();
    }

    /**
     * Avancement global de l'apprenant sur un parcours.
     *
     * @return array<string, mixed>
     */
    public function pathProgress(User $user, LearningPath $path): array
    {
        $steps = $path->steps()->orderBy('order_index')->get();
        $total = $steps->count();
        $completed = 0;
        $modulesData = [];

        $enrolled = $this->isEnrolled($user, $path);

        foreach ($steps as $step) {
            $status = $enrolled ? $this->moduleStatus($user, $step) : 'non_inscrit';
            if ($status === 'termine') {
                $completed++;
            }

            $summary = $this->exerciseSummary($user, $step);
            $modulesData[] = [
                'id' => $step->getKey(),
                'titre' => $step->title,
                'description' => $step->description,
                'ordre' => $step->order_index,
                'statut' => $status,
                'exercices_total' => $summary['total'],
                'exercices_passes' => $summary['passes'],
                'quete_id' => $step->quest_id,
            ];
        }

        $percent = $total > 0 ? round(($completed / $total) * 100, 1) : 0.0;

        return [
            'inscrit' => $enrolled,
            'progression_pourcentage' => $percent,
            'modules_total' => $total,
            'modules_termines' => $completed,
            'modules' => $modulesData,
        ];
    }

    private function internalModuleStatus(User $user, PathStep $step): string
    {
        $quest = $step->quest ?? ($step->ref_id ? Quest::where('code', $step->ref_id)->orWhere('id', is_numeric($step->ref_id) ? (int)$step->ref_id : 0)->first() : null);
        if ($quest === null) {
            return 'termine';
        }

        /** @var QuestSubmission|null $latest */
        $latest = QuestSubmission::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $quest->getKey())
            ->latest('attempt_number')
            ->first();

        if ($latest === null) {
            return 'en_cours';
        }

        $status = $latest->status instanceof SubmissionStatus ? $latest->status->value : (string) $latest->status;

        return match ($status) {
            'approuvee' => 'termine',
            'en_attente' => 'en_attente',
            'rejetee', 'a_revoir' => 'a_revoir',
            default => 'en_cours',
        };
    }
}
