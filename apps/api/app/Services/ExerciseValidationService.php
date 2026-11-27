<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExerciseAttempt;
use App\Models\LessonExercise;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExerciseValidationService
{
    public function __construct(
        private readonly ModuleProgressionService $progression,
    ) {
    }

    /**
     * Valide la réponse d'un apprenant côté serveur et enregistre la tentative.
     * Les réponses et règles de validation ne sont jamais divulguées avant soumission.
     *
     * @return array{reussi: bool, message: string, tentative: int}
     */
    public function validateAndRecord(User $user, LessonExercise $exercise, string $answer, ?string $questionId = null): array
    {
        $answerClean = trim($answer);
        $rules = $exercise->validation_rules ?? [];
        $type = $exercise->validation_type;

        $passed = false;
        $feedback = 'Ce n’est pas la bonne réponse. Relisez les points clés et réessayez !';

        switch ($type) {
            case 'qcm':
                $rules = $this->qcmQuestion($rules, $questionId);
                $expected = strtolower(trim((string) ($rules['correct'] ?? '')));
                if ($expected !== '' && strtolower($answerClean) === $expected) {
                    $passed = true;
                    $explanation = trim((string) ($rules['explanation'] ?? ''));
                    $feedback = $explanation !== ''
                        ? 'Bonne réponse ! ' . $explanation
                        : 'Excellente réponse !';
                }
                break;

            case 'regex':
                $pattern = $rules['pattern'] ?? null;
                if ($pattern && @preg_match($pattern, $answerClean)) {
                    $passed = true;
                    $feedback = 'Exercice réussi avec succès !';
                }
                break;

            case 'exact':
                $expected = trim((string) ($rules['expected'] ?? ''));
                if ($expected !== '' && hash_equals($expected, $answerClean)) {
                    $passed = true;
                    $feedback = 'Exercice réussi avec succès !';
                }
                break;

            case 'keywords':
            default:
                $keywords = $rules['keywords'] ?? [];
                if (is_array($keywords) && count($keywords) > 0) {
                    $allFound = true;
                    $normalized = strtolower($answerClean);
                    foreach ($keywords as $kw) {
                        if (! str_contains($normalized, strtolower((string) $kw))) {
                            $allFound = false;
                            break;
                        }
                    }
                    if ($allFound) {
                        $passed = true;
                        $feedback = 'Exercice réussi avec succès !';
                    }
                }
                break;
        }

        $stored = $questionId !== null && $type === 'qcm' ? $questionId.':'.$answerClean : $answerClean;

        return DB::transaction(function () use ($user, $exercise, $stored, $passed, $feedback): array {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->getKey());
            $this->progression->assertCanAttemptExercise($lockedUser, $exercise);

            $attemptNumber = ExerciseAttempt::query()
                ->where('user_id', $lockedUser->getKey())
                ->where('lesson_exercise_id', $exercise->getKey())
                ->count() + 1;

            ExerciseAttempt::create([
                'user_id' => $lockedUser->getKey(),
                'lesson_exercise_id' => $exercise->getKey(),
                'answer' => $stored,
                'passed' => $passed,
                'feedback' => $feedback,
                'attempt_number' => $attemptNumber,
            ]);

            return [
                'reussi' => $passed,
                'message' => $feedback,
                'tentative' => $attemptNumber,
            ];
        });
    }

    /**
     * Règles de la question visée : entrée du pool si le QCM en a un, sinon la
     * question unique historique.
     *
     * @param  array<string, mixed>  $rules
     * @return array<string, mixed>
     */
    private function qcmQuestion(array $rules, ?string $questionId): array
    {
        $pool = $rules['pool'] ?? null;
        if (! is_array($pool) || $pool === []) {
            return $rules;
        }

        foreach ($pool as $question) {
            if ($questionId !== null && (string) ($question['id'] ?? '') === $questionId) {
                return $question;
            }
        }

        throw ValidationException::withMessages([
            'question_id' => ['Question inconnue pour ce QCM. Rechargez le chapitre.'],
        ]);
    }
}
