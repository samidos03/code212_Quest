<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Production libre soumise a l'approbation d'un formateur.
 *
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $status
 * @property int $xp_reward
 */
class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quest_id',
        'quest_step_id',
        'quest_submission_id',
        'title',
        'body',
        'artifact_url',
        'status',
        'xp_reward',
        'germes_reward',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'xp_reward' => 'integer',
            'germes_reward' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function getStatusAttribute($value): string
    {
        return $value instanceof SubmissionStatus ? $value->value : (string) $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quest(): BelongsTo
    {
        return $this->belongsTo(Quest::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(QuestStep::class, 'quest_step_id');
    }

    public function questSubmission(): BelongsTo
    {
        return $this->belongsTo(QuestSubmission::class, 'quest_submission_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
