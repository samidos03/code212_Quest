<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExerciseAttempt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\LessonExercise
 */
class LessonExerciseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $passed = false;
        $attemptsCount = 0;

        if ($user !== null) {
            $passed = ExerciseAttempt::query()
                ->where('user_id', $user->getKey())
                ->where('lesson_exercise_id', $this->id)
                ->where('passed', true)
                ->exists();

            $attemptsCount = ExerciseAttempt::query()
                ->where('user_id', $user->getKey())
                ->where('lesson_exercise_id', $this->id)
                ->count();
        }

        // QCM : une question tirée au hasard dans le pool (ou la question unique
        // historique), options mélangées. La bonne réponse et l'explication ne
        // sont jamais exposées.
        $options = [];
        $questionId = null;
        $instructions = $this->instructions;
        $poolSize = 0;
        $rules = $this->validation_rules ?? [];

        if ($this->validation_type === 'qcm') {
            $question = null;
            $pool = $rules['pool'] ?? null;

            if (is_array($pool) && $pool !== []) {
                $poolSize = count($pool);
                $question = $pool[array_rand($pool)];
                $questionId = isset($question['id']) ? (string) $question['id'] : null;
                $instructions = (string) ($question['question'] ?? $instructions);
            } elseif (isset($rules['options'])) {
                $poolSize = 1;
                $question = $rules;
            }

            $rawOptions = is_array($question['options'] ?? null) ? $question['options'] : [];
            shuffle($rawOptions);
            foreach ($rawOptions as $opt) {
                if (isset($opt['id'], $opt['label'])) {
                    $options[] = [
                        'id' => (string) $opt['id'],
                        'label' => (string) $opt['label'],
                    ];
                }
            }
        }

        return [
            'id' => $this->id,
            'titre' => $this->title,
            'instructions' => $instructions,
            'question_id' => $questionId,
            'taille_pool' => $poolSize,
            'code_depart' => $this->starter_code,
            'type_validation' => $this->validation_type,
            'options' => $options,
            'ordre' => (int) $this->order_index,
            'reussi' => $passed,
            'tentatives' => $attemptsCount,
        ];
    }
}
