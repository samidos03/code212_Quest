<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RewardStatus;
use App\Exceptions\InsufficientBalanceException;
use App\Models\GermesLedgerEntry;
use App\Models\Reward;
use App\Models\RewardOrder;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 3 : achat de la boutique atomique, stock et solde non negatifs.
 */
class RewardPurchaseTest extends TestCase
{
    use RefreshDatabase;

    private RewardService $rewards;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rewards = app(RewardService::class);
    }

    private function makeReward(int $cost = 60, ?int $stock = 2): Reward
    {
        return Reward::create([
            'code' => 'R-TEST-'.$cost.'-'.$stock,
            'name' => 'Recompense de test',
            'description' => null,
            'category' => 'test',
            'track_code' => null,
            'cost' => $cost,
            'stock' => $stock,
            'requires_approval' => true,
            'active' => true,
        ]);
    }

    #[Test]
    public function un_achat_debite_le_solde_et_le_stock(): void
    {
        $user = $this->makeUser(['germes_balance' => 100]);
        $reward = $this->makeReward(60, 2);

        $order = $this->rewards->purchase($user, $reward);

        $this->assertSame(40, (int) $user->refresh()->germes_balance);
        $this->assertSame(1, (int) $reward->refresh()->stock);
        $this->assertSame(RewardStatus::Pending, $order->status);
        $this->assertSame(60, (int) $order->total_cost);
        $this->assertSame(1, GermesLedgerEntry::query()->where('user_id', $user->getKey())->count());
        $this->assertSame(-60, (int) GermesLedgerEntry::query()->first()->germes_delta);
    }

    #[Test]
    public function un_solde_insuffisant_refuse_l_achat(): void
    {
        $user = $this->makeUser(['germes_balance' => 10]);
        $reward = $this->makeReward(60, 5);

        $this->expectException(InsufficientBalanceException::class);

        $this->rewards->purchase($user, $reward);
    }

    #[Test]
    public function un_stock_insuffisant_refuse_l_achat_et_ne_devient_pas_negatif(): void
    {
        $user = $this->makeUser(['germes_balance' => 1000]);
        $reward = $this->makeReward(10, 1);

        try {
            $this->rewards->purchase($user, $reward, 3);
            $this->fail('L achat aurait du etre refuse.');
        } catch (InsufficientBalanceException) {
            // attendu
        }

        $this->assertSame(1, (int) $reward->refresh()->stock);
        $this->assertSame(1000, (int) $user->refresh()->germes_balance);
        $this->assertSame(0, RewardOrder::query()->count());
    }

    #[Test]
    public function le_rejet_rembourse_le_solde_et_restitue_le_stock(): void
    {
        $user = $this->makeUser(['germes_balance' => 100]);
        $reward = $this->makeReward(60, 2);

        $order = $this->rewards->purchase($user, $reward);
        $admin = $this->makeUser(['roles' => ['admin']]);

        $this->rewards->reject($order, $admin, 'Rupture de stock.');

        $this->assertSame(100, (int) $user->refresh()->germes_balance);
        $this->assertSame(2, (int) $reward->refresh()->stock);
        $this->assertSame(RewardStatus::Rejected, $order->refresh()->status);
        $this->assertSame(2, GermesLedgerEntry::query()->where('user_id', $user->getKey())->count());
    }

    #[Test]
    public function l_achat_est_refuse_si_la_recompense_est_inactive(): void
    {
        $user = $this->makeUser(['germes_balance' => 100]);
        $reward = $this->makeReward(60, 2);
        $reward->forceFill(['active' => false])->save();

        $this->expectException(\App\Exceptions\BusinessRuleException::class);

        $this->rewards->purchase($user, $reward);
    }

    #[Test]
    public function le_solde_ne_peut_pas_devenir_negatif(): void
    {
        $user = $this->makeUser(['germes_balance' => 0]);
        $reward = $this->makeReward(60, 2);

        try {
            $this->rewards->purchase($user, $reward);
        } catch (InsufficientBalanceException) {
            // attendu
        }

        $this->assertSame(0, (int) $user->refresh()->germes_balance);
        $this->assertGreaterThanOrEqual(0, (int) $reward->refresh()->stock);
        $this->assertInstanceOf(User::class, $user);
    }
}
