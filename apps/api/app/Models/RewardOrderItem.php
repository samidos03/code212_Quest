<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ligne d'une commande de la boutique.
 *
 * @property int $id
 * @property int $reward_order_id
 * @property int $reward_id
 * @property int $quantity
 * @property int $unit_cost
 */
class RewardOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'reward_order_id',
        'reward_id',
        'quantity',
        'unit_cost',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_cost' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(RewardOrder::class, 'reward_order_id');
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }
}
