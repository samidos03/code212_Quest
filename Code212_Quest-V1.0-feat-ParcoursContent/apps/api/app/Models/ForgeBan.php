<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ban temporaire sur une categorie de la Forge.
 *
 * @property int $id
 * @property int $category_id
 * @property int $user_id
 */
class ForgeBan extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'user_id',
        'reason',
        'imposed_by',
        'expires_at',
        'revoked_at',
        'revoked_by',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ForgeCategory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Le ban est-il actuellement applicable ?
     */
    public function isActive(): bool
    {
        if ($this->revoked_at !== null) {
            return false;
        }

        return $this->expires_at === null || $this->expires_at->isFuture();
    }
}
