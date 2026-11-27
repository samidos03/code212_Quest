<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ForgeThread
 */
class ForgeThreadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categorie_id' => $this->category_id,
            'categorie' => $this->whenLoaded('category', fn (): ?string => $this->category?->name),
            'titre' => $this->title,
            'contenu' => $this->body,
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'tags' => $this->tags,
            'auteur' => $this->whenLoaded('author', fn (): array => [
                'id' => $this->author->id,
                'pseudonyme' => $this->author->leaderboardAlias(),
            ]),
            'solutions' => ForgeSolutionResource::collection($this->whenLoaded('solutions')),
            'nb_solutions' => $this->whenCounted('solutions'),
            'vue' => (int) $this->view_count,
            'cree_le' => $this->created_at?->toIso8601String(),
        ];
    }
}
