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
| GET | `/admin/submissions` | formateur | Même file, paramètres `statut` et `limite` (§6.6) |
| POST | `/admin/submissions/{id}/review` | formateur | Approuver ou renvoyer avec commentaire (§6.7) |
| POST | `/quests/{q}/steps/{s}/submit` | apprenant | Dépôt d'une tentative de quête finale (§6.5) |
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
| GET | `/paths` | apprenant | Parcours d'apprentissage (avec modules et progression) |
| GET | `/paths/{id}` | apprenant | Détail d'un parcours, de ses modules et étapes |
| POST | `/paths/{id}/enroll` | apprenant | Inscription au parcours (idempotente) |
| GET | `/paths/{id}/modules/{step}` | apprenant inscrit | Chapitres, QCM tirés au sort, quête finale (§6.3) |
| POST | `/exercises/{id}/attempt` | apprenant inscrit | Réponse à un QCM facultatif (§6.4) |
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
| 2 | Niveaux calculés côté serveur | `LevelService` recalcule le niveau depuis la somme de **toutes** les écritures du journal XP (XP de voie compris, décision nov. 2026) ; seuils en `levels_config` |
| 3 | Achat atomique | `RewardService::purchase()` : `DB::transaction` + `lockForUpdate` (stock + solde), contrôles de non-négativité, écriture `germes_ledger` |
| 4 | Soumission d'étape : une tentative en attente à la fois | `quest_submissions.attempt_number` (nouvelle ligne par tentative après un renvoi), clé `IdempotencyKey` suffixée par tentative ; 409 si une tentative est déjà en attente ou si le module est validé |
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

## 6. Parcours en modules, QCM et revue formateur

Contrat vérifié le 27/11/2026 sur PostgreSQL, base seedée (`migrate:fresh --seed`), avec les comptes de démonstration. Les exemples ci-dessous sont des réponses réelles, raccourcies (`…`).

### 6.1 Modèle

- Un **parcours** (`learning_paths`) contient des **modules** ordonnés (`path_steps`, `type = module`). Chaque module pointe vers sa **quête finale** (`path_steps.quest_id`).
- Un module contient des **chapitres** (`module_lessons`). Chaque chapitre contient des **exercices** (`lesson_exercises`), aujourd'hui uniquement des QCM.
- Un QCM porte un **pool** de questions dans `validation_rules.pool`. L'API en tire une à chaque lecture.
- **Les chapitres et QCM sont facultatifs.** Seule l'approbation de la quête finale par un formateur termine un module et débloque le suivant.

Statuts d'un module (`statut`) :

| Valeur | Sens |
|---|---|
| `non_inscrit` | L'apprenant n'est pas inscrit au parcours |
| `verrouille` | Le module précédent n'est pas encore approuvé |
| `en_cours` | Module ouvert, quête finale non déposée |
| `en_attente` | Tentative déposée, en attente du formateur |
| `a_revoir` | Tentative renvoyée avec commentaire : une nouvelle tentative est possible |
| `termine` | Quête finale approuvée |

### 6.2 `GET /paths` et `GET /paths/{id}` / `POST /paths/{id}/enroll`

```json
{
  "data": {
    "id": 1, "code": "P-FULLSTACK", "titre": "Parcours Développeur Full-Stack",
    "voie": "codeur", "niveau_min": 1, "niveau_max": 4, "bonus_xp": 500, "bonus_germes": 100,
    "publie": true, "inscrit": false, "progression": 0,
    "modules_total": 3, "modules_termines": 0,
    "modules": [
      { "id": 1, "titre": "Module 1 : Fondations Web (HTML & CSS Modernes)", "description": "…",
        "ordre": 1, "statut": "non_inscrit", "exercices_total": 2, "exercices_passes": 0, "quete_id": 1 }
    ],
    "etapes": [ { "id": 1, "titre": "…", "type": "module", "reference_type": "quete",
                  "reference_id": "Q-FULLSTACK-001", "ordre": 1, "xp": 150 } ]
  }
}
```

`POST /paths/{id}/enroll` → **201**, idempotent (un second appel renvoie la même inscription) :

```json
{ "data": { "inscription_id": 1, "parcours_id": 1, "statut": "en_cours",
            "progression": { "inscrit": true, "progression_pourcentage": 0,
                             "modules_total": 3, "modules_termines": 0, "modules": [ … ] } } }
```

### 6.3 `GET /paths/{id}/modules/{step}`

**200** pour un module accessible :

