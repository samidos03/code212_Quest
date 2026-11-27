<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ForgeReportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Signalement d'un fil ou d'une solution de la Forge (cible exclusive).
 *
 * @property int $id
 * @property int|null $thread_id
 * @property int|null $solution_id
 * @property int $reporter_id
 * @property string $status
 */
class ForgeReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'solution_id',
        'reporter_id',
        'reason',
        'status',
        'resolution_note',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ForgeReportStatus::class,
            'resolved_at' => 'datetime',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(ForgeThread::class);
    }

    public function solution(): BelongsTo
    {
        return $this->belongsTo(ForgeSolution::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
