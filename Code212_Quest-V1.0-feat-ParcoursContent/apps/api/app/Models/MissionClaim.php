<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Revendication d'une mission (unique par mission et utilisateur).
 *
 * @property int $id
 * @property int $mission_id
 * @property int $user_id
 * @property int $xp_awarded
 */
class MissionClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id',
        'user_id',
        'xp_awarded',
        'germes_awarded',
        'evidence',
    ];

    protected function casts(): array
    {
        return [
            'xp_awarded' => 'integer',
            'germes_awarded' => 'integer',
            'evidence' => 'array',
            'claimed_at' => 'datetime',
        ];
    }

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
