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

        // Options aléatoires pour QCM sans JAMAIS divulguer la bonne réponse ni l'explication
        $options = [];
        $rules = $this->validation_rules ?? [];
        if ($this->validation_type === 'qcm' && isset($rules['options']) && is_array($rules['options'])) {
            $rawOptions = $rules['options'];
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
            'instructions' => $this->instructions,
            'code_depart' => $this->starter_code,
            'type_validation' => $this->validation_type,
            'options' => $options,
            'ordre' => (int) $this->order_index,
            'reussi' => $passed,
            'tentatives' => $attemptsCount,
        ];
    }
}
