# Code212 Quest — API (Laravel 11/12, API only)

API de la plateforme de gamification **Code212 Quest** du centre CODE212
(Université Cadi Ayyad, Marrakech). Le front React/TS est **déjà construit** et
n'est pas modifié par ce dépôt : cette API en est le backend de référence.

- Stack : Laravel 11/12 (PHP 8.2+), PostgreSQL 14+, Redis, Sanctum (jetons API), OIDC/SSO UCA.
- Langue de l'interface : **français**. Devise : **XP global permanent** (niveaux) + **germes** (boutique).
- Charte : magenta `#c5027f`, cyan `#00dfff`, violet `#6701e6`.
- Rôles : `student` (apprenant), `trainer` (formateur/mentor), `moderator` (modérateur), `admin` (administrateur).

## 1. Installation

```bash
# Dépendances
composer install

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données (PostgreSQL)
createdb code212_quest
php artisan migrate --seed

# Redis (cache / file d'attente / sessions)
redis-server

# Stockage public + serveur de développement
php artisan storage:link
php artisan serve            # http://localhost:8000
```

Vérification rapide : `GET /api/v1/levels` (jeton requis) et `GET /up` (santé Laravel).

### Tests

```bash
php artisan test                      # ou : vendor/bin/phpunit
php artisan test --filter=LedgerIdempotencyTest
```

> Les tests utilisent **PostgreSQL** (`phpunit.xml` : `DB_CONNECTION=pgsql`) car le schéma
> repose sur `jsonb`, index uniques partiels et triggers `append-only`.
> Créez au préalable une base de test (`DB_DATABASE=code212_quest_test`) et adaptez
> `phpunit.xml` si votre configuration diffère.

## 2. Configuration

| Domaine | Variables | Commentaire |
|---|---|---|
| Application | `APP_KEY`, `APP_ENV`, `APP_DEBUG`, `APP_URL` | `APP_TIMEZONE=Africa/Casablanca`, `APP_LOCALE=fr` |
| PostgreSQL | `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `pgsql` par défaut |
| Redis | `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | cache, file d'attente, sessions |
| CORS | `CORS_ALLOWED_ORIGINS`, `CORS_SUPPORTS_CREDENTIALS` | ex. `http://localhost:5173` |
| Sanctum | `SANCTUM_STATEFUL_DOMAINS`, `SANCTUM_TOKEN_PREFIX`, `SANCTUM_EXPIRATION` | jetons Bearer stateless |
| SSO UCA (OIDC) | `UCA_OIDC_ENABLED`, `UCA_OIDC_ISSUER`, `UCA_OIDC_CLIENT_ID`, `UCA_OIDC_CLIENT_SECRET`, `UCA_OIDC_REDIRECT_URI`, `UCA_OIDC_SCOPES` | `POST /api/v1/auth/uca/callback` |
| API Libki | `LIBKI_API_ENABLED`, `LIBKI_API_BASE_URL`, `LIBKI_API_TOKEN`, `LIBKI_WEBHOOK_SECRET` | présence / réservations |
| Gamification | `QUEST_DAILY_CAP_GLOBAL`, `QUEST_DAILY_CAP_TRACK`, `FORGE_PAID_SOLUTIONS_PER_DAY`, `FORGE_PAID_SOLUTIONS_PER_REQUESTER_PER_WEEK`, `REWARDS_MAX_DAILY_PURCHASES` | surcharge de `config/quests.php` |

Les barèmes XP, les seuils de niveaux et les quotas applicatifs sont **en base**
(`xp_rules`, `levels_config`, `system_config_rules`) et administrables via l'API.

## 3. Arborescence

