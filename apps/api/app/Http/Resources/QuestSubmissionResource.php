<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\QuestSubmission
 */
class QuestSubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quete_id' => $this->quest_id,
            'etape_id' => $this->quest_step_id,
            'contenu' => $this->content,
            'commentaire' => $this->notes,
            'statut' => $this->status?->value,
            'statut_libelle' => $this->status?->label(),
            'xp_obtenu' => (int) $this->xp_awarded,
            'feedback' => $this->feedback,
            'envoye_le' => $this->submitted_at?->toIso8601String(),
            'corrige_le' => $this->reviewed_at?->toIso8601String(),
            'idempotence' => $this->idempotency_key,
        ];
    }
}
