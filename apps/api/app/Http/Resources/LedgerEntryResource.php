<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\XpLedgerEntry
 */
class LedgerEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evenement' => $this->source_event,
            'xp' => (int) $this->xp_delta,
            'voie' => $this->track_type,
            'reference' => $this->reference_id,
            'version_bareme' => (int) $this->rule_version,
            'justification' => $this->admin_justification,
            'date' => $this->created_at?->toIso8601String(),
        ];
    }
}