```
apps/api
├── app
│   ├── Enums/            UserRole, QuestDifficulty, SubmissionStatus, RewardStatus,
│   │                     ForgeThreadStatus, IssuedBadgeStatus, ChallengeStatus, TrackCode…
│   ├── Exceptions/       BusinessRuleException + erreurs métier (solde, quota, plafond, idempotence)
│   ├── Http
│   │   ├── Controllers/Api/V1/   Auth, Me, Dashboard, Quest, Submission, Ledger, Leaderboard,
│   │   │                         Reward, Order, Badge, Track, Level, LearningPath, Mission,
│   │   │                         Challenge, Forge + Admin/ (quests, students, rules, moderation, orders)
│   │   ├── Middleware/   ForceJsonResponse, EnsureUserHasRole
│   │   ├── Requests/     validation (FormRequest)
│   │   └── Resources/    sérialisation JSON (français)
│   ├── Models/           34 modèles Eloquent (users, quêtes, XP, boutique, Forge, audit…)
│   ├── Policies/         Quest, Submission, Reward, Admin, ForgeModeration, Challenge
│   ├── Providers/        AppServiceProvider (policies, Sanctum, rate limiting)
│   ├── Services/         XpLedgerService, LevelService, QuestService, RewardService,
│   │                     ForgeRewardService, BadgeService, LeaderboardService,
│   │                     DashboardService, AnalyticsService, AuditLogger, Codep212ConfigService,
│   │                     MissionService, ChallengeService
│   └── Support/          ApiResponse, IdempotencyKey, XpSource, GermesSource
├── bootstrap/app.php     configuration API-only (routage, middlewares, erreurs JSON)
├── config/               app, auth, cache, database, filesystems, logging, queue, sanctum,
│                         cors, quests, services, session
├── database
│   ├── migrations/       35 migrations PostgreSQL (horodatées et ordonnées)
│   ├── schema.sql        dump de référence (miroir des migrations)
│   └── seeders/          Role, Track, Level, XpRule, BadgeRule, Quest, Reward, LearningPath,
│                         Mission, ForgeCategory, AdminUser, DemoUser
├── docs/                 API_CONTRACT.md, MIGRATION_PLAN.md
├── routes/api.php        routes /api/v1
└── tests/Feature/        8 tests PHPUnit (invariants métier)
```

## 4. Invariants métier (implémentés et testés)

| # | Invariant | Où |
|---|---|---|
| 1 | Journal XP **append-only** : `UNIQUE(user_id, source_event, reference_id)`, triggers PostgreSQL interdisant UPDATE/DELETE/TRUNCATE, corrections par écriture compensatoire (`xp_delta` négatif) | `xp_ledger`, `XpLedgerService` |
| 2 | Niveaux calculés **côté serveur** à partir de l'XP historique cumulé, seuils configurables | `levels_config`, `LevelService` |
| 3 | Achat boutique **atomique** : `DB::transaction` + `lockForUpdate()` (stock et solde), solde/stock non négatifs, refus si insuffisant, débit tracé dans `germes_ledger` | `RewardService` |
| 4 | Soumission d'étape **idempotente** par `(user_id, quest_id, step_id)` | `quest_submissions`, `QuestService` |
| 5 | Récompense La Forge : auteur ≠ demandeur, 5 solutions/jour, 2 solutions/semaine/demandeur, pas d'auto-validation, journal d'audit | `ForgeRewardService` |
| 6 | Classement : **consentement** « mode compétition » obligatoire, pseudonymes seuls, aucune donnée personnelle | `LeaderboardService` |
| 7 | **Plafonds journaliers** par règle XP + plafonds globaux de voie | `xp_rules.daily_cap`, `config/quests.php` |
| 8 | **Audit** de toutes les actions d'administration | `audit_logs`, `AuditLogger` |

Tests associés : `LedgerIdempotencyTest`, `RewardPurchaseTest`, `LevelProgressionTest`,
`QuestSubmissionTest`, `ForgeRewardQuotaTest`, `LeaderboardConsentTest`,
`RoleAuthorizationTest`, `AdminAuditTest`.

## 5. Documentation

- `docs/API_CONTRACT.md` — contrat complet (méthode / route / rôle / usage), enveloppes JSON,
  codes d'erreur, règles opposables.
- `docs/MIGRATION_PLAN.md` — bascule du front `localStorage` → API, par lots (7 lots),
  points de contrôle et stratégie de repli.

## 6. Points de vigilance

- **Open Badges 3.0** : la preuve `credential_jsonld` est générée mais **non signée**
  (pas de VC-JWT) ; la signature institutionnelle reste à mettre en place.
- **Anti-abus** : quotas journaliers et hebdomadaires, plafond XP global, unicité des
  récompenses. À ajuster après observation de la charge réelle.
- **Données personnelles (PNU / CNDP – Maroc)** : minimisation, consentement explicite
  (classement), durées de conservation et droit d'opposition à formaliser avec le centre.
- **API UCA / Libki** : le SSO OIDC et la synchronisation de présence sont *préparés*
  (config + table `libki_sync_logs`) mais dépendent des accès institutionnels ; l'import
  de présence n'est pas branché (pas de route webhook pour l'instant).
- **PHP n'a pas pu être exécuté** dans l'environnement de rédaction : le code est écrit
  mais **non exécuté ni testé**. Une première passe de validation
  (`composer install && php artisan migrate --seed && php artisan test`) est indispensable.

## 7. Conventions

- PSR-12, `declare(strict_types=1);` partout, typage strict, DocBlocks en français.
- Contrôleurs minces : validation (FormRequest) → service métier → ressource JSON.
- Tables en `snake_case` pluriel, clés étrangères avec `onDelete` adapté, timestamps.
- Migrations avec `down()` correct ; modifications de schéma = nouvelle migration.
