<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Catalogue des `source_event` ecrits dans `germes_ledger` (monnaie
 * dépensable de la boutique, distincte de l'XP global).
 */
final class GermesSource
{
    public const PURCHASE = 'reward.purchased';
    public const REFUND = 'reward.refunded';
    public const FORGE_REWARD = 'forge.solution_rewarded';
    public const MISSION_REWARD = 'mission.claimed';
    public const ADMIN_GRANT = 'admin.granted';
    public const ADMIN_REVOKE = 'admin.revoked';
}
