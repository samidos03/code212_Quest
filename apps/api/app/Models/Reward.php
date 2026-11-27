<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Recompense de la boutique (payee en germes).
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $cost
 * @property int|null $stock
 * @property bool $active
 */
class Reward extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'track_code',
        'cost',
        'stock',
        'image_url',
        'requires_approval',
        'active',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'integer',
            'stock' => 'integer',
            'requires_approval' => 'boolean',
            'active' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(RewardOrderItem::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('active', true)->where(function (Builder $q): void {
            $q->whereNull('stock')->orWhere('stock', '>', 0);
        });
    }

    /**
     * Stock disponible (null = illimite).
     */
    public function availableStock(): ?int
    {
        return $this->stock;
    }
}
