<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Challenge;
use App\Models\User;

/**
 * Autorisations sur les challenges.
 */
class ChallengePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Challenge $challenge): bool
    {
        return true;
    }

    public function join(User $user, Challenge $challenge): bool
    {
        return $challenge->status->acceptsEntries();
    }

    public function submit(User $user, Challenge $challenge): bool
    {
        return $challenge->status->acceptsEntries() || $challenge->status->value === 'closee';
    }

    public function manage(User $user): bool
    {
        return $user->isTrainer();
    }
}
