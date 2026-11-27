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
            'quest_id' => $this->quest_id,
            'quest_step_id' => $this->quest_step_id,
            'titre' => $this->title,
            'contenu' => $this->body,
            'lien' => $this->artifact_url,
            'statut' => $this->status instanceof \App\Enums\SubmissionStatus ? $this->status->value : (string) $this->status,
            'statut_libelle' => $this->status instanceof \App\Enums\SubmissionStatus ? $this->status->label() : (string) $this->status,
            'status' => $this->status instanceof \App\Enums\SubmissionStatus ? $this->status->value : (string) $this->status,
            'xp' => (int) $this->xp_reward,
            'xpAwarded' => (int) $this->xp_reward,
            'germes' => (int) $this->germes_reward,
            'note' => $this->review_note,
            'feedback' => $this->review_note,
            'tentative' => $this->whenLoaded('questSubmission', fn (): ?int => $this->questSubmission?->attempt_number !== null ? (int) $this->questSubmission->attempt_number : null),
            'correcteur' => $this->whenLoaded('reviewer', fn (): ?array => $this->reviewer === null ? null : [
                'id' => $this->reviewer->id,
                'nom' => $this->reviewer->name,
            ]),
            'envoye_le' => $this->created_at?->toIso8601String(),
            'corrige_le' => $this->reviewed_at?->toIso8601String(),
            'apprenant' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'pseudonyme' => $this->user->leaderboardAlias(),
            ]),
        ];
    }
}
