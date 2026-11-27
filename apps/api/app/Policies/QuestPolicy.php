<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Quest;
use App\Models\User;

/**
 * Autorisations sur les quetes.
 */
class QuestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Quest $quest): bool
    {
        return $quest->status->value === 'publie' || $user->isTrainer();
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, Quest $quest): bool
    {
        return $user->isAdmin() || (int) $quest->created_by === (int) $user->getKey();
    }

    public function delete(User $user, Quest $quest): bool
    {
        return $user->isAdmin();
    }

    public function enroll(User $user, Quest $quest): bool
    {
        return true;
    }

    public function submitStep(User $user, Quest $quest): bool
    {
        return true;
    }
}
