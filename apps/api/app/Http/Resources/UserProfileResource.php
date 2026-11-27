<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->name,
            'email' => $this->email,
            'matricule' => $this->uca_matricule,
            'filiere' => $this->filiere,
            'promotion' => $this->promotion,
            'pseudonyme' => $this->pseudonym,
            'avatar' => $this->avatar_url,
            'langue' => $this->locale,
            'roles' => array_map(
                static fn (string $role): array => [
                    'code' => $role,
                    'libelle' => UserRole::tryFrom($role)?->label() ?? $role,
                ],
                $this->roles ?? []
            ),
            'voie' => $this->track_code,
            'niveau' => (int) $this->level_no,
            'xp' => (int) $this->xp_total,
            'germes' => (int) $this->germes_balance,
            'consentement' => [
                'mode_competition' => (bool) $this->competition_opt_in,
                'anonymise_classement' => (bool) $this->anonymize_leaderboard,
            ],
            'cree_le' => $this->created_at?->toIso8601String(),
            'derniere_connexion' => $this->last_login_at?->toIso8601String(),
        ];
    }
}
