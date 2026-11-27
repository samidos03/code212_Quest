<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;

/**
 * Autorisations sur les productions soumises a approbation.
 */
class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isTrainer();
    }

    public function view(User $user, Submission $submission): bool
    {
        return $user->isTrainer() || (int) $submission->user_id === (int) $user->getKey();
    }

    public function approve(User $user, Submission $submission): bool
    {
        return $user->isTrainer();
    }

    public function reject(User $user, Submission $submission): bool
    {
        return $user->isTrainer();
    }

    public function create(User $user): bool
    {
        return true;
    }
}
