<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ForgeCategory;
use App\Models\User;

/**
 * Autorisations de moderation de la Forge.
 *
 * Un moderateur peut moderer les categories qui lui sont affectees
 * (`forge_moderator_assignments`) ; administrateurs et moderateurs globaux
 * peuvent moderer l'ensemble des categories.
 */
class ForgeModerationPolicy
{
    public function moderate(User $user, ForgeCategory $category): bool
    {
        if ($user->isAdmin() || $user->hasRole(\App\Enums\UserRole::Moderator)) {
            return true;
        }

        return $category->moderators()
            ->where('user_id', $user->getKey())
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function hide(User $user, ForgeCategory $category): bool
    {
        return $this->moderate($user, $category);
    }

    public function lock(User $user, ForgeCategory $category): bool
    {
        return $this->moderate($user, $category);
    }

    public function ban(User $user, ForgeCategory $category): bool
    {
        return $user->isAdmin() || $user->hasRole(\App\Enums\UserRole::Moderator);
    }
}
