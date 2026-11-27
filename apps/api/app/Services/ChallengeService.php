<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Challenge;
use App\Models\ChallengeEntry;
use App\Models\ChallengeSubmission;
use App\Models\User;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Challenges : inscription, depot de code, cloture.
 */
final class ChallengeService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly BadgeService $badges,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Inscrit un apprenant a un challenge (idempotent).
     */
    public function join(User $user, Challenge $challenge, ?int $teammateId = null): ChallengeEntry
    {
        if (! $challenge->status->acceptsEntries()) {
            throw new BusinessRuleException('Ce challenge n accepte plus de participants.', [], 422);
        }

        $existing = ChallengeEntry::query()
            ->where('challenge_id', $challenge->getKey())
            ->where('user_id', $user->getKey())
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $maxEntries = (int) config('quests.challenges.max_entries', 500);

        if ($maxEntries > 0 && (int) $challenge->entries()->count() >= $maxEntries) {
            throw new BusinessRuleException('Le nombre maximal de participants est atteint.', [], 422);
        }

        try {
            /** @var ChallengeEntry $entry */
            $entry = ChallengeEntry::create([
                'challenge_id' => $challenge->getKey(),
                'user_id' => $user->getKey(),
                'teammate_id' => $teammateId,
                'status' => 'en_cours',
                'joined_at' => now(),
            ]);
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23505' && ($exception->errorInfo[0] ?? null) !== '23505') {
                throw $exception;
            }

            $existing = ChallengeEntry::query()
                ->where('challenge_id', $challenge->getKey())
                ->where('user_id', $user->getKey())
                ->first();

            if ($existing === null) {
                throw $exception;
            }

            return $existing;
        }

        $this->badges->evaluate($user, 'challenge_joined', ['challenge_code' => $challenge->code]);

        return $entry;
    }

    /**
     * Depot d'une solution de code.
     */
    public function submit(
        User $user,
        Challenge $challenge,
        ?string $repositoryUrl,
        ?string $notes,
        bool $finished = false,
    ): ChallengeSubmission {
        $entry = ChallengeEntry::query()
            ->where('challenge_id', $challenge->getKey())
            ->where('user_id', $user->getKey())
            ->first();

        if ($entry === null) {
            throw new BusinessRuleException('Vous n etes pas inscrit a ce challenge.', [], 403);
        }

        /** @var ChallengeSubmission $submission */
        $submission = ChallengeSubmission::create([
            'challenge_entry_id' => $entry->getKey(),
            'repository_url' => $repositoryUrl,
            'notes' => $notes,
            'submitted_at' => now(),
        ]);

        if ($finished) {
            $entry->forceFill(['status' => 'termine', 'finished_at' => now()])->save();

            $rule = $this->ledger->ruleFor(XpSource::CHALLENGE_COMPLETED, $challenge->track_code);

            if ($rule !== null && $rule->xp_amount > 0) {
                $this->ledger->record(
                    $user,
                    XpSource::CHALLENGE_COMPLETED,
                    (string) $entry->getKey(),
                    $rule->xp_amount,
                    $challenge->track_code
                );
            }

            $this->badges->evaluate($user, 'challenge_joined', ['challenge_code' => $challenge->code]);
        }

        $this->audit->log(
            $user,
            'challenge.submitted',
            'challenge_submission',
            $submission->getKey(),
            null,
            ['challenge_code' => $challenge->code, 'finished' => $finished]
        );

        return $submission;
    }
}
