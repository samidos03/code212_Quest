<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModuleLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'path_step_id',
        'title',
        'summary',
        'key_points',
        'content',
        'example_code',
        'example_explanation',
        'order_index',
        'estimated_minutes',
    ];

    protected function casts(): array
    {
        return [
            'key_points' => 'array',
            'order_index' => 'integer',
            'estimated_minutes' => 'integer',
        ];
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(PathStep::class, 'path_step_id');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(LessonExercise::class)->orderBy('order_index');
    }
}
