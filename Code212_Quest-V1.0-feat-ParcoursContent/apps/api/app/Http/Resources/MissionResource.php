<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Mission
 */
class MissionResource extends JsonResource
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
            'type' => $this->kind?->value,
            'type_libelle' => $this->kind?->label(),
            'xp' => (int) $this->xp_reward,
            'germes' => (int) $this->germes_reward,
            'criteres' => $this->criteria,
            'debut_le' => $this->starts_at?->toIso8601String(),
            'fin_le' => $this->ends_at?->toIso8601String(),
            'actif' => (bool) $this->active,
            'revendiquee' => $this->when(isset($this->pivot), fn (): bool => (bool) $this->pivot->claimed),
        ];
    }
}
