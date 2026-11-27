<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Configuration applicative versionnee (cle -> valeur jsonb).
 *
 * @property string $key
 * @property array<string, mixed> $value
 * @property int $version
 */
class SystemConfigRule extends Model
{
    use HasFactory;

    protected $table = 'system_config_rules';

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'key',
        'value',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
            'version' => 'integer',
            'updated_at' => 'datetime',
        ];
    }
}
