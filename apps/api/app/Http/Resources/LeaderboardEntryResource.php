<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Entree de classement : aucune donnee personnelle n'est exposee.
 */
class LeaderboardEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $entry */
        $entry = $this->resource;

        return [
            'rang' => (int) ($entry['rang'] ?? 0),
            'user_id' => (int) ($entry['user_id'] ?? 0),
            'pseudonyme' => $entry['pseudonyme'] ?? null,
            'niveau' => (int) ($entry['niveau'] ?? 1),
            'xp' => (int) ($entry['xp'] ?? 0),
            'voie' => $entry['voie'] ?? null,
        ];
    }
}
