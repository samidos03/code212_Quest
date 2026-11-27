<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\SubmissionStatus;
use App\Models\Quest;
use App\Models\User;
use App\Models\XpLedgerEntry;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Tableau de bord personnel : progression, quetes, badges, boutique, journal.
 */
final class DashboardService
{
    public function __construct(
        private readonly LevelService $levels,
        private readonly LeaderboardService $leaderboard,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function forUser(User $user): array
    {
        $progression = $this->levels->progress($user);

        $enrollments = $user->questEnrollments()->with('quest')->latest('last_activity_at')->get();
        $recentLimit = (int) config('quests.dashboard.recent_ledger_limit', 10);

        /** @var Collection<int, XpLedgerEntry> $recentLedger */
        $recentLedger = XpLedgerEntry::query()
            ->where('user_id', $user->getKey())
            ->latest('id')
            ->limit($recentLimit)
            ->get();

        return [
            'progression' => $progression,
            'boutique' => [
                'germes' => (int) $user->germes_balance,
            ],
            'quetes' => [
                'inscrites' => $enrollments->count(),
                'terminees' => $enrollments->where('status', EnrollmentStatus::Completed)->count(),
                'en_cours' => $enrollments
                    ->where('status', EnrollmentStatus::InProgress)
                    ->take((int) config('quests.dashboard.active_quests_limit', 5))
                    ->map(static fn ($enrollment): array => [
                        'id' => $enrollment->quest_id,
                        'code' => $enrollment->quest?->code,
                        'titre' => $enrollment->quest?->title,
                        'progression' => $enrollment->progress,
                        'statut' => $enrollment->status->value,
                    ])
                    ->values()
                    ->all(),
            ],
            'soumissions' => [
                'en_attente' => (int) $user->questSubmissions()
                    ->whereIn('status', [SubmissionStatus::Pending->value, SubmissionStatus::NeedsReview->value])
                    ->count(),
                'approuvees' => (int) $user->questSubmissions()
                    ->where('status', SubmissionStatus::Approved->value)
                    ->count(),
            ],
            'badges' => [
                'total' => (int) $user->issuedBadges()->where('status', 'issued')->count(),
                'recents' => $user->issuedBadges()
                    ->with('rule')
                    ->where('status', 'issued')
                    ->latest('issued_at')
                    ->take(5)
                    ->get()
                    ->map(static fn ($badge): array => [
                        'code' => $badge->badge_code,
                        'nom' => $badge->rule?->name,
                        'rarete' => $badge->rule?->rarity,
                        'obtenu_le' => $badge->issued_at?->toIso8601String(),
                    ])
                    ->all(),
            ],
            'forge' => [
                'fils' => (int) $user->forgeThreads()->count(),
                'solutions' => (int) $user->forgeSolutions()->count(),
                'solutions_remunerees' => (int) $user->forgeSolutions()->whereNotNull('rewarded_at')->count(),
            ],
            'classement' => [
                'position' => $this->leaderboard->positionOf($user),
                'consentement' => (bool) $user->competition_opt_in,
            ],
            'journal' => $recentLedger->map(static fn (XpLedgerEntry $entry): array => [
                'id' => $entry->id,
                'evenement' => $entry->source_event,
                'xp' => $entry->xp_delta,
                'voie' => $entry->track_type,
                'reference' => $entry->reference_id,
                'date' => $entry->created_at?->toIso8601String(),
            ])->all(),
            'quotidien' => [
                'xp_aujourdhui' => (int) XpLedgerEntry::query()
                    ->where('user_id', $user->getKey())
                    ->where('created_at', '>=', Carbon::now()->startOfDay())
                    ->sum('xp_delta'),
            ],
        ];
    }

    /**
     * Quetes publiees recommandees a l'utilisateur.
     *
     * @return Collection<int, Quest>
     */
    public function recommendedQuests(User $user, int $limit = 3): Collection
    {
        $enrolledQuestIds = $user->questEnrollments()->pluck('quest_id')->all();

        return Quest::query()
            ->published()
            ->when($user->track_code !== null, static fn ($query) => $query->orWhere('track_code', $user->track_code))
            ->when($enrolledQuestIds !== [], static fn ($query) => $query->whereNotIn('id', $enrolledQuestIds))
            ->orderBy('position')
            ->take($limit)
            ->get();
    }
}
