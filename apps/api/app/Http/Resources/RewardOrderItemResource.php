<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\RewardOrderItem
 */
class RewardOrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'recompense_id' => $this->reward_id,
            'nom' => $this->whenLoaded('reward', fn (): ?string => $this->reward?->name),
            'quantite' => (int) $this->quantity,
            'prix_unitaire' => (int) $this->unit_cost,
            'total' => (int) $this->quantity * (int) $this->unit_cost,
        ];
    }
}
