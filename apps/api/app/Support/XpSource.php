<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Catalogue des `source_event` ecrits dans `xp_ledger`.
 *
 * Un evenement doit toujours correspondre a une entite metier precise : la
 * contrainte UNIQUE(user_id, source_event, reference_id) garantit qu'un XP ne
 * peut etre attribue deux fois pour la meme source.
 */
final class XpSource
{
    public const QUEST_ENROLLED = 'quest.enrolled';
    public const QUEST_STEP_APPROVED = 'quest.step_approved';
    public const QUEST_COMPLETED = 'quest.completed';
    public const SUBMISSION_APPROVED = 'submission.approved';
    public const FORGE_SOLUTION_REWARDED = 'forge.solution_rewarded';
    public const MISSION_CLAIMED = 'mission.claimed';
    public const CHALLENGE_COMPLETED = 'challenge.completed';
    public const BADGE_ISSUED = 'badge.issued';
    public const LIBKI_CHECK_IN = 'libki.check_in';
    public const LIBKI_RESERVATION_HONORED = 'libki.reservation_honored';
    public const DAILY_STREAK = 'daily.streak';
    public const ADMIN_ADJUSTMENT = 'admin.adjustment';
    public const REVERSAL = 'admin.reversal';

    /**
     * Suffixe applique aux evenements rattaches a une voie de progression.
     *
     * Exemple : `quest.step_approved.track.codeur`. Cela permet d'accorder un
     * XP global et un XP de voie pour la meme reference sans violer la
     * contrainte d'unicite (user_id, source_event, reference_id).
     */
    public static function scoped(string $sourceEvent, ?string $trackCode): string
    {
        if ($trackCode === null || $trackCode === '') {
            return $sourceEvent;
        }

        return sprintf('%s.track.%s', $sourceEvent, $trackCode);
    }
}
