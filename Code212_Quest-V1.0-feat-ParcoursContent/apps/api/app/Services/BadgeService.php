<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\IssuedBadgeStatus;
use App\Models\BadgeRule;
use App\Models\IssuedBadge;
use App\Models\User;
use App\Support\XpSource;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Evaluation des regles de badges et emission des certificats.
 *
 * Les badges sont uniques par (badge_code, user_id) : une regle evaluee deux
 * fois ne creee pas de doublon.
 */
final class BadgeService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Evalue les regles correspondant a un evenement et emet les badges dus.
     *
     * @param array<string, mixed> $context
     *
     * @return Collection<int, IssuedBadge>
     */
    public function evaluate(User $user, string $eventType, array $context = []): Collection
    {
        $issued = new Collection();

        $expectedTypes = $this->ruleTypesFor($eventType);

        $rules = BadgeRule::query()
            ->where('active', true)
            ->get()
            ->filter(static function (BadgeRule $rule) use ($expectedTypes): bool {
                /** @var array<string, mixed> $ruleDefinition */
                $ruleDefinition = $rule->rule;

                return in_array((string) ($ruleDefinition['type'] ?? ''), $expectedTypes, true);
            });

        $counters = $this->counters($user);

        foreach ($rules as $rule) {
            /** @var array<string, mixed> $ruleDefinition */
            $ruleDefinition = $rule->rule;

            if (! $this->ruleSatisfied($ruleDefinition, $counters, $context)) {
                continue;
            }

            $badge = $this->issue($user, $rule, [
                'event' => $eventType,
                'counters' => $counters,
                'context' => $context,
            ]);

            if ($badge !== null) {
                $issued->push($badge);
            }
        }

        return $issued;
    }

    /**
     * Emet un badge (idempotent).
     *
     * @param array<string, mixed> $evidence
     */
    public function issue(User $user, BadgeRule $rule, array $evidence = []): ?IssuedBadge
    {
        $existing = IssuedBadge::query()
            ->where('badge_code', $rule->code)
            ->where('user_id', $user->getKey())
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $badge = IssuedBadge::create([
            'badge_code' => $rule->code,
            'user_id' => $user->getKey(),
            'evidence' => $evidence,
            'status' => IssuedBadgeStatus::Issued->value,
            'issued_at' => now(),
        ]);

        $badge->credential_jsonld = $this->credentialPayload($badge);
        $badge->save();

        $xpRule = $this->ledger->ruleFor(XpSource::BADGE_ISSUED, $rule->track_code);

        if ($xpRule !== null && $xpRule->xp_amount > 0) {
            $this->ledger->record(
                $user,
                XpSource::BADGE_ISSUED,
                $badge->getKey(),
                $xpRule->xp_amount,
                $rule->track_code
            );
        }

        $this->audit->log(
            $user,
            'badge.issued',
            'issued_badge',
            $badge->getKey(),
            sprintf('Badge %s delivre.', $rule->name),
            ['badge_code' => $rule->code]
        );

        return $badge;
    }

    /**
     * Preuve Open Badges 3.0 (JSON-LD).
     *
     * Attention : la preuve est produite mais n'est PAS signee cryptographiquement
     * (pas de VC-JWT). Voir docs/API_CONTRACT.md (point de vigilance).
     *
     * @return array<string, mixed>
     */
    public function credentialPayload(IssuedBadge $badge): array
    {
        $rule = $badge->rule;
        $credentialId = sprintf('urn:uuid:%s', (string) Str::uuid());

        return [
            '@context' => [
                'https://www.w3.org/ns/credentials/v2',
                'https://purl.imsglobal.org/spec/ob/v3p0/context.json',
            ],
            'id' => $credentialId,
            'type' => ['VerifiableCredential', 'AchievementCredential'],
            'name' => sprintf('CODE212 - %s', $rule?->name ?? $badge->badge_code),
            'description' => $rule?->description,
            'award' => [
                'description' => 'Attribue par le centre CODE212 - Universite Cadi Ayyad.',
                'achievement' => [
                    'id' => sprintf('urn:code212:badge:%s', $badge->badge_code),
                    'type' => 'Achievement',
                    'name' => $rule?->name ?? $badge->badge_code,
                    'description' => $rule?->description,
                    'criteria' => $rule?->rule ?? [],
                ],
            ],
            'credentialSubject' => [
                'id' => sprintf('urn:code212:user:%d', $badge->user_id),
                'type' => 'AchievementSubject',
                'achievement' => [
                    'id' => sprintf('urn:code212:badge:%s', $badge->badge_code),
                    'type' => 'Achievement',
                ],
                'activityStartDate' => $badge->issued_at?->toIso8601String(),
                'activityEndDate' => $badge->issued_at?->toIso8601String(),
            ],
            'issuer' => [
                'type' => 'Profile',
                'name' => $rule?->issuer ?? 'CODE212 - Universite Cadi Ayyad',
            ],
            'validFrom' => $badge->issued_at?->toIso8601String(),
        ];
    }

    /**
     * Compteurs utilises par les regles de badges.
     *
     * @return array<string, int>
     */
    public function counters(User $user): array
    {
        $counters = [
            'quest_enrolled' => (int) $user->questEnrollments()->count(),
            'quest_completed' => (int) $user->questEnrollments()->where('status', 'terminee')->count(),
            'submission_approved' => (int) $user->submissions()->where('status', 'approuvee')->count(),
            'mission_claimed' => (int) $user->missionClaims()->count(),
            'challenge_joined' => (int) $user->challengeEntries()->count(),
            'forge_solutions' => (int) $user->forgeSolutions()->count(),
            'forge_solutions_rewarded' => (int) $user->forgeSolutions()->whereNotNull('rewarded_at')->count(),
            'badges_issued' => (int) $user->issuedBadges()->where('status', 'issued')->count(),
            'level_no' => (int) $user->level_no,
        ];

        foreach (\App\Enums\TrackCode::cases() as $track) {
            $counters['quest_completed:'.$track->value] = (int) $user->questEnrollments()
                ->where('status', 'terminee')
                ->whereHas('quest', static fn ($query) => $query->where('track_code', $track->value))
                ->count();
        }

        return $counters;
    }

    /**
     * Types de regles a evaluer pour un evenement donne.
     *
     * @return list<string>
     */
    private function ruleTypesFor(string $eventType): array
    {
        return match ($eventType) {
            'quest_completed' => ['quest_completed', 'quest_completed_track'],
            'quest_enrolled' => ['quest_enrolled'],
            'mission_claimed' => ['mission_claimed'],
            'challenge_joined' => ['challenge_joined', 'challenge_completed'],
            'forge_solution_rewarded' => ['forge_solutions_rewarded', 'forge_solutions'],
            'submission_approved' => ['submission_approved'],
            'level_reached' => ['level_reached'],
            default => [$eventType],
        };
    }

    /**
     * @param array<string, mixed> $rule
     * @param array<string, int> $counters
     * @param array<string, mixed> $context
     */
    private function ruleSatisfied(array $rule, array $counters, array $context): bool
    {
        $type = (string) ($rule['type'] ?? '');
        $required = (int) ($rule['count'] ?? 1);

        if ($type === 'level_reached') {
            return $counters['level_no'] >= (int) ($rule['level_no'] ?? 1);
        }

        if ($type === 'quest_completed_track') {
            $track = (string) ($rule['track'] ?? '');

            return ($counters['quest_completed:'.$track] ?? 0) >= $required;
        }

        if ($type === 'submission_approved') {
            return $counters['submission_approved'] >= $required;
        }

        return ($counters[$type] ?? 0) >= $required;
    }
}
