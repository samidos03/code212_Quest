<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Submission
 */
class SubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->title,
            'contenu' => $this->body,
            'lien' => $this->artifact_url,
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'xp' => (int) $this->xp_reward,
            'germes' => (int) $this->germes_reward,
            'note' => $this->review_note,
            'envoye_le' => $this->created_at?->toIso8601String(),
            'corrige_le' => $this->reviewed_at?->toIso8601String(),
            'apprenant' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'pseudonyme' => $this->user->leaderboardAlias(),
            ]),
        ];
    }
}
