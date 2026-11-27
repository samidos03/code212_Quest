<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\BadgeRule
 */
class BadgeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'nom' => $this->name,
            'description' => $this->description,
            'rarete' => $this->rarity,
            'voie' => $this->track_code,
            'emetteur' => $this->issuer,
            'criteres' => $this->rule,
            'image' => $this->image_url,
            'actif' => (bool) $this->active,
            'delivre' => $this->whenLoaded('issuedBadges', fn (): bool => $this->issuedBadges->isNotEmpty()),
        ];
    }
}
