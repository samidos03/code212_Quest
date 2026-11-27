<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Soumission d'etape, idempotente par (user_id, quest_id, quest_step_id).
 *
 * @property int $id
 * @property int $user_id
 * @property int $quest_id
 * @property int $quest_step_id
 * @property array<string, mixed> $content
 * @property string $status
 * @property string $idempotency_key
 */
class QuestSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quest_id',
        'quest_step_id',
        'quest_enrollment_id',
        'content',
        'notes',
        'status',
        'attempt_number',
        'idempotency_key',
        'content_hash',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'feedback',
        'xp_awarded',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'status' => SubmissionStatus::class,
            'attempt_number' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'xp_awarded' => 'integer',
        ];
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

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(QuestEnrollment::class, 'quest_enrollment_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
