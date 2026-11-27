<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Participation a un challenge.
 *
 * @property int $id
 * @property int $challenge_id
 * @property int $user_id
 * @property string $status
 */
class ChallengeEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id',
        'user_id',
        'teammate_id',
        'status',
        'score',
        'rank',
        'joined_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'score' => 'integer',
            'rank' => 'integer',
            'joined_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teammate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teammate_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class);
    }
}
