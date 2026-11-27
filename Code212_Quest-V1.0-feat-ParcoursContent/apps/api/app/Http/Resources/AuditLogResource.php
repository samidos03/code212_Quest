<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\AuditLog
 */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'acteur_id' => $this->actor_id,
            'action' => $this->action,
            'cible_type' => $this->target_type,
            'cible_id' => $this->target_id,
            'justification' => $this->justification,
            'metadonnees' => $this->metadata,
            'ip' => $this->ip_address,
            'date' => $this->created_at?->toIso8601String(),
        ];
    }
}
