<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Barèmes et garde-fous de la plateforme de gamification
    |--------------------------------------------------------------------------
    |
    | Les seuils, quotas et plafonds ci-dessous sont les valeurs par défaut.
    | Les barèmes XP par source sont surchargeables en base via la table
    | `xp_rules` (admin: GET/PUT /api/v1/admin/rules/xp) et la configuration
    | globale via `system_config_rules` (cle `quests`).
    |
    */

    // Plafonds journaliers d'XP (anti-abus) : global + par voie.
    'daily_caps' => [
        'global' => (int) env('QUEST_DAILY_CAP_GLOBAL', 600),
        'per_track' => (int) env('QUEST_DAILY_CAP_TRACK', 300),
    ],

    // Quotas de la Forge (La Forge).
    'forge' => [
        // Nombre maximum de solutions remuneration par auteur et par jour.
        'paid_solutions_per_day' => (int) env('FORGE_PAID_SOLUTIONS_PER_DAY', 5),
        // Nombre maximum de solutions remuneration acceptables par demandeur et par semaine.
        'paid_solutions_per_requester_per_week' => (int) env('FORGE_PAID_SOLUTIONS_PER_REQUESTER_PER_WEEK', 2),
        'xp_reward' => (int) env('FORGE_XP_REWARD', 50),
        'germes_reward' => (int) env('FORGE_GERMES_REWARD', 25),
        'min_body_length' => 30,
    ],

    // Niveaux globaux (les seuils reellement utilises sont en base : levels_config).
    'levels' => [
        'max_level' => 10,
    ],

    // Soumission d'etape : fenetre d'idempotence et delai de reponse formateur.
    'submissions' => [
        'idempotency_ttl_hours' => (int) env('QUEST_IDEMPOTENCY_TTL_HOURS', 24),
        'review_sla_hours' => 72,
        'auto_approve_delay_hours' => (int) env('QUEST_AUTO_APPROVE_DELAY_HOURS', 0),
    ],

    // Classement.
    'leaderboard' => [
        'default_size' => 50,
        'max_size' => 200,
        'min_entries' => 3,
        'include_non_opt_in' => false,
    ],

    // Boutique (germes).
    'rewards' => [
        'max_quantity_per_order' => 10,
        'auto_approve' => false,
        'max_daily_purchases' => (int) env('REWARDS_MAX_DAILY_PURCHASES', 5),
    ],

    // Missions et challenges.
    'missions' => [
        'max_claims_per_day' => 5,
    ],

    'challenges' => [
        'max_entries' => 500,
    ],

    // Reglages du tableau de bord.
    'dashboard' => [
        'recent_ledger_limit' => 10,
        'active_quests_limit' => 5,
    ],

    // Roles exposes (reference metier ; la source de verite reste `users.roles`).
    'roles' => [
        'student' => 'Apprenant',
        'trainer' => 'Formateur / mentor',
        'moderator' => 'Moderateur',
        'admin' => 'Administrateur',
    ],
];
