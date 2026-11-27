<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TrackCode;
use App\Exceptions\XpCapExceededException;
use App\Models\User;
use App\Models\XpLedgerEntry;
use App\Models\XpRule;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Ecriture dans le journal XP (append-only).
 *
 * Invariants :
 * - une seule attribution par (user_id, source_event, reference_id) ;
 * - jamais d'UPDATE ni de DELETE : une correction passe par une ecriture
 *   compensatoire (xp_delta negatif) ;
 * - les plafonds journaliers (par regle XP) sont verifies avant ecriture.
 */
final class XpLedgerService
{
    public function __construct(
        private readonly LevelService $levels,
        private readonly Codep212ConfigService $config,
    ) {
    }

    /**
     * Enregistre une attribution d'XP de maniere idempotente.
     *
     * Si l'ecriture existe deja (meme utilisateur, meme source, meme reference),
     * l'ecriture existante est retournee : aucun double effet.
     *
     * @param int $xpDelta Valeur positive (attribution) ou negative (correction).
     */
    public function record(
        User $user,
        string $sourceEvent,
        int|string $referenceId,
        int $xpDelta,
        ?string $trackType = null,
        ?string $adminJustification = null,
        ?int $ruleVersion = null,
        bool $skipDailyCap = false,
    ): XpLedgerEntry {
        if ($xpDelta === 0) {
            throw new \InvalidArgumentException('Un ecriture XP doit avoir un delta non nul.');
        }

        if ($trackType !== null && TrackCode::tryFrom($trackType) === null) {
            throw new \InvalidArgumentException(sprintf('Voie de progression inconnue : %s', $trackType));
        }

        $scopedEvent = XpSource::scoped($sourceEvent, $trackType);

        if (! $skipDailyCap && $xpDelta > 0) {
            $this->assertWithinDailyCap($user, $sourceEvent, $trackType, $xpDelta);
        }

        try {
            /** @var XpLedgerEntry $entry */
            $entry = DB::transaction(function () use ($user, $scopedEvent, $sourceEvent, $referenceId, $xpDelta, $trackType, $adminJustification, $ruleVersion): XpLedgerEntry {
                return XpLedgerEntry::create([
                    'user_id' => $user->getKey(),
                    'track_type' => $trackType,
                    'xp_delta' => $xpDelta,
                    'source_event' => $scopedEvent,
                    'reference_id' => (string) $referenceId,
                    'rule_version' => $ruleVersion ?? $this->ruleVersionFor($sourceEvent, $trackType),
                    'admin_justification' => $adminJustification,
                ]);
            });
        } catch (QueryException $exception) {
            if (! $this->isUniqueViolation($exception)) {
                throw $exception;
            }

            $existing = XpLedgerEntry::query()
                ->where('user_id', $user->getKey())
                ->where('source_event', $scopedEvent)
                ->where('reference_id', (string) $referenceId)
                ->first();

            if ($existing === null) {
                throw $exception;
            }

            return $existing;
        }

        $this->levels->syncUser($user);

        return $entry;
    }

    /**
     * Ecriture compensatoire : annule tout ou partie d'une attribution.
     *
     * L'original n'est jamais modifie (append-only) ; la compensation est une
     * nouvelle ecriture negative, referencee par l'identifiant de l'original.
     */
    public function compensate(
        XpLedgerEntry $entry,
        int $amount,
        string $justification,
        ?int $actorId = null,
    ): XpLedgerEntry {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Le montant de compensation doit etre positif.');
        }

        if ($amount > abs((int) $entry->xp_delta)) {
            throw new \InvalidArgumentException('Le montant de compensation depasse la valeur de l ecriture d origine.');
        }

