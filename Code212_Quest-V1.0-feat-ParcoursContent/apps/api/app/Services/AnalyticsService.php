<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\RewardStatus;
use App\Enums\SubmissionStatus;
use App\Models\AuditLog;
use App\Models\Challenge;
use App\Models\ForgeSolution;
use App\Models\ForgeThread;
use App\Models\Quest;
use App\Models\RewardOrder;
use App\Models\Submission;
use App\Models\User;
use App\Models\XpLedgerEntry;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Statistiques d'administration (tableau de bord de pilotage).
 */
final class AnalyticsService
{
    /**
     * @return array<string, mixed>
     */
    public function overview(): array
    {
        $now = Carbon::now();

        return [
            'utilisateurs' => [
                'total' => (int) User::query()->count(),
                'actifs_7j' => (int) User::query()->where('last_login_at', '>=', $now->copy()->subDays(7))->count(),
                'nouveaux_30j' => (int) User::query()->where('created_at', '>=', $now->copy()->subDays(30))->count(),
                'opt_in_classement' => (int) User::query()->where('competition_opt_in', true)->count(),
                'par_role' => $this->usersByRole(),
            ],
            'quetes' => [
                'total' => (int) Quest::query()->count(),
                'publiees' => (int) Quest::query()->where('status', 'publie')->count(),
                'inscriptions' => (int) DB::table('quest_enrollments')->count(),
                'terminees' => (int) DB::table('quest_enrollments')->where('status', EnrollmentStatus::Completed->value)->count(),
                'soumissions_en_attente' => (int) DB::table('quest_submissions')
                    ->where('status', SubmissionStatus::Pending->value)
                    ->count(),
            ],
            'soumissions' => [
                'total' => (int) Submission::query()->count(),
                'en_attente' => (int) Submission::query()->where('status', SubmissionStatus::Pending->value)->count(),
                'approuvees' => (int) Submission::query()->where('status', SubmissionStatus::Approved->value)->count(),
            ],
            'boutique' => [
                'commandes' => (int) RewardOrder::query()->count(),
                'en_attente' => (int) RewardOrder::query()->where('status', RewardStatus::Pending->value)->count(),
                'germes_circulants' => (int) User::query()->sum('germes_balance'),
                'germes_debits' => abs((int) DB::table('germes_ledger')->where('germes_delta', '<', 0)->sum('germes_delta')),
            ],
            'xp' => [
                'attribue_total' => (int) XpLedgerEntry::query()->sum('xp_delta'),
                'attribue_7j' => (int) XpLedgerEntry::query()->where('created_at', '>=', $now->copy()->subDays(7))->sum('xp_delta'),
                'par_source' => $this->xpBySource(),
            ],
            'forge' => [
                'fils' => (int) ForgeThread::query()->count(),
                'solutions' => (int) ForgeSolution::query()->count(),
                'remunerees' => (int) ForgeSolution::query()->whereNotNull('rewarded_at')->count(),
                'signalements_ouverts' => (int) DB::table('forge_reports')->where('status', 'ouverte')->count(),
            ],
            'challenges' => [
                'total' => (int) Challenge::query()->count(),
                'participants' => (int) DB::table('challenge_entries')->count(),
            ],
            'audit' => [
                'actions_7j' => (int) AuditLog::query()->where('created_at', '>=', $now->copy()->subDays(7))->count(),
            ],
            'serie_journaliere' => $this->dailyXpSeries(7),
            'top_quetes' => $this->topQuests(5),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function usersByRole(): array
    {
        $counts = [];

        foreach (User::query()->pluck('roles') as $roles) {
            foreach ((array) $roles as $role) {
                $counts[$role] = ($counts[$role] ?? 0) + 1;
            }
        }

        ksort($counts);

        return $counts;
    }

    /**
     * @return array<string, int>
     */
    private function xpBySource(): array
    {
        /** @var array<string, int> $rows */
        $rows = XpLedgerEntry::query()
            ->selectRaw('source_event, SUM(xp_delta) as total')
            ->groupBy('source_event')
            ->pluck('total', 'source_event')
            ->all();

        ksort($rows);

        return $rows;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function dailyXpSeries(int $days): array
    {
        $series = [];

        for ($offset = $days - 1; $offset >= 0; $offset--) {
            $day = Carbon::now()->subDays($offset);

            $series[] = [
                'date' => $day->toDateString(),
                'xp' => (int) XpLedgerEntry::query()
                    ->where('created_at', '>=', $day->copy()->startOfDay())
                    ->where('created_at', '<', $day->copy()->endOfDay())
                    ->sum('xp_delta'),
            ];
        }

        return $series;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function topQuests(int $limit): array
    {
        return DB::table('quests')
            ->leftJoin('quest_enrollments', 'quest_enrollments.quest_id', '=', 'quests.id')
            ->select('quests.id', 'quests.code', 'quests.title')
            ->selectRaw('COUNT(quest_enrollments.id) as enrollments')
            ->groupBy('quests.id', 'quests.code', 'quests.title')
            ->orderByDesc('enrollments')
            ->limit($limit)
            ->get()
            ->map(static fn ($row): array => [
                'id' => (int) $row->id,
                'code' => $row->code,
                'titre' => $row->title,
                'inscriptions' => (int) $row->enrollments,
            ])
            ->all();
    }
}