```json
{
  "data": {
    "id": 1, "parcours_id": 1, "titre": "Module 1 : …", "ordre": 1, "statut": "en_cours",
    "exercices_total": 2, "exercices_passes": 0, "exercices_termines": false,
    "lecons": [
      { "id": 1, "titre": "Structure & Sémantique HTML5", "resume": "…",
        "points_cles": ["<main> identifie le contenu central…", "…"],
        "contenu": "…", "exemple_code": "<main …>…</main>", "exemple_explication": "…",
        "ordre": 1, "duree_minutes": 15,
        "exercices": [
          { "id": 1, "titre": "Quiz : Sémantique HTML5",
            "instructions": "Un lecteur d’écran doit annoncer le menu principal du site. Quelle balise l’entoure ?",
            "question_id": "q3", "taille_pool": 3,
            "code_depart": null, "type_validation": "qcm",
            "options": [ { "id": "b", "label": "<nav>" }, { "id": "d", "label": "<ul> seule" }, … ],
            "ordre": 1, "reussi": false, "tentatives": 0 }
        ] }
    ],
    "quete_finale": {
      "id": 1, "code": "Q-FULLSTACK-001", "titre": "Quête finale : Page de profil responsive",
      "description": "…", "etape_id": 1, "xp": 150, "germes": 30, "debloquee": true,
      "soumission": null
    }
  }
}
```

- `question_id` et `instructions` changent d'une lecture à l'autre (tirage dans le pool). Les options sont mélangées. **La bonne réponse et l'explication ne sont jamais renvoyées.**
- Le front garde la question affichée tant que l'apprenant n'a pas demandé « Tirer une autre question », et renvoie son `question_id`.
- Après un dépôt, `quete_finale.soumission` vaut `{ "id", "statut", "tentative", "commentaire_formateur", "date_soumission" }`. `commentaire_formateur` contient le retour du formateur après un renvoi ou une approbation.

Erreurs : **403** si l'apprenant n'est pas inscrit ou si le module est verrouillé :

```json
{ "message": "Inscrivez-vous au parcours et terminez les modules précédents pour accéder à ce module.", "errors": {} }
```

### 6.4 `POST /exercises/{id}/attempt`

Requête :