        return $this->record(
            $entry->user,
            XpSource::REVERSAL,
            $entry->getKey(),
            -$amount,
            $entry->track_type,
            $justification,
            $entry->rule_version,
            skipDailyCap: true,
        );
    }

    /**
     * Total XP (global ou de voie) d'un utilisateur.
     */
    public function total(User $user, ?string $trackType = null): int
    {
        return (int) XpLedgerEntry::query()
            ->where('user_id', $user->getKey())
            ->when($trackType === null, static fn ($query) => $query->whereNull('track_type'))
            ->when($trackType !== null, static fn ($query) => $query->where('track_type', $trackType))
            ->sum('xp_delta');
    }

    /**
     * XP attribue aujourd'hui pour un evenement donne.
     */
    public function awardedToday(User $user, string $sourceEvent, ?string $trackType = null): int
    {
        return (int) XpLedgerEntry::query()
            ->where('user_id', $user->getKey())
            ->where('source_event', XpSource::scoped($sourceEvent, $trackType))
            ->where('created_at', '>=', Carbon::now()->startOfDay())
            ->sum('xp_delta');
    }

    /**
     * Regle XP applicable a un evenement (et eventuellement a une voie).
     */
    public function ruleFor(string $sourceEvent, ?string $trackType = null): ?XpRule
    {
        return XpRule::query()
            ->where('source_event', $sourceEvent)
            ->where('active', true)
            ->where(function ($query) use ($trackType): void {
                $query->whereNull('track_code');
                if ($trackType !== null) {
                    $query->orWhere('track_code', $trackType);
                }
            })
            ->orderByRaw('track_code IS NULL DESC')
            ->first();
    }

    /**
     * Verifie le plafond journalier (regle XP puis plafond global de la voie).
     */
    private function assertWithinDailyCap(User $user, string $sourceEvent, ?string $trackType, int $xpDelta): void
    {
        $rule = $this->ruleFor($sourceEvent, $trackType);

        if ($rule?->daily_cap !== null) {
            $alreadyAwarded = $this->awardedToday($user, $sourceEvent, $trackType);

            if ($alreadyAwarded + $xpDelta > $rule->daily_cap) {
                throw new XpCapExceededException(
                    sprintf(
                        'Plafond journalier atteint pour « %s » (%d XP maximum par jour).',
                        $rule->name,
                        $rule->daily_cap
                    ),
                    ['xp' => [sprintf('Maximum %d XP par jour pour cette regle.', $rule->daily_cap)]]
                );
            }
        }

        /** @var array<string, mixed> $config */
        $config = $this->config->questsConfig();
        /** @var array<string, int> $caps */
        $caps = (array) ($config['daily_caps'] ?? []);
        $globalCap = (int) ($caps['global'] ?? 0);

        if ($globalCap > 0 && $trackType === null) {
            $awardedToday = (int) XpLedgerEntry::query()
                ->where('user_id', $user->getKey())
                ->whereNull('track_type')
                ->where('created_at', '>=', Carbon::now()->startOfDay())
                ->sum('xp_delta');

            if ($awardedToday + $xpDelta > $globalCap) {
                throw new XpCapExceededException(
                    sprintf('Plafond journalier global atteint (%d XP par jour).', $globalCap),
                    ['xp' => [sprintf('Maximum %d XP par jour.', $globalCap)]]
                );
            }
        }

        $trackCap = (int) ($caps['per_track'] ?? 0);

        if ($trackCap > 0 && $trackType !== null) {
            $awardedToday = (int) XpLedgerEntry::query()
                ->where('user_id', $user->getKey())
                ->where('track_type', $trackType)
                ->where('created_at', '>=', Carbon::now()->startOfDay())
                ->sum('xp_delta');

            if ($awardedToday + $xpDelta > $trackCap) {
                throw new XpCapExceededException(
                    sprintf('Plafond journalier de voie atteint (%d XP par jour).', $trackCap),
                    ['xp' => [sprintf('Maximum %d XP par jour pour cette voie.', $trackCap)]]
                );
            }
        }
    }

    private function ruleVersionFor(string $sourceEvent, ?string $trackType): int
    {
        return (int) ($this->ruleFor($sourceEvent, $trackType)?->version ?? 1);
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        if ($exception->getCode() === '23505') {
            return true;
        }

        $sqlState = $exception->errorInfo[0] ?? null;

        return $sqlState === '23505';
    }
}
