<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\QuestStep
 */
class QuestStepResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quete_id' => $this->quest_id,
            'titre' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'validation' => $this->validation_mode,
            'ordre' => (int) $this->order_index,
            'xp' => (int) $this->xp_reward,
            'duree_minutes' => (int) $this->duration_minutes,
            'soumission' => QuestSubmissionResource::collection($this->whenLoaded('submissions')),
        ];
    }
}
