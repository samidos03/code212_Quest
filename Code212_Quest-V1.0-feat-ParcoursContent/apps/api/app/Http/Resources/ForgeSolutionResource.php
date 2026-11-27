<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ForgeSolution
 */
class ForgeSolutionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fil_id' => $this->thread_id,
            'contenu' => $this->body,
            'code' => $this->code_snippet,
            'votes' => $this->whenCounted('votes'),
            'acceptee' => $this->accepted_at !== null,
            'acceptee_le' => $this->accepted_at?->toIso8601String(),
            'germes' => (int) $this->germes_rewarded,
            'xp' => (int) $this->xp_rewarded,
            'auteur' => $this->whenLoaded('author', fn (): array => [
                'id' => $this->author->id,
                'pseudonyme' => $this->author->leaderboardAlias(),
            ]),
            'cree_le' => $this->created_at?->toIso8601String(),
        ];
    }
}