| Champ | Type | Règle |
|---|---|---|
| `reponse` | string | obligatoire, ≤ 10 000 caractères (identifiant d'option pour un QCM) |
| `question_id` | string | obligatoire pour un QCM à pool : celui renvoyé par §6.3 |

**201** :

```json
{ "data": { "reussi": true, "message": "Bonne réponse ! La balise <main> identifie…", "tentative": 2 } }
```

Une mauvaise réponse renvoie aussi **201** avec `reussi: false` : la tentative est enregistrée, sans aucune conséquence sur la progression.

**422** :

```json
{ "message": "Les donnees transmises sont invalides.", "errors": { "reponse": ["Votre réponse ou code est requis pour soumettre cet exercice."] } }
{ "message": "Les donnees transmises sont invalides.", "errors": { "question_id": ["Question inconnue pour ce QCM. Rechargez le chapitre."] } }
```

Aucune tentative n'est enregistrée en cas de 422. Le QCM rapporte 0 XP : on mesure la maîtrise, pas le nombre de clics.

### 6.5 Quête finale : `POST /quests/{quest}/steps/{step}/submit`

Requête :

| Champ | Type | Règle |
|---|---|---|
| `contenu` (ou `content`) | string | obligatoire : lien de dépôt ou extrait de code |
| `commentaire` | string | facultatif, ≤ 5 000 caractères (note pour le formateur) |

**201** : la tentative est créée **en attente**. Aucun XP n'est versé à ce stade.

```json
{ "data": { "id": 1, "quete_id": 1, "etape_id": 1, "contenu": { "content": "https://github.com/…" },
            "commentaire": "Testé sur mobile", "statut": "en_attente", "statut_libelle": "En attente",
            "xp_obtenu": 0, "feedback": null, "envoye_le": "2026-11-27T21:27:01+00:00",
            "corrige_le": null, "idempotence": "quest-step:3:1:1" } }
```

Erreurs :

| Code | Cas | `message` |
|---|---|---|
| 422 | `contenu` absent | `errors.content` : « Le contenu de la soumission est obligatoire. » |
| 403 | Pas inscrit au parcours | « Vous devez vous inscrire au parcours avant de soumettre cette quête. » |
| 422 | Module verrouillé | « Cette quête finale est verrouillée tant que les modules précédents ne sont pas validés par un formateur. » |
| 409 | Une tentative est déjà en attente | « Une tentative est déjà en attente de correction par un formateur. » |
| 409 | Module déjà validé | « Ce module est déjà validé : aucune nouvelle tentative n’est nécessaire. » |

Après un renvoi (`a_revoir`), un nouvel appel crée la tentative suivante (`tentative` + 1). La clé d'idempotence est alors suffixée (`…:2`).

### 6.6 File formateur : `GET /admin/submissions` (et `GET /submissions`)

Rôle : formateur, modérateur ou admin. Paramètres : `statut` (`en_attente`, `a_revoir`, `approuvee`, `rejetee`) et `limite` (1 à 100, 20 par défaut). Avec `statut=en_attente`, la liste va du plus ancien au plus récent. Sans filtre, elle va du plus récent au plus ancien.

```json
{
  "data": [
    { "id": 1, "quest_id": 1, "quest_step_id": 1,
      "titre": "Quête finale : Page de profil responsive — Livrable final : …",
      "contenu": "https://github.com/…", "lien": "https://github.com/…",
      "statut": "en_attente", "xp": 150, "germes": 30,
      "feedback": null, "tentative": 1, "correcteur": null,
      "envoye_le": "2026-11-27T21:27:01+00:00", "corrige_le": null,
      "apprenant": { "id": 3, "pseudonyme": "AminaCode" } }
  ],
  "meta": { "pagination": { "current_page": 1, "per_page": 20, "total": 1, "last_page": 1 } }
}
```

`note` et `status` restent présents comme alias historiques de `feedback` et `statut`.

### 6.7 Décision : `POST /admin/submissions/{id}/review`

Alias : `POST /submissions/{id}/review` et `POST /submissions/{id}/approve`.

| Champ | Valeurs | Règle |
|---|---|---|
| `decision` | `approve` / `validee` / `approuvee`, `a_revoir` / `revoir`, `reject` / `rejetee` | `approve` par défaut |
| `feedback` | string ≤ 5 000 | **obligatoire** pour `a_revoir` et `rejetee` |

**200** : la soumission est renvoyée avec `statut`, `feedback`, `tentative` et `correcteur { id, nom }`.

- `approve` : la tentative passe à `approuvee`. XP et germes sont versés une seule fois (journal append-only, clé unique). Le module passe à `termine` et le suivant à `en_cours`.
- `a_revoir` : l'apprenant voit `a_revoir` et le commentaire. Il peut déposer une nouvelle tentative.

Erreurs :

| Code | Cas |
|---|---|
| 422 | `decision` inconnue (`errors.decision`) ou `feedback` manquant pour un renvoi (`errors.feedback` : « Un commentaire est obligatoire pour renvoyer ou rejeter un livrable. ») |
| 403 | L'appelant n'est pas formateur : `{ "message": "Action non autorisée pour votre rôle.", "errors": {} }` |
| 409 | Tentative déjà traitée, ou tentative remplacée par une plus récente : « La tentative de quête associée n’est plus en attente de correction. » |

### 6.8 Erreurs transverses

| Code | Corps |
|---|---|
| 401 | `{ "message": "Authentification requise.", "errors": {} }` |
| 403 | `{ "message": "Action non autorisée pour votre rôle.", "errors": {} }` (refus de policy ou de FormRequest) ou message métier |
| 422 | `{ "message": "Les donnees transmises sont invalides.", "errors": { "<champ>": ["…"] } }`, messages en français (`lang/fr/validation.php`) |

### 6.9 Alignement frontend

| Endpoint | Adaptateur web (`apps/web/src/services/api.ts`) |
|---|---|
| `GET /paths`, `/paths/{id}` | `adaptPath` → `LearningPath.modules[]` |
| `GET /paths/{id}/modules/{step}` | `adaptModuleDetail` → `ModuleDetail` (`questionId`, `poolSize`) |
| `POST /exercises/{id}/attempt` | `api.submitExercise(id, reponse, questionId)` |
| `POST /quests/{q}/steps/{s}/submit` | `api.submitStep` |
| `GET /admin/submissions?limite=100` | `adaptSubmission` (`attempt`, `feedback`, `reviewerName`, `a_revoir` conservé) |
| `POST /admin/submissions/{id}/review` | `api.reviewSubmission(id, 'validee' \| 'a_revoir', feedback)` |

Le mode mock (`VITE_USE_MOCK=true`) lit `services/mock/fullstack-fixture.ts`, généré depuis la base seedée : mêmes identifiants, mêmes 3 modules et 8 chapitres.
