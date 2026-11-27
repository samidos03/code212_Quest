<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ecriture du journal XP (append-only).
 *
 * Aucune modification ni suppression n'est autorisee : une correction se fait
 * par ecriture compensatoire (xp_delta negatif).
 *
 * @property int $id
 * @property int $user_id
 * @property string|null $track_type
 * @property int $xp_delta
 * @property string $source_event
 * @property string $reference_id
 * @property int $rule_version
 * @property string|null $admin_justification
 */
class XpLedgerEntry extends Model
{
    use HasFactory;

    protected $table = 'xp_ledger';

    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'track_type',
        'xp_delta',
        'source_event',
        'reference_id',
        'admin_justification',
        'rule_version',
    ];

    protected function casts(): array
    {
        return [
            'xp_delta' => 'integer',
            'rule_version' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ProgressionTrack::class, 'track_type', 'code');
    }

    /**
     * L'ecriture concerne-t-elle l'XP global (niveaux) ?
     */
    public function isGlobal(): bool
    {
        return $this->track_type === null;
    }
}
