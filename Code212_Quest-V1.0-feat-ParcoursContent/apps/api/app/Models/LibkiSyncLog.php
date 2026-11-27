<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trace des evenements recus de l'API Libki.
 *
 * @property int $id
 * @property string $external_event_id
 * @property int|null $user_id
 * @property string|null $reservation_id
 * @property string $event_type
 * @property array<string, mixed> $payload
 */
class LibkiSyncLog extends Model
{
    use HasFactory;

    protected $table = 'libki_sync_logs';

    public const UPDATED_AT = null;

    protected $fillable = [
        'external_event_id',
        'user_id',
        'reservation_id',
        'event_type',
        'event_at',
        'payload',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'event_at' => 'datetime',
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
