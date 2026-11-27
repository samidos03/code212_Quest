<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\RewardOrder
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'total' => (int) $this->total_cost,
            'articles' => $this->items_count,
            'note' => $this->note,
            'decide_le' => $this->decided_at?->toIso8601String(),
            'cree_le' => $this->created_at?->toIso8601String(),
            'lignes' => RewardOrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
