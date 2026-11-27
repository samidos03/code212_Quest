<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ForgeThreadStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Fil de discussion de la Forge.
 *
 * @property int $id
 * @property int $category_id
 * @property int $author_id
 * @property string $title
 * @property string $status
 */
class ForgeThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'body',
        'status',
        'tags',
        'accepted_solution_id',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'status' => ForgeThreadStatus::class,
            'tags' => 'array',
            'view_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ForgeCategory::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function solutions(): HasMany
    {
        return $this->hasMany(ForgeSolution::class, 'thread_id')->orderBy('created_at');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ForgeReport::class, 'thread_id');
    }

    public function acceptedSolution(): BelongsTo
    {
        return $this->belongsTo(ForgeSolution::class, 'accepted_solution_id');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereIn('status', [
            ForgeThreadStatus::Open->value,
            ForgeThreadStatus::Resolved->value,
        ]);
    }
}
