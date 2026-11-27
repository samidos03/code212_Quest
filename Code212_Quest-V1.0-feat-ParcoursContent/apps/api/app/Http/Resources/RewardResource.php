<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Reward
 */
class RewardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'nom' => $this->name,
            'description' => $this->description,
            'categorie' => $this->category,
            'voie' => $this->track_code,
            'cout' => (int) $this->cost,
            'stock' => $this->stock,
            'disponible' => $this->stock === null || $this->stock > 0,
            'image' => $this->image_url,
            'approbation_requise' => (bool) $this->requires_approval,
            'actif' => (bool) $this->active,
        ];
    }
}
