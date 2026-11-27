<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Solution proposee sur un fil de la Forge.
 *
 * @property int $id
 * @property int $thread_id
 * @property int $author_id
 * @property \Illuminate\Support\Carbon|null $accepted_at
 */
class ForgeSolution extends Model
{
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'author_id',
        'body',
        'code_snippet',
        'accepted_at',
        'accepted_by',
        'germes_rewarded',
        'xp_rewarded',
        'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'rewarded_at' => 'datetime',
            'germes_rewarded' => 'integer',
            'xp_rewarded' => 'integer',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(ForgeThread::class, 'thread_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function acceptor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ForgeVote::class, 'solution_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ForgeReport::class, 'solution_id');
    }
}
