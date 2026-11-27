<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TrackCode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Voie de progression (codeur, aidant, batisseur, explorateur).
 *
 * @property string $code
 * @property string $name
 */
class ProgressionTrack extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'code',
        'name',
        'description',
        'color',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    public function quests(): HasMany
    {
        return $this->hasMany(Quest::class, 'track_code', 'code');
    }

    public function rewards(): HasMany
    {
        return $this->hasMany(Reward::class, 'track_code', 'code');
    }

    public function toEnum(): ?TrackCode
    {
        return TrackCode::tryFrom($this->code);
    }
}
