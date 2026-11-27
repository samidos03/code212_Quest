# Code212 Quest — Architecture

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navigateur                                                            │
│  React 18 + TypeScript + Vite                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Design system│  │ TanStack     │  │ Adaptateur   │               │
│  │ shadcn/Radix │  │ Query        │  │ API          │               │
│  └──────────────┘  └──────────────┘  └──────┬───────┘               │
└───────────────────────────────────────────────┼───────────────────────┘
                         VITE_USE_MOCK=true     │ VITE_USE_MOCK=false
                                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Laravel 11/12 (API only)                                             │
│  routes/api.php → /api/v1                                             │
│  Controllers → FormRequest → Services transactionnels → Models        │
│  Policies (RBAC) · AuditLogger · Jobs asynchrones                     │
└───────────────────────────────────┬─────────────────────────────────┘
                                    ▼
┌───────────────────────┐  ┌──────────────────┐  ┌────────────────────┐
│ PostgreSQL            │  │ Redis            │  │ Stockage fichiers  │
│ xp_ledger (append-    │  │ cache · files    │  │ (certifications)   │
│ only) · audit_logs    │  │ · queue          │  │                    │
└───────────────────────┘  └──────────────────┘  └────────────────────┘
                                    ▲
                    ┌───────────────┴───────────────┐
                    │  SSO UCA (OIDC) · Libki        │
                    │  (à brancher)                   │
                    └────────────────────────────────┘
