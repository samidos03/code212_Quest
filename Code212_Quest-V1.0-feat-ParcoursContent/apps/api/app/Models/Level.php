<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Niveau global (1..10) : seuil d'XP, pre-requis et benefices.
 *
 * @property int $level_no
 * @property string $title
 * @property int $xp_threshold
 * @property array<string, mixed> $requirements
 * @property array<string, mixed> $benefits
 */
class Level extends Model
{
    use HasFactory;

    protected $table = 'levels_config';

    protected $primaryKey = 'level_no';

    protected $keyType = 'int';

    public $incrementing = false;

    protected $fillable = [
        'level_no',
        'title',
        'xp_threshold',
        'requirements',
        'benefits',
    ];

    protected function casts(): array
    {
        return [
            'level_no' => 'integer',
            'xp_threshold' => 'integer',
            'requirements' => 'array',
            'benefits' => 'array',
        ];
    }
}
