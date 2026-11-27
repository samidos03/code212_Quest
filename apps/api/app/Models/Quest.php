<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\QuestDifficulty;
use App\Enums\QuestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * Quete : sequence d'etapes valides par un formateur.
 *
 * @property int $id
 * @property string $code
 * @property string $title
 * @property string|null $track_code
 * @property string $difficulty
 * @property string $status
 * @property int $xp_reward
 */
class Quest extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'track_code',
        'difficulty',
        'status',
        'xp_reward',
        'germes_reward',
        'estimated_minutes',
        'starts_at',
        'ends_at',
        'cover_url',
        'position',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => QuestDifficulty::class,
            'status' => QuestStatus::class,
            'xp_reward' => 'integer',
            'germes_reward' => 'integer',
            'estimated_minutes' => 'integer',
            'position' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(QuestStep::class)->orderBy('order_index');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(QuestEnrollment::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(QuestSubmission::class);
    }

    public function learners(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, QuestEnrollment::class, 'quest_id', 'id', 'id', 'user_id');
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', QuestStatus::Published->value);
    }

    public function scopeForTrack(Builder $query, ?string $trackCode): Builder
    {
        return $query->when($trackCode !== null, fn (Builder $q) => $q->where('track_code', $trackCode));
    }

    /**
     * La quete est-elle ouverte aux inscriptions ?
     */
    public function isOpen(): bool
    {
        if ($this->status !== QuestStatus::Published) {
            return false;
        }

        $now = now();

        if ($this->starts_at !== null && $this->starts_at->isFuture()) {
            return false;
        }

        return ! ($this->ends_at !== null && $this->ends_at->isPast());
    }
}
