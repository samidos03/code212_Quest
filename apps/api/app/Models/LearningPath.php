<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Parcours d'apprentissage.
 *
 * @property int $id
 * @property string $code
 * @property string $title
 * @property bool $published
 */
class LearningPath extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'track_code',
        'level_no_from',
        'level_no_to',
        'xp_bonus',
        'germes_bonus',
        'position',
        'published',
    ];

    protected function casts(): array
    {
        return [
            'level_no_from' => 'integer',
            'level_no_to' => 'integer',
            'xp_bonus' => 'integer',
            'germes_bonus' => 'integer',
            'position' => 'integer',
            'published' => 'boolean',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(PathStep::class)->orderBy('order_index');
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }
}
