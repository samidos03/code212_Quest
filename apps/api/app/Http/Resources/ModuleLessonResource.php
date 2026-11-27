<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ModuleLesson
 */
class ModuleLessonResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $exercises = $this->whenLoaded('exercises');
        if ($exercises instanceof \Illuminate\Support\Collection) {
            // Randomiser l'ordre des questions pour chaque chargement
            $exercises = $exercises->shuffle();
        }

        return [
            'id' => $this->id,
            'titre' => $this->title,
            'resume' => $this->summary,
            'points_cles' => $this->key_points ?? [],
            'contenu' => $this->content,
            'exemple_code' => $this->example_code,
            'exemple_explication' => $this->example_explanation,
            'ordre' => (int) $this->order_index,
            'duree_minutes' => (int) $this->estimated_minutes,
            'exercices' => LessonExerciseResource::collection($exercises),
        ];
    }
}
