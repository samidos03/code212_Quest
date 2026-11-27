<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\IssuedBadge
 */
class IssuedBadgeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->badge_code,
            'nom' => $this->whenLoaded('rule', fn (): ?string => $this->rule?->name),
            'rarete' => $this->whenLoaded('rule', fn (): ?string => $this->rule?->rarity),
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'preuve' => $this->evidence,
            'credential_jsonld' => $this->credential_jsonld,
            'obtenu_le' => $this->issued_at?->toIso8601String(),
            'revoque_le' => $this->revoked_at?->toIso8601String(),
        ];
    }
}
