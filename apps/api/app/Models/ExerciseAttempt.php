<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_exercise_id',
        'answer',
        'passed',
        'feedback',
        'attempt_number',
    ];

    protected function casts(): array
    {
        return [
            'passed' => 'boolean',
            'attempt_number' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(LessonExercise::class, 'lesson_exercise_id');
    }
}
