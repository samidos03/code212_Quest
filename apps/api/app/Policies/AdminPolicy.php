<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

/**
 * Autorisations d'administration.
 */
class AdminPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isModerator();
    }

    public function viewAnalytics(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manageQuests(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manageStudents(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manageRules(User $user): bool
    {
        return $user->isAdmin();
    }

    public function viewModeration(User $user): bool
    {
        return $user->isModerator();
    }

    public function resolveReports(User $user): bool
    {
        return $user->isModerator();
    }

    public function viewAudit(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manageOrders(User $user): bool
    {
        return $user->isAdmin();
    }
}
