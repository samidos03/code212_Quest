<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Regle d'obtention d'un badge.
 *
 * @property string $code
 * @property string $name
 * @property array<string, mixed> $rule
 * @property string $rarity
 * @property bool $active
 */
class BadgeRule extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'code',
        'name',
        'description',
        'rule',
        'issuer',
        'rarity',
        'track_code',
        'image_url',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'rule' => 'array',
            'active' => 'boolean',
        ];
    }

    public function issuedBadges(): HasMany
    {
        return $this->hasMany(IssuedBadge::class, 'badge_code', 'code');
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }
}
