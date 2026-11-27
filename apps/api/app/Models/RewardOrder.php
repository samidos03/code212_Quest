<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RewardStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Commande de la boutique.
 *
 * @property int $id
 * @property string $reference
 * @property int $user_id
 * @property string $status
 * @property int $total_cost
 */
class RewardOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'status',
        'total_cost',
        'items_count',
        'decided_by',
        'decided_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'status' => RewardStatus::class,
            'total_cost' => 'integer',
            'items_count' => 'integer',
            'decided_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RewardOrderItem::class);
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
