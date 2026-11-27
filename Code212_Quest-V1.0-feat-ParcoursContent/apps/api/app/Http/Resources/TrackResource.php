<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ProgressionTrack
 */
class TrackResource extends JsonResource
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
            'couleur' => $this->color,
        ];
    }
}
