<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * Utilisateur de la plateforme (apprenant, formateur, moderateur, admin).
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $uca_matricule
 * @property string|null $filiere
 * @property string|null $promotion
 * @property string|null $pseudonym
 * @property bool $anonymize_leaderboard
 * @property bool $competition_opt_in
 * @property list<string> $roles
 * @property string|null $track_code
 * @property int $level_no
 * @property int $xp_total
 * @property int $germes_balance
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    /**
     * Valeurs par défaut alignées sur la base (niveau 1, aucun XP), pour qu'un
     * modèle tout juste créé les expose sans rechargement.
     *
     * @var array<string, int>
     */
    protected $attributes = [
        'level_no' => 1,
        'xp_total' => 0,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'uca_matricule',
        'filiere',
        'promotion',
        'pseudonym',
        'anonymize_leaderboard',
        'competition_opt_in',
        'roles',
        'preferences',
        'track_code',
        'level_no',
        'xp_total',
        'germes_balance',
        'avatar_url',
        'locale',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'anonymize_leaderboard' => 'boolean',
            'competition_opt_in' => 'boolean',
            'roles' => 'array',
            'preferences' => 'array',
            'level_no' => 'integer',
            'xp_total' => 'integer',
            'germes_balance' => 'integer',
        ];
    }

    // ---------------------------------------------------------------- Relations

    public function xpLedgerEntries(): HasMany
    {
        return $this->hasMany(XpLedgerEntry::class);
    }

    public function germesLedgerEntries(): HasMany
    {
        return $this->hasMany(GermesLedgerEntry::class);
    }

    public function questEnrollments(): HasMany
    {
        return $this->hasMany(QuestEnrollment::class);
    }

    public function questSubmissions(): HasMany
    {
        return $this->hasMany(QuestSubmission::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function issuedBadges(): HasMany
    {
        return $this->hasMany(IssuedBadge::class);
    }

    public function rewardOrders(): HasMany
    {
        return $this->hasMany(RewardOrder::class);
    }

    public function missionClaims(): HasMany
    {
        return $this->hasMany(MissionClaim::class);
    }

    public function challengeEntries(): HasMany
    {
        return $this->hasMany(ChallengeEntry::class);
    }

    public function forgeThreads(): HasMany
    {
        return $this->hasMany(ForgeThread::class, 'author_id');
    }

    public function forgeSolutions(): HasMany
    {
        return $this->hasMany(ForgeSolution::class, 'author_id');
    }

    public function pathEnrollments(): HasMany
    {
        return $this->hasMany(LearningPathEnrollment::class);
    }

    public function roleApplications(): HasMany
    {
        return $this->hasMany(RoleApplication::class);
    }

    public function libkiSyncLogs(): HasMany
    {
        return $this->hasMany(LibkiSyncLog::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(self::class, 'id')->select(['id', 'name', 'email']);
    }

    /** Compatibilite avec la base historique qui utilise users.role (singulier). */
    public function getRolesAttribute($value): array
    {
        if ($value !== null) {
            $decoded = is_array($value) ? $value : json_decode((string) $value, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        $role = $this->attributes['role'] ?? 'student';
        return [$role];
    }

    // ----------------------------------------------------------------- Helpers

    /**
     * L'utilisateur porte-t-il le role demande ?
     */
    public function hasRole(UserRole|string $role): bool
    {
        $value = $role instanceof UserRole ? $role->value : $role;

        return in_array($value, $this->roles ?? [], true);
    }

    /**
     * L'utilisateur porte-t-il au moins un des roles demandes ?
     *
     * @param list<UserRole|string> $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin);
    }

    public function isModerator(): bool
    {
        return $this->hasRole(UserRole::Moderator) || $this->isAdmin();
    }

    public function isTrainer(): bool
    {
        return $this->hasRole(UserRole::Trainer) || $this->isModerator();
    }

    /**
     * Le compte est-il eligible au classement public ?
     */
    public function participatesInLeaderboard(): bool
    {
        return (bool) $this->competition_opt_in;
    }

    /**
     * Pseudonyme affiche dans le classement (jamais de donnee personnelle).
     */
    public function leaderboardAlias(): string
    {
        if ($this->anonymize_leaderboard) {
            return 'Anonyme '.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
        }

        return $this->pseudonym ?: ($this->name ?: ('Apprenant '.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT)));
    }

    // ------------------------------------------------------------------ Scopes

    public function scopeOptedInForLeaderboard(Builder $query): Builder
    {
        return $query->where('competition_opt_in', true);
    }

    public function scopeWithRole(Builder $query, UserRole|string $role): Builder
    {
        $value = $role instanceof UserRole ? $role->value : $role;

        return $query->where('roles', '?', json_encode([$value]));
    }

    public function touchLastLogin(): void
    {
        $this->forceFill(['last_login_at' => Carbon::now()])->save();
    }
}
