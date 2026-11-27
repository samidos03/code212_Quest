<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Vote positif sur une solution de la Forge.
 *
 * @property int $solution_id
 * @property int $voter_id
 */
class ForgeVote extends Model
{
    use HasFactory;

    protected $table = 'forge_votes';

    public const UPDATED_AT = null;

    protected $primaryKey = ['solution_id', 'voter_id'];

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'solution_id',
        'voter_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function solution(): BelongsTo
    {
        return $this->belongsTo(ForgeSolution::class);
    }

    public function voter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voter_id');
    }
}
