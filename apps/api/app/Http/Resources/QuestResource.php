<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Quest
 */
class QuestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'titre' => $this->title,
            'description' => $this->description,
            'voie' => $this->track_code,
            'difficulte' => $this->difficulty?->value,
            'difficulte_libelle' => $this->difficulty?->label(),
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'xp' => (int) $this->xp_reward,
            'germes' => (int) $this->germes_reward,
            'duree_minutes' => (int) $this->estimated_minutes,
            'debut_le' => $this->starts_at?->toIso8601String(),
            'fin_le' => $this->ends_at?->toIso8601String(),
            'couverture' => $this->cover_url,
            'etapes' => QuestStepResource::collection($this->whenLoaded('steps')),
            'nb_etapes' => $this->whenCounted('steps'),
            'nb_inscriptions' => $this->whenCounted('enrollments'),
            'progression' => $this->when(isset($this->pivot), fn (): int => (int) $this->pivot->progress),
        ];
    }
}
