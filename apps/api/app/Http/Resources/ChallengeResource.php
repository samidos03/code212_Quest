<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Challenge
 */
class ChallengeResource extends JsonResource
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
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'mode' => $this->mode,
            'debut_le' => $this->starts_at?->toIso8601String(),
            'fin_le' => $this->ends_at?->toIso8601String(),
            'regles' => $this->rules,
            'xp' => (int) $this->xp_reward,
            'germes' => (int) $this->germes_reward,
            'participants' => $this->whenCounted('entries'),
        ];
    }
}
