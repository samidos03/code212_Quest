<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RoleApplicationStatus;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Candidature a un role elargi (formateur, moderateur, administrateur).
 *
 * @property int $id
 * @property int $user_id
 * @property string $role_code
 * @property string $status
 */
class RoleApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_code',
        'evidence',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'evidence' => 'array',
            'status' => RoleApplicationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function role(): ?UserRole
    {
        return UserRole::tryFrom($this->role_code);
    }
}
