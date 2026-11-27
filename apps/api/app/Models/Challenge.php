<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ChallengeStatus;
use App\Enums\QuestDifficulty;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Challenge (defi code).
 *
 * @property int $id
 * @property string $code
 * @property string $status
 * @property string $mode
 */
class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'track_code',
        'difficulty',
        'status',
        'mode',
        'starts_at',
        'ends_at',
        'rules',
        'xp_reward',
        'germes_reward',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => QuestDifficulty::class,
            'status' => ChallengeStatus::class,
            'rules' => 'array',
            'xp_reward' => 'integer',
            'germes_reward' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(ChallengeEntry::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }
}
