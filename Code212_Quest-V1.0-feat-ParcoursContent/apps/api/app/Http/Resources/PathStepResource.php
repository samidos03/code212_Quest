<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PathStep
 */
class PathStepResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->title,
            'description' => $this->description,
            'type' => $this->kind,
            'reference_type' => $this->ref_type,
            'reference_id' => $this->ref_id,
            'ordre' => (int) $this->order_index,
            'xp' => (int) $this->xp_reward,
        ];
    }
}
