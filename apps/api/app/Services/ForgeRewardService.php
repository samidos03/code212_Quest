<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ForgeThreadStatus;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\QuotaExceededException;
use App\Models\ForgeSolution;
use App\Models\ForgeThread;
use App\Models\GermesLedgerEntry;
use App\Models\User;
use App\Support\GermesSource;
use App\Support\XpSource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Recompense des solutions de la Forge (« La Forge »).
 *
 * Invariants :
 * - l'auteur d'une solution ne peut pas la recompenser lui-meme ;
 * - 5 solutions remunerationes maximum par auteur et par jour ;
 * - 2 solutions remunerationes maximum par demandeur et par semaine ;
 * - toute recompense laisse une trace d'audit.
 */
final class ForgeRewardService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly BadgeService $badges,
        private readonly AuditLogger $audit,
        private readonly Codep212ConfigService $config,
    ) {
    }

    /**
     * Valide une solution et recompense son auteur.
     */
    public function accept(ForgeThread $thread, ForgeSolution $solution, User $requester, ?string $note = null): ForgeSolution
    {
        if ($solution->accepted_at !== null) {
            throw new BusinessRuleException('Cette solution a deja ete acceptee.', [], 409);
        }

        // Seul le demandeur (auteur du fil) ou un formateur/modérateur choisit la solution.
        if ((int) $thread->author_id !== (int) $requester->getKey() && ! $requester->isTrainer()) {
            throw new BusinessRuleException(
                'Seul l auteur de la question ou un formateur peut accepter une solution.',
                [],
                403
            );
        }

        $threadStatus = $thread->status instanceof ForgeThreadStatus ? $thread->status : ForgeThreadStatus::tryFrom((string) $thread->status);
        if ($threadStatus === ForgeThreadStatus::Resolved) {
            throw new BusinessRuleException('Ce fil a deja une solution acceptee.', [], 409);
        }

        if ((int) $solution->author_id === (int) $requester->getKey()) {
            throw new BusinessRuleException(
                'Auto-validation interdite : l auteur d une solution ne peut pas la recompenser.',
                ['solution' => ['Auto-validation interdite.']],
                422
            );
        }

        if ((int) $thread->author_id === (int) $solution->author_id) {
            throw new BusinessRuleException(
                'Auto-validation interdite : le demandeur est l auteur de la solution.',
                ['solution' => ['Auto-validation interdite.']],
                422
            );
        }

        $this->assertAuthorDailyQuota($solution);
        $this->assertRequesterWeeklyQuota($requester);

        /** @var array<string, mixed> $forgeConfig */
        $forgeConfig = (array) $this->config->questsConfig()['forge'];
        $germes = (int) ($forgeConfig['germes_reward'] ?? 25);
        $xp = (int) ($forgeConfig['xp_reward'] ?? 50);

        $accepted = DB::transaction(function () use ($thread, $solution, $requester, $note, $germes, $xp): ForgeSolution {
            /** @var ForgeSolution $lockedSolution */
            $lockedSolution = ForgeSolution::query()->whereKey($solution->getKey())->lockForUpdate()->firstOrFail();

            /** @var User $author */
            $author = User::query()->whereKey($lockedSolution->author_id)->lockForUpdate()->firstOrFail();

            $lockedSolution->forceFill([
                'accepted_at' => now(),
                'accepted_by' => $requester->getKey(),
                'rewarded_at' => now(),
                'germes_rewarded' => $germes,
                'xp_rewarded' => $xp,
            ])->save();

            $thread->forceFill([
                'status' => ForgeThreadStatus::Resolved->value,
                'accepted_solution_id' => $lockedSolution->getKey(),
            ])->save();

            if ($germes > 0) {
                $author->germes_balance = $author->germes_balance + $germes;
                $author->save();

                GermesLedgerEntry::create([
                    'user_id' => $author->getKey(),
                    'germes_delta' => $germes,
                    'source_event' => GermesSource::FORGE_REWARD,
                    'reference_id' => (string) $lockedSolution->getKey(),
                ]);
            }

            if ($xp > 0) {
                $this->ledger->record(
                    $author,
                    XpSource::FORGE_SOLUTION_REWARDED,
                    (string) $lockedSolution->getKey(),
                    $xp,
                    $author->track_code
                );
            }

            $this->audit->log(
                $requester,
                'forge.solution_accepted',
                'forge_solution',
                $lockedSolution->getKey(),
                $note,
                [
                    'thread_id' => $thread->getKey(),
                    'author_id' => $author->getKey(),
                    'requester_id' => $requester->getKey(),
                    'germes' => $germes,
                    'xp' => $xp,
                ]
            );

            return $lockedSolution;
        });

        $this->badges->evaluate($accepted->author, 'forge_solution_rewarded', [
            'thread_id' => $thread->getKey(),
        ]);

        return $accepted;
    }

    /**
     * Quota : 5 solutions remunerationes maximum par auteur et par jour.
     */
    private function assertAuthorDailyQuota(ForgeSolution $solution): void
    {
        /** @var array<string, mixed> $forgeConfig */
        $forgeConfig = (array) $this->config->questsConfig()['forge'];
        $max = (int) ($forgeConfig['paid_solutions_per_day'] ?? 5);

        if ($max <= 0) {
            return;
        }

        $rewardedToday = ForgeSolution::query()
            ->where('author_id', $solution->author_id)
            ->whereNotNull('rewarded_at')
            ->where('rewarded_at', '>=', Carbon::now()->startOfDay())
            ->count();

        if ($rewardedToday >= $max) {
            throw new QuotaExceededException(
                sprintf('Quota atteint : %d solutions remunerationes maximum par jour.', $max)
            );
        }
    }

    /**
     * Quota : 2 solutions remunerationes maximum par demandeur et par semaine.
     */
    private function assertRequesterWeeklyQuota(User $requester): void
    {
        /** @var array<string, mixed> $forgeConfig */
        $forgeConfig = (array) $this->config->questsConfig()['forge'];
        $max = (int) ($forgeConfig['paid_solutions_per_requester_per_week'] ?? 2);

        if ($max <= 0) {
            return;
        }

        $rewardedThisWeek = ForgeSolution::query()
            ->where('accepted_by', $requester->getKey())
            ->whereNotNull('accepted_at')
            ->where('accepted_at', '>=', Carbon::now()->subDays(7))
            ->count();

        if ($rewardedThisWeek >= $max) {
            throw new QuotaExceededException(
                sprintf('Quota atteint : %d solutions remunerationes maximum par semaine et par demandeur.', $max)
            );
        }
    }
}
