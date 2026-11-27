<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Classement general et classement par voie.
 *
 * Regle de consentement : seuls les utilisateurs ayant active le « mode
 * competition » apparaissent. Aucune donnee personnelle (nom, e-mail,
 * matricule) n est exposee : seul le pseudonyme est publie.
 */
final class LeaderboardService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function ranking(?string $trackCode = null, ?int $limit = null): Collection
    {
        $max = (int) config('quests.leaderboard.max_size', 200);
        $default = (int) config('quests.leaderboard.default_size', 50);
        $limit = min(max(1, $limit ?? $default), $max);

        $rows = DB::table('xp_ledger')
            ->join('users', 'users.id', '=', 'xp_ledger.user_id')
            ->select([
                'users.id as user_id',
                'users.pseudonym',
                'users.anonymize_leaderboard',
                'users.level_no',
                'users.track_code',
            ])
            ->selectRaw('SUM(xp_ledger.xp_delta) as xp_total')
            ->where('users.competition_opt_in', true)
            ->groupBy('users.id', 'users.pseudonym', 'users.anonymize_leaderboard', 'users.level_no', 'users.track_code')
            ->when(
                $trackCode === null,
                static fn ($query) => $query->whereNull('xp_ledger.track_type'),
                static fn ($query) => $query
                    ->where('xp_ledger.track_type', $trackCode)
                    ->where('users.track_code', $trackCode)
            )
            ->orderByDesc('xp_total')
            ->limit($limit)
            ->get();

        return $rows->values()->map(static function ($row, int $index): array {
            $userId = (int) $row->user_id;

            return [
                'rang' => $index + 1,
                'user_id' => $userId,
                'pseudonyme' => $row->anonymize_leaderboard
                    ? 'Anonyme '.str_pad((string) $userId, 4, '0', STR_PAD_LEFT)
                    : ($row->pseudonym ?? 'Apprenant '.str_pad((string) $userId, 4, '0', STR_PAD_LEFT)),
                'niveau' => (int) $row->level_no,
                'xp' => (int) $row->xp_total,
                'voie' => $row->track_code,
            ];
        });
    }

    /**
     * Position de l'utilisateur dans le classement (null s'il n'a pas_opted_in).
     *
     * @return array<string, mixed>|null
     */
    public function positionOf(User $user, ?string $trackCode = null): ?array
    {
        if (! $user->participatesInLeaderboard()) {
            return null;
        }

        $ranking = $this->ranking($trackCode, (int) config('quests.leaderboard.max_size', 200));

        $entry = $ranking->first(static fn (array $item): bool => $item['user_id'] === (int) $user->getKey());

        if ($entry !== null) {
            return $entry;
        }

        // L'utilisateur peut figurer au-dela de la limite affichee : on calcule son rang.
        $query = DB::table('xp_ledger')
            ->join('users', 'users.id', '=', 'xp_ledger.user_id')
            ->selectRaw('SUM(xp_ledger.xp_delta) as xp_total')
            ->where('users.competition_opt_in', true)
            ->groupBy('users.id')
            ->when(
                $trackCode === null,
                static fn ($q) => $q->whereNull('xp_ledger.track_type'),
                static fn ($q) => $q
                    ->where('xp_ledger.track_type', $trackCode)
                    ->where('users.track_code', $trackCode)
            );

        $total = (int) (clone $query)->sum('xp_total');

        if ($total === 0) {
            return null;
        }

        $better = (int) (clone $query)->whereRaw('SUM(xp_ledger.xp_delta) > ?', [$total])->count();

        return [
            'rang' => $better + 1,
            'user_id' => (int) $user->getKey(),
            'pseudonyme' => $user->leaderboardAlias(),
            'niveau' => (int) $user->level_no,
            'xp' => $total,
            'voie' => $user->track_code,
        ];
    }

    /**
     * Active le mode competition (consentement explicite).
     */
    public function optIn(User $user): User
    {
        $user->forceFill(['competition_opt_in' => true])->save();

        return $user;
    }

    /**
     * Retire le consentement : l'utilisateur disparait du classement.
     */
    public function optOut(User $user): User
    {
        $user->forceFill(['competition_opt_in' => false])->save();

        return $user;
    }
}
