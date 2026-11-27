<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ecriture du journal des germes (append-only).
 *
 * @property int $id
 * @property int $user_id
 * @property int $germes_delta
 * @property string $source_event
 * @property string $reference_id
 */
class GermesLedgerEntry extends Model
{
    use HasFactory;

    protected $table = 'germes_ledger';

    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'germes_delta',
        'source_event',
        'reference_id',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'germes_delta' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
