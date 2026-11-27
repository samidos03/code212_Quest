# Contrat API — Code212 Quest (v1)

- **Base** : `/api/v1`
- **Format** : JSON (UTF-8), `Accept: application/json`
- **Authentification** : Bearer (jeton Sanctum) — `Authorization: Bearer <token>`
- **Langue de l'interface** : français — les clés de la charge utile sont en français.
- **Charte** : magenta `#c5027f`, cyan `#00dfff`, violet `#6701e6` (exposés dans `GET /tracks`).

## 1. Enveloppes de réponse

**Succès**

```json
{
  "data": { "...": "..." },
  "meta": { "pagination": { "current_page": 1, "per_page": 20, "total": 12, "last_page": 1 } }
}
```

**Erreur**

```json
{
  "message": "Solde de germes insuffisant pour cette operation.",
  "errors": { "germes": ["Solde de germes insuffisant pour cette operation."] }
}
```

| Code | Signification |
|---|---|
| 200 / 201 | Succès (lecture / création) |
| 401 | Non authentifié ou jeton invalide |
| 403 | Droits insuffisants, consentement manquant, catégorie bannie |
| 404 | Ressource inexistante |
| 409 | Conflit d'idempotence ou ressource déjà traitée |
| 422 | Validation KO, règle métier KO (plafond, quota, stock, solde) |
| 429 | Quota HTTP (rate limiting) |

Les réponses d'erreur métier utilisent toujours la même forme `{message, errors}`.
Les quotas HTTP : 120 requêtes/min pour l'API, 30/min pour les écritures, 10/min pour l'authentification.

## 2. Récapitulatif des routes

### 2.1 Authentification (public)

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| POST | `/auth/login` | public | Connexion e-mail/matricule + mot de passe → jeton |
| POST | `/auth/uca/callback` | public | Callback SSO UCA (code OIDC) → jeton |
| POST | `/auth/logout` | authentifié | Révocation du jeton courant |
| GET | `/auth/me` | authentifié | Profil de l'utilisateur connecté |

### 2.2 Profil et préférences

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/me` | apprenant | Profil complet (XP, niveau, germes, rôles) |
| PATCH | `/me` | apprenant | Nom, filière, promotion, avatar, langue |
| POST | `/me/pseudonym` | apprenant | Pseudonyme public (+ anonymisation) |
| GET | `/me/preferences` | apprenant | Préférences (consentement, notifications, thème) |
| PUT | `/me/preferences` | apprenant | Mise à jour du consentement « mode compétition » |

### 2.3 Tableau de bord, quêtes et journal XP

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/dashboard` | apprenant | Synthèse : progression, quêtes, badges, journal |
| GET | `/quests` | apprenant | Catalogue des quêtes (filtres : voie, difficulté, recherche) |
| POST | `/quests` | formateur, admin | Création d'une quête (+ étapes) |
| GET | `/quests/{id}` | apprenant | Détail d'une quête, étapes et progression personnelle |
| POST | `/quests/{id}/enroll` | apprenant | Inscription (idempotente) |
| POST | `/quests/{id}/steps/{step}/submit` | apprenant | Soumission d'étape (**idempotente**) |
| GET | `/ledger` | apprenant | Journal XP personnel (lecture seule) |
| GET | `/leaderboards` | apprenant | Classement (consentement obligatoire) |

### 2.4 Productions, boutique et commandes

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/submissions` | formateur | File d'attente des productions à corriger |
| POST | `/submissions/{id}/approve` | formateur | Approbation (ou rejet) → XP + germes |
| GET | `/rewards` | apprenant | Catalogue de la boutique |
| POST | `/rewards/{id}/purchase` | apprenant | Achat atomique (débit du solde + stock) |
| GET | `/orders` | apprenant | Commandes de l'utilisateur |
| PATCH | `/orders/{id}/approve` | admin | Approbation d'une commande |
| PATCH | `/orders/{id}/reject` | admin | Rejet → remboursement des germes (extension) |

### 2.5 Badges, voies, niveaux, parcours, missions, challenges

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/badges` | apprenant | Catalogue des badges + mes badges |
| GET | `/badges/{code}` | apprenant | Détail d'un badge + preuve Open Badges |
| GET | `/tracks` | public (authentifié) | Les 4 voies de progression |
| GET | `/levels` | apprenant | Niveaux 1..10 + ma progression |
| GET | `/paths` | apprenant | Parcours d'apprentissage |
| GET | `/paths/{id}` | apprenant | Détail d'un parcours et de ses étapes |
| GET | `/missions` | apprenant | Missions disponibles + statut de revendication |
| POST | `/missions/{id}/claim` | apprenant | Revendication (une seule fois) |
| GET | `/challenges` | apprenant | Challenges et statut |
| POST | `/challenges/{id}/join` | apprenant | Inscription à un challenge |
| POST | `/challenges/{id}/submissions` | apprenant | Dépôt d'une solution de code |

