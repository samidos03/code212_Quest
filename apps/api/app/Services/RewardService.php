<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\RewardStatus;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\QuotaExceededException;
use App\Models\GermesLedgerEntry;
use App\Models\Reward;
use App\Models\RewardOrder;
use App\Models\RewardOrderItem;
use App\Models\User;
use App\Support\GermesSource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Boutique : achat atomique de recompenses payees en germes.
 *
 * Invariants : stock et solde restent positifs ou nuls, le debit du solde et
 * le decrement du stock sont atomiques, et toute sortie de germes est tracee
 * dans `germes_ledger` (append-only).
 */
final class RewardService
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    /**
     * Achat d'une recompense.
     *
     * @throws InsufficientBalanceException Si le solde ou le stock est insuffisant.
     */
    public function purchase(User $user, Reward $reward, int $quantity = 1): RewardOrder
    {
        $maxQuantity = (int) config('quests.rewards.max_quantity_per_order', 10);

        if ($quantity < 1 || $quantity > $maxQuantity) {
            throw new BusinessRuleException(
                sprintf('La quantite doit etre comprise entre 1 et %d.', $maxQuantity),
                ['quantity' => [sprintf('Quantite invalide (1..%d).', $maxQuantity)]],
                422
            );
        }

        return DB::transaction(function () use ($user, $reward, $quantity): RewardOrder {
            /** @var Reward $lockedReward */
            $lockedReward = Reward::query()->whereKey($reward->getKey())->lockForUpdate()->firstOrFail();

            /** @var User $lockedUser */
            $lockedUser = User::query()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();

            if (! $lockedReward->active) {
                throw new BusinessRuleException('Cette recompense n est plus disponible.', ['reward' => ['Recompense indisponible.']], 422);
            }

            if ($lockedReward->stock !== null && $lockedReward->stock < $quantity) {
                throw new InsufficientBalanceException(
                    'Stock insuffisant pour cette recompense.'
                );
            }

            $totalCost = $lockedReward->cost * $quantity;

            if ($lockedUser->germes_balance < $totalCost) {
                throw new InsufficientBalanceException(
                    sprintf(
                        'Solde insuffisant : %d germes necessaires, %d disponibles.',
                        $totalCost,
                        $lockedUser->germes_balance
                    )
                );
            }

            $this->assertDailyQuota($lockedUser);

            if ($lockedReward->stock !== null) {
                $lockedReward->stock = $lockedReward->stock - $quantity;
                $lockedReward->save();
            }

            $lockedUser->germes_balance = $lockedUser->germes_balance - $totalCost;
            $lockedUser->save();

            /** @var RewardOrder $order */
            $order = RewardOrder::create([
                'reference' => $this->reference(),
                'user_id' => $lockedUser->getKey(),
                'status' => RewardStatus::Pending->value,
                'total_cost' => $totalCost,
                'items_count' => $quantity,
            ]);

            RewardOrderItem::create([
                'reward_order_id' => $order->getKey(),
                'reward_id' => $lockedReward->getKey(),
                'quantity' => $quantity,
                'unit_cost' => $lockedReward->cost,
            ]);

            GermesLedgerEntry::create([
                'user_id' => $lockedUser->getKey(),
                'germes_delta' => -$totalCost,
                'source_event' => GermesSource::PURCHASE,
                'reference_id' => (string) $order->getKey(),
            ]);

            return $order;
        });
    }

    /**
     * Approbation d'une commande par un administrateur.
     */
    public function approve(RewardOrder $order, User $admin, ?string $note = null): RewardOrder
    {
        return DB::transaction(function () use ($order, $admin, $note): RewardOrder {
            /** @var RewardOrder $locked */
            $locked = RewardOrder::query()->whereKey($order->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== RewardStatus::Pending) {
                throw new BusinessRuleException('Cette commande a deja ete traitee.', [], 409);
            }

            $locked->forceFill([
                'status' => RewardStatus::Approved->value,
                'decided_by' => $admin->getKey(),
                'decided_at' => now(),
                'note' => $note,
            ])->save();

            $this->audit->log(
                $admin,
                'reward_order.approved',
                'reward_order',
                $locked->getKey(),
                $note,
                ['reference' => $locked->reference, 'total_cost' => $locked->total_cost, 'user_id' => $locked->user_id]
            );

            return $locked;
        });
    }

    /**
     * Rejet d'une commande : remboursement des germes et restitution du stock.
     */
    public function reject(RewardOrder $order, User $admin, ?string $note = null): RewardOrder
    {
        return DB::transaction(function () use ($order, $admin, $note): RewardOrder {
            /** @var RewardOrder $locked */
            $locked = RewardOrder::query()->whereKey($order->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== RewardStatus::Pending) {
                throw new BusinessRuleException('Cette commande a deja ete traitee.', [], 409);
            }

            /** @var User $lockedUser */
            $lockedUser = User::query()->whereKey($locked->user_id)->lockForUpdate()->firstOrFail();

            $lockedUser->germes_balance = $lockedUser->germes_balance + (int) $locked->total_cost;
            $lockedUser->save();

            foreach ($locked->items()->get() as $item) {
                /** @var Reward $reward */
                $reward = Reward::query()->whereKey($item->reward_id)->lockForUpdate()->first();

                if ($reward !== null && $reward->stock !== null) {
                    $reward->stock = $reward->stock + (int) $item->quantity;
                    $reward->save();
                }
            }

            GermesLedgerEntry::create([
                'user_id' => $lockedUser->getKey(),
                'germes_delta' => (int) $locked->total_cost,
                'source_event' => GermesSource::REFUND,
                'reference_id' => (string) $locked->getKey(),
            ]);

            $locked->forceFill([
                'status' => RewardStatus::Rejected->value,
                'decided_by' => $admin->getKey(),
                'decided_at' => now(),
                'note' => $note,
            ])->save();

            $this->audit->log(
                $admin,
                'reward_order.rejected',
                'reward_order',
                $locked->getKey(),
                $note,
                ['reference' => $locked->reference, 'refunded' => $locked->total_cost]
            );

            return $locked;
        });
    }

    /**
     * Quota journalier de commandes en attente.
     */
    private function assertDailyQuota(User $user): void
    {
        $maxDaily = (int) config('quests.rewards.max_daily_purchases', 5);

        if ($maxDaily <= 0) {
            return;
        }

        $today = RewardOrder::query()
            ->where('user_id', $user->getKey())
            ->whereDate('created_at', today())
            ->count();

        if ($today >= $maxDaily) {
            throw new QuotaExceededException(
                sprintf('Quota journalier de %d commandes atteint.', $maxDaily)
            );
        }
    }

    private function reference(): string
    {
        return sprintf('CMD-%s-%s', now()->format('Ymd'), Str::upper(Str::random(6)));
    }
}
