<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\IssuedBadgeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Badge delivre a un utilisateur (unique par badge et utilisateur).
 *
 * @property int $id
 * @property string $badge_code
 * @property int $user_id
 * @property array<string, mixed> $evidence
 * @property array<string, mixed>|null $credential_jsonld
 * @property string $status
 */
class IssuedBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'badge_code',
        'user_id',
        'evidence',
        'credential_jsonld',
        'status',
        'issued_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'evidence' => 'array',
            'credential_jsonld' => 'array',
            'status' => IssuedBadgeStatus::class,
            'issued_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(BadgeRule::class, 'badge_code', 'code');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
