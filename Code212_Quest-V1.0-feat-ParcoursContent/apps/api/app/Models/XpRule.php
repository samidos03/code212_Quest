<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bareme XP parametrable : montant par evenement + plafonds journaliers.
 *
 * @property int $id
 * @property string $code
 * @property string $source_event
 * @property string|null $track_code
 * @property int $xp_amount
 * @property int|null $daily_cap
 * @property int|null $weekly_cap
 * @property int $version
 * @property bool $active
 */
class XpRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'source_event',
        'track_code',
        'xp_amount',
        'germes_amount',
        'daily_cap',
        'weekly_cap',
        'version',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'xp_amount' => 'integer',
            'germes_amount' => 'integer',
            'daily_cap' => 'integer',
            'weekly_cap' => 'integer',
            'version' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_code', 'code');
    }
}
