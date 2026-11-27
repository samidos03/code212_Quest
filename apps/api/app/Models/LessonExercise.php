<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_lesson_id',
        'title',
        'instructions',
        'starter_code',
        'validation_type',
        'validation_rules',
        'order_index',
    ];

    protected $hidden = [
        'validation_rules',
    ];

    protected function casts(): array
    {
        return [
            'validation_rules' => 'array',
            'order_index' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(ModuleLesson::class, 'module_lesson_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExerciseAttempt::class);
    }
}
