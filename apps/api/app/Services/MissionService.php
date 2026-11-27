<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Exceptions\QuotaExceededException;
use App\Models\GermesLedgerEntry;
use App\Models\Mission;
use App\Models\MissionClaim;
use App\Models\User;
use App\Support\GermesSource;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Missions : revendication, recompense XP + germes.
 */
final class MissionService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly BadgeService $badges,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Revendique une mission (une seule fois par utilisateur et par mission).
     */
    public function claim(User $user, Mission $mission): MissionClaim
    {
        if (! $mission->isOpen()) {
            throw new BusinessRuleException('Cette mission n est pas ouverte.', [], 422);
        }

        $this->assertCriteria($user, $mission);

        try {
            /** @var MissionClaim $claim */
            $claim = DB::transaction(function () use ($user, $mission): MissionClaim {
                return MissionClaim::create([
                    'mission_id' => $mission->getKey(),
                    'user_id' => $user->getKey(),
                    'xp_awarded' => $mission->xp_reward,
                    'germes_awarded' => $mission->germes_reward,
                    'evidence' => ['claimed_at' => now()->toIso8601String()],
                ]);
            });
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23505' && ($exception->errorInfo[0] ?? null) !== '23505') {
                throw $exception;
            }

            throw new BusinessRuleException('Vous avez deja revendique cette mission.', [], 409);
        }

        if ($mission->xp_reward > 0) {
            $this->ledger->record(
                $user,
                XpSource::MISSION_CLAIMED,
                (string) $claim->getKey(),
                $mission->xp_reward,
                $mission->track_code
            );
        }

        if ($mission->germes_reward > 0) {
            /** @var User $lockedUser */
            $lockedUser = User::query()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $lockedUser->germes_balance = $lockedUser->germes_balance + $mission->germes_reward;
            $lockedUser->save();

            GermesLedgerEntry::create([
                'user_id' => $lockedUser->getKey(),
                'germes_delta' => $mission->germes_reward,
                'source_event' => GermesSource::MISSION_REWARD,
                'reference_id' => (string) $claim->getKey(),
            ]);
        }

        $this->audit->log(
            $user,
            'mission.claimed',
            'mission_claim',
            $claim->getKey(),
            null,
            ['mission_code' => $mission->code, 'xp' => $mission->xp_reward, 'germes' => $mission->germes_reward]
        );

        $this->badges->evaluate($user, 'mission_claimed', ['mission_code' => $mission->code]);

        return $claim;
    }

    /**
     * Verifie les criteres simples declares dans `criteria`.
     */
    private function assertCriteria(User $user, Mission $mission): void
    {
        /** @var array<string, mixed> $criteria */
        $criteria = $mission->criteria;

        $minQuests = (int) ($criteria['min_quests_completed'] ?? 0);

        if ($minQuests > 0) {
            $completed = (int) $user->questEnrollments()->where('status', 'terminee')->count();

            if ($completed < $minQuests) {
                throw new BusinessRuleException(
                    sprintf('Cette mission requiert %d quetes terminees.', $minQuests),
                    ['criteria' => [sprintf('Quetes terminees : %d/%d.', $completed, $minQuests)]],
                    422
                );
            }
        }

        $minXp = (int) ($criteria['min_xp'] ?? 0);

        if ($minXp > 0 && (int) $user->xp_total < $minXp) {
            throw new BusinessRuleException(
                sprintf('Cette mission requiert %d XP.', $minXp),
                ['criteria' => [sprintf('XP : %d/%d.', (int) $user->xp_total, $minXp)]],
                422
            );
        }

        $maxPerDay = (int) ($criteria['max_claims_per_day'] ?? 0);

        if ($maxPerDay > 0) {
            $claimsToday = (int) MissionClaim::query()
                ->where('user_id', $user->getKey())
                ->whereDate('claimed_at', today())
                ->count();

            if ($claimsToday >= $maxPerDay) {
                throw new QuotaExceededException(
                    sprintf('Quota atteint : %d missions maximum par jour.', $maxPerDay)
                );
            }
        }
    }
}
