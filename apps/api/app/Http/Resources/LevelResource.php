<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Level
 */
class LevelResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'niveau' => (int) $this->level_no,
            'titre' => $this->title,
            'seuil_xp' => (int) $this->xp_threshold,
            'prerequis' => $this->requirements,
            'avantages' => $this->benefits,
        ];
    }
}
