<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Moderateur affecte a une categorie de la Forge.
 *
 * @property int $category_id
 * @property int $user_id
 */
class ForgeModerator extends Model
{
    use HasFactory;

    protected $table = 'forge_moderator_assignments';

    public const UPDATED_AT = null;

    protected $primaryKey = ['category_id', 'user_id'];

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'category_id',
        'user_id',
        'granted_by',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ForgeCategory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function granter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }
}
