<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Reward;
use App\Models\User;

/**
 * Autorisations sur la boutique.
 */
class RewardPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reward $reward): bool
    {
        return true;
    }

    public function purchase(User $user, Reward $reward): bool
    {
        return $reward->active;
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