### 2.6 La Forge

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/forge/categories` | apprenant | Catégories de la Forge |
| GET | `/forge/threads` | apprenant | Fils de discussion |
| POST | `/forge/threads` | apprenant | Ouvrir un fil |
| GET | `/forge/threads/{id}` | apprenant | Fil + solutions |
| POST | `/forge/threads/{id}/replies` | apprenant | Réponse (= solution proposée) |
| POST | `/forge/solutions/{id}/accept` | demandeur | Validation d'une solution → récompense |
| POST | `/forge/threads/{id}/report` | apprenant | Signalement (fil ou solution) |

### 2.7 Administration

| Méthode | Route | Rôle | Usage |
|---|---|---|---|
| GET | `/admin/analytics` | admin | Statistiques de pilotage |
| GET | `/admin/quests` | admin | Toutes les quêtes |
| POST | `/admin/quests` | admin | Créer une quête |
| PATCH | `/admin/quests/{id}` | admin | Modifier / publier une quête |
| GET | `/admin/students` | admin | Liste des apprenants |
| PATCH | `/admin/students/{id}` | admin | Modifier une fiche (rôles, voie, niveau, germes) |
| GET | `/admin/rules/xp` | admin | Baremes XP et plafonds |
| PUT | `/admin/rules/xp` | admin | Modifier un bareme (montant, plafonds, activation) |
| GET | `/admin/moderation/reports` | modérateur | Signalements en attente |
| POST | `/admin/moderation/reports/{id}/resolve` | modérateur | Résolution (masquer / verrouiller / rejeter) |
| GET | `/admin/moderation/audit` | admin | Journal d'audit (extension) |
| GET | `/admin/orders` | admin | Commandes de la boutique |

## 3. Exemples de charges utiles

### 3.1 Connexion

```http
POST /api/v1/auth/login
{ "identifiant": "amina.bouzid@uca.ma", "mot_de_passe": "…" }
```

```json
{
  "data": {
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "type": "Bearer",
    "utilisateur": {
      "id": 12, "nom": "Amina Bouzid", "pseudonyme": "AminaCode",
      "niveau": 3, "xp": 1480, "germes": 120,
      "consentement": { "mode_competition": true, "anonymise_classement": false }
    }
  }
}
```

### 3.2 Soumission d'étape (idempotence)

```http
POST /api/v1/quests/3/steps/2/submit
{ "contenu": { "reponse": "A", "code": "..." }, "commentaire": "Merci pour la relecture" }
```

- La clé d'idempotence est `(user_id, quest_id, quest_step_id)`.
- Rejouer la **même** requête renvoie la soumission existante (201, pas de double effet).
- Rejouer avec un **contenu différent** renvoie `409` (`errors.idempotence`).

### 3.3 Achat boutique

```http
POST /api/v1/rewards/4/purchase
{ "quantite": 1 }
```

- Transaction atomique : `lockForUpdate()` sur le stock et sur le solde.
- Solde insuffisant → `422` (`errors.germes`), stock insuffisant → `422`.
- Succès : commande `en_attente`, solde décrémenté, stock décrémenté, écriture `germes_ledger` (`-cout`).

### 3.4 Classement

```json
{
  "data": [
    { "rang": 1, "user_id": 12, "pseudonyme": "AminaCode", "niveau": 5, "xp": 4320, "voie": "codeur" }
  ],
  "meta": {
    "ma_position": { "rang": 1, "pseudonyme": "AminaCode", "niveau": 5, "xp": 4320 },
    "consentement": {
      "mode_competition": true,
      "policy": "Les participants n affiche que leur pseudonyme ; aucune donnee personnelle n est exposee."
    }
  }
}
```

> Seuls les comptes ayant activé le **mode compétition** (`PUT /me/preferences`) figurent au classement.
> Aucune donnée personnelle (nom, e-mail, matricule) n'est exposée.

### 3.5 Validation d'une solution de la Forge

```http
POST /api/v1/forge/solutions/88/accept
{ "note": "Merci, ca m'a debloque." }
```

Récompense : germes + XP selon `config/quests.php` (`forge.germes_reward`, `forge.xp_reward`).
Refus `422` si : auto-validation, quota 5/jour (auteur), quota 2/semaine (demandeur).
Une ligne est ajoutée à `audit_logs` (action `forge.solution_accepted`).

## 4. Règles métier opposables

| # | Règle | Implémentation |
|---|---|---|
| 1 | Journal XP append-only, attribution unique par source | `xp_ledger` + `UNIQUE(user_id, source_event, reference_id)` + triggers PostgreSQL `no_update` / `no_delete` / `no_truncate` ; corrections par écriture compensatoire (`xp_delta` négatif) |
| 2 | Niveaux calculés côté serveur | `LevelService` recalcule le niveau depuis la somme du journal XP ; seuils en `levels_config` |
| 3 | Achat atomique | `RewardService::purchase()` : `DB::transaction` + `lockForUpdate` (stock + solde), contrôles de non-négativité, écriture `germes_ledger` |
| 4 | Soumission d'étape idempotente | `UNIQUE(user_id, quest_id, quest_step_id)` + `IdempotencyKey` |
| 5 | Récompense La Forge | auteur ≠ demandeur, 5 solutions/jour, 2 solutions/semaine/demandeur, audit obligatoire |
| 6 | Consentement du classement | `competition_opt_in` obligatoire, pseudonymes uniquement |
| 7 | Plafonds journaliers | `xp_rules.daily_cap` + plafonds globaux `config/quests.php` (`daily_caps`) |
| 8 | Audit des actions d'administration | `audit_logs` alimenté par `AuditLogger` (acteur, action, cible, justification, métadonnées, IP) |

## 5. Points de vigilance

- **Open Badges 3.0** : la preuve `credential_jsonld` est produite mais **non signée** (pas de VC-JWT). La signature (clé institutionnelle) reste à mettre en place.
- **Données personnelles** : le classement n'expose que des pseudonymes ; le consentemement est révocable à tout moment via `PUT /me/preferences`.
- **Conformité PNU / CNDP (Maroc)** : minimisation des données, durées de conservation et droit d'opposition à formaliser avec le centre.
- **Idempotence** : la fenêtre de rejeu est illimitée côté serveur (contrainte base). Une stratégie d'expiration des clés peut être ajoutée (`quests.submissions.idempotency_ttl_hours`).
- **Quotas HTTP** : à ajuster selon la capacité du serveur et le nombre d'apprenants.