```

## 2. Frontend (`apps/web`)

### Arborescence

```
src/
├── components/
│   ├── ui/          primitives shadcn/ui (Radix) — 16 composants
│   ├── layout/      app-shell, sidebar, topbar, brand
│   └── shared/      page-header, stat-card, level-ring, quest-card
├── pages/
│   ├── student/     13 écrans (pédagogique + compétitif)
│   └── admin/       7 écrans (pilotage)
├── services/
│   ├── api.ts       façade unique : mock ⇄ HTTP
│   └── mock/        db.ts (jeu de données) + server.ts (logique métier)
├── hooks/use-api.ts  hooks TanStack Query (queries + mutations)
├── lib/             theme, workspace, navigation, utils
└── types/           types métier alignés sur le contrat API
```

### Règle d'architecture

**Les composants ne parlent jamais au réseau.** Ils appellent `hooks/use-api.ts`, qui appelle `services/api.ts`.
Ce point unique de bascule permet de passer de la démo au backend réel sans toucher une seule vue.

### Dossiers de dépendances

| Dossier | Rôle | Pourquoi |
|---|---|---|
| `lib/` | Utilitaires purs, contexte, configuration | Pas de rendu, testable isolément |
| `services/` | Accès aux données | Seul endroit qui connaît le réseau ou le mock |
| `hooks/` | Orchestration de la donnée | Clés de cache, invalidations, mutations |
| `components/ui/` | Primitives visuelles | API stable, indépendantes du métier |
| `components/shared/` | Composants métier transverses | Connaissent le domaine, pas les routes |
| `pages/` | Écrans | Assemble, ne réimplémente pas |

### Thème

Le thème n'est pas un simple sélecteur de palette : il est **déclaratif par route**.
`lib/theme.tsx` expose `resolveRouteTheme(pathname)` ; l'espace compétitif force le sombre.
Un choix manuel de l'utilisateur est persisté et prend le pas sur la règle de route.

### Adaptateur de démonstration

`services/mock/server.ts` n'est pas une simple liste de données : il **reproduit les invariants du
backend** — clé d'idempotence sur le ledger, gains uniques, achat atomique avec solde et stock
contrôlés, quotas de la Forge, respect du consentement au classement. Le comportement de la démo est
donc aligné sur ce que fera Laravel.

## 3. Backend (`apps/api`)

### Couches

| Couche | Emplacement | Responsabilité |
|---|---|---|
| Routes | `routes/api.php` | 60 routes `/api/v1`, middlewares de rôle et de débit |
| Contrôleurs | `app/Http/Controllers/Api/V1` | Minces : validation, appel de service, ressource |
| Requêtes | `app/Http/Requests` | Validation des entrées (FormRequest) |
| Ressources | `app/Http/Resources` | Sérialisation normalisée `{ data, meta }` |
| Services | `app/Services` | Logique métier transactionnelle |
| Politiques | `app/Policies` | Autorisations par rôle et par ressource |
| Modèles | `app/Models` | 34 modèles Eloquent |
| Migrations | `database/migrations` | 35 migrations PostgreSQL (jsonb, contraintes, triggers) |

### Services métier clés

| Service | Invariant garanti |
|---|---|
| `XpLedgerService` | Écriture idempotente, delta non nul, plafond journalier, correction compensatoire |
| `LevelService` | Seuil de niveau issu de `levels_config`, progression monotone |
| `RewardService` | Achat atomique : `lockForUpdate` sur stock et solde, solde non négatif |
| `ForgeRewardService` | Quota 5/jour, 2/semaine par demandeur, auto-validation interdite |
| `LeaderboardService` | Consentement obligatoire, pseudonymisation, aucun profil non-optant |
| `BadgeService` | Évaluation des règles, preuve, statut de révocation |
| `AuditLogger` | Trace de toute action d'administration |

### Modèle de données (35 tables)

Le cœur est `xp_ledger` :

```sql
xp_ledger(
  id, user_id, track_type,      -- NULL = XP global ; sinon points de voie
  xp_delta CHECK (xp_delta <> 0),
  source_event, reference_id,
  rule_version, admin_justification, created_at,
  UNIQUE (user_id, source_event, reference_id)   -- ← idempotence
)
```

Un **trigger PostgreSQL** interdit `UPDATE`, `DELETE` et `TRUNCATE` sur cette table : le journal est
append-only au niveau de la base, pas seulement de l'application. Une correction passe par une
écriture compensatoire (`xp_delta` négatif).

Les germes suivent le même modèle (`germes_ledger` append-only) avec un solde materialisé et verrouillé
sur `users.germes_balance`.

## 4. Sécurité

| Contrôle | Mise en œuvre |
|---|---|
| Authentification | Sanctum (jetons) + callback OIDC UCA câblé, non branché |
| Autorisations | 6 policies + abilities par rôle (`abilities` middleware) |
| Anti-double-gain | Contrainte unique en base, pas seulement en code |
| Anti-abus | Plafonds journaliers par règle XP, quotas de la Forge, rate limiting |
| Atomicité | Transactions SQL + verrous de ligne sur les écritures concurrentes |
| Traçabilité | `audit_logs` : acteur, action, cible, justification, métadonnées |
| Confidentialité | Consentement au classement, minimisation, pseudonymisation |
| Protection des données | Pas de sanction automatique ; recours prévu ; agrégation des cohortes |

## 5. Modèle de rôles

| Rôle | Capacités |
|---|---|
| `student` | Quêtes, missions, chemins, badges, boutique (achat), Forge (participation), classement (si opt-in) |
| `trainer` | Création et publication de quêtes, validation de livrables, animation de sessions |
| `moderator` | Modération de la Forge (par rubrique), signalements, bannissements temporaires |
| `admin` | Tout : règles XP, commandes, élèves, analytics, audit |

Les rôles sont stockés en `users.roles` (jsonb) et contrôlés par les policies.

## 6. Ce qui reste à confirmer côté institution

1. **OIDC UCA** : issuer, client, scopes (`matricule`, `filiere`, `promotion`), durée de session.
2. **Libki** : format et fréquence des événements de présence, quotas, protection des données.
3. **Émetteur Open Badges** : identité de l'émetteur, gouvernance des clés, politique de révocation.
4. **Protection des données** : registre des traitements, base légale pour le classement et les analyses de cohorte.
5. **Charte de modération** : seuils de sanction, durée des bannissements, procédure de recours.
