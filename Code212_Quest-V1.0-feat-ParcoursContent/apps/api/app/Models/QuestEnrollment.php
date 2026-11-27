<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EnrollmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Inscription d'un apprenant a une quete.
 *
 * @property int $id
 * @property int $user_id
 * @property int $quest_id
 * @property string $status
 * @property int $progress
 */
class QuestEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quest_id',
        'status',
        'progress',
        'enrolled_at',
        'last_activity_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => EnrollmentStatus::class,
            'progress' => 'integer',
            'enrolled_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'completed_at' => 'datetime',
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

    public function submissions(): HasMany
    {
        return $this->hasMany(QuestSubmission::class);
    }
}
