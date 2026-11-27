<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Categorie de la Forge.
 *
 * @property int $id
 * @property string $code
 * @property string $name
 */
class ForgeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'color',
        'icon',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    public function threads(): HasMany
    {
        return $this->hasMany(ForgeThread::class);
    }

    public function moderators(): HasMany
    {
        return $this->hasMany(ForgeModerator::class);
    }

    public function bans(): HasMany
    {
        return $this->hasMany(ForgeBan::class);
    }
}
