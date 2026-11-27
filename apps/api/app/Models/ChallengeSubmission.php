<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Depot de code d'un participant a un challenge.
 *
 * @property int $id
 * @property int $challenge_entry_id
 * @property string|null $repository_url
 */
class ChallengeSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_entry_id',
        'repository_url',
        'notes',
        'score',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function entry(): BelongsTo
    {
        return $this->belongsTo(ChallengeEntry::class, 'challenge_entry_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
