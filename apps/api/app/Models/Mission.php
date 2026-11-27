<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MissionKind;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Mission (objectif ponctuel ou recurrent).
 *
 * @property int $id
 * @property string $code
 * @property string $kind
 * @property int $xp_reward
 */
class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'track_code',
        'kind',
        'xp_reward',
        'germes_reward',
        'criteria',
        'starts_at',
        'ends_at',
        'active',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'kind' => MissionKind::class,
            'xp_reward' => 'integer',
            'germes_reward' => 'integer',
            'criteria' => 'array',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'active' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function claims(): HasMany
    {
        return $this->hasMany(MissionClaim::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }

    /**
     * La mission est-elle ouverte aux revendications ?
     */
    public function isOpen(): bool
    {
        if (! $this->active) {
            return false;
        }

        $now = now();

        if ($this->starts_at !== null && $this->starts_at->isFuture()) {
            return false;
        }

        return ! ($this->ends_at !== null && $this->ends_at->isPast());
    }
}
