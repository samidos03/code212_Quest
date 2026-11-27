<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\LearningPath
 */
class LearningPathResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $progressionService = app(\App\Services\ModuleProgressionService::class);
        $user = $request->user();
        $progress = $user ? $progressionService->pathProgress($user, $this->resource) : null;

        return [
            'id' => $this->id,
            'code' => $this->code,
            'titre' => $this->title,
            'description' => $this->description,
            'voie' => $this->track_code,
            'niveau_min' => (int) $this->level_no_from,
            'niveau_max' => (int) $this->level_no_to,
            'bonus_xp' => (int) $this->xp_bonus,
            'bonus_germes' => (int) $this->germes_bonus,
            'publie' => (bool) $this->published,
            'inscrit' => $progress ? (bool) $progress['inscrit'] : false,
            'progression' => $progress ? (float) $progress['progression_pourcentage'] : 0.0,
            'modules_total' => $progress ? (int) $progress['modules_total'] : $this->steps()->count(),
            'modules_termines' => $progress ? (int) $progress['modules_termines'] : 0,
            'modules' => $progress ? $progress['modules'] : [],
            'etapes' => PathStepResource::collection($this->whenLoaded('steps')),
            'nb_etapes' => $this->whenCounted('steps'),
        ];
    }
}
