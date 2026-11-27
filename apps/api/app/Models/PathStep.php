<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Etape d'un parcours.
 *
 * @property int $id
 * @property int $learning_path_id
 * @property string $kind
 * @property string|null $ref_type
 * @property string|null $ref_id
 */
class PathStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_path_id',
        'title',
        'description',
        'kind',
        'ref_type',
        'ref_id',
        'order_index',
        'xp_reward',
    ];

    protected function casts(): array
    {
        return [
            'order_index' => 'integer',
            'xp_reward' => 'integer',
        ];
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class);
    }
}
