<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Etape d'une quete.
 *
 * @property int $id
 * @property int $quest_id
 * @property string $title
 * @property string $type
 * @property string $validation_mode
 * @property int $order_index
 * @property int $xp_reward
 */
class QuestStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'quest_id',
        'title',
        'description',
        'type',
        'validation_mode',
        'order_index',
        'xp_reward',
        'duration_minutes',
    ];

    protected function casts(): array
    {
        return [
            'order_index' => 'integer',
            'xp_reward' => 'integer',
            'duration_minutes' => 'integer',
        ];
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
