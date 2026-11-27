# Plan de bascule front localStorage → API — Code212 Quest

Objectif : faire passer le front React/TS d'un état **local** (localStorage) à un état **serveur**
(source de vérité PostgreSQL), sans rupture de service et avec une réversibilité à chaque lot.

## Principes

1. **Le front ne calcule plus l'XP ni le niveau.** Ces valeurs sont renvoyées par l'API
   (`/me`, `/dashboard`, `/ledger`) ; le front ne fait que les afficher.
2. **Écriture optimiste, lecture autoritaire.** L'UI peut afficher immédiatement le résultat
   attendu, puis se resynchronise avec la réponse serveur.
3. **Un lot = une fonctionnalité, réversible.** Chaque lot peut être activé par un drapeau
   (`VITE_API_MODE=shadow|live`) côté front.
4. **Journal XP non réécritable.** Aucune reprise de données ne modifie l'historique : les
   écarts constatés sont corrigés par *écritures compensatoires* côté serveur.
5. **Aucun secret côté front.** Les jetons sont émis par l'API (Sanctum) et stockés côté front
   (mémoire + `sessionStorage` en attendant un cookie `HttpOnly`).

## Chronologie indicative

| Lot | Période | Périmètre | Sortie de lot |
|---|---|---|---|
| 0 | S-3 | Socle API, infra, PostgreSQL, Redis | Schéma migré, seeds en place, `GET /health` OK |
| 1 | S-2 | Lecture seule (mirror) | Le front lit l'API mais conserve localStorage comme cache |
| 2 | S-2 | Authentification | Connexion SSO UCA + mot de passe local, plus de `localStorage.user` |
| 3 | S-1 | Écritures cœur (XP, quêtes, journal) | Quêtes, soumissions, XP : serveur autoritaire |
| 4 | S-1 | Boutique, badges, missions, challenges | Germes et récompenses gérés côté serveur |
| 5 | J-0 | La Forge, classement, consentements | Modération et classement conformes au RGPD/PNU |
| 6 | J-1 | Administration | Pilotage, audit, baremes XP paramétrables |
| 7 | J-1 | Bilan et nettoyage | localStorage vidé, mode `live` par défaut |

## Détail par lot

### Lot 0 — Socle (S-3)

- Déploiement de l'API (Laravel 11/12 + PostgreSQL + Redis), `php artisan migrate --seed`.
- Variables d'environnement : `APP_KEY`, `DB_*`, `REDIS_*`, `SANCTUM_*`, `CORS_*`, `UCA_OIDC_*`, `LIBKI_*`.
- Reverse proxy : `/api` vers l'API, `/` vers le front ; TLS actif.
- Contrôle de santé : `GET /up` (Laravel) + `GET /api/v1/levels` (contrôle applicatif).

**Critère de sortie** : migrations et seeds rejouables sur une base vierge ; les 8 tests
`php artisan test` passent.

### Lot 1 — Lecture seule / miroir (S-2)

Objectif : mesurer l'écart entre l'état local et l'état serveur sans rien écrire.

- `GET /api/v1/levels`, `/tracks`, `/quests`, `/rewards`, `/missions`, `/challenges`, `/paths`.
- Le front conserve son store local mais le réhydrate au démarrage de session.
- Journal de comparaison (écart XP, niveau, germes) stocké dans le navigateur pour analyse.

**Risque** : aucun (lecture seule). **Point d'attention** : ne pas recalculer l'XP en local
pour l'affichage, seulement l'afficher.

### Lot 2 — Authentification (S-2)

- `POST /auth/login` (local/dev) et `POST /auth/uca/callback` (SSO OIDC UCA).
- Le front remplace `localStorage.user` par le jeton Bearer en mémoire (`sessionStorage` en secours).
- `GET /auth/me` pour valider la session au chargement ; `POST /auth/logout` à la déconnexion.
- Conservation des préférences de thème/langue dans le profil serveur (`PUT /me/preferences`).

**Risque** :perte de session sur expiration du jeton → prévoir un rafraîchissement ou une
reconnexion silencieuse (refresh token à planifier, non implémenté à ce stade).

### Lot 3 — Écritures cœur : quêtes, XP, journal (S-1)

- `POST /quests/{id}/enroll`, `POST /quests/{id}/steps/{step}/submit` (idempotent).
- `GET /ledger` pour l'historique personnel ; abandon du tableau `xpLocal` côté front.
- `GET /dashboard` pour l'accueil : progression, quêtes en cours, dernières entrées.

**Migration des données locales** : pour les apprenants ayant déjà de l'XP hors ligne,
un script d'import (à écrire au moment du lot) crée une **écriture de compensation**
source `admin.adjustment` avec `admin_justification` renseignée — jamais de réécriture
d'historique.

**Critère de sortie** : 0 écriture de progression côté client ; le journal serveur fait foi.

### Lot 4 — Boutique, badges, missions, challenges (S-1)

- `GET /rewards`, `POST /rewards/{id}/purchase` ; le solde de germes vient du serveur.
- `GET /badges`, `GET /badges/{code}` (preuve Open Badges non signée : à mentionner dans l'UI).
- `POST /missions/{id}/claim` (une seule revendication) ; `POST /challenges/{id}/join`,
  `POST /challenges/{id}/submissions`.

**Point d'attention** : la boutique débite immédiatement le solde ; l'approbation admin est
ultérieure (`PATCH /orders/{id}/approve`) — l'UI doit montrer les deux états.

### Lot 5 — La Forge, classement, consentements (J-0)

- `GET/POST /forge/*`, validation de solution avec récompense et quotas.
- `GET /leaderboards` : n'afficher le classement que si l'utilisateur a activé le mode compétition.
- `PUT /me/preferences` : champ « mode compétition » explicite, avec texte de consentement.
- `POST /forge/threads/{id}/report` et modération (`/admin/moderation/reports`).

**Point d'attention (données personnelles)** : vérifier que le front n'affiche jamais nom,
e-mail ou matricule d'un autre utilisateur ; audit de ce point avant activation.

### Lot 6 — Administration (J-1)

- `GET /admin/analytics`, gestion des quêtes, des élèves, des baremes XP, des commandes.
- Journal d'audit consultable (`GET /admin/moderation/audit`).

**Point d'attention** : chaque action d'admin doit passer par l'API (jamais d'action directe
en base) pour garantir la traçabilité.

### Lot 7 — Bilan et nettoyage (J-1)

- Bascule du drapeau `VITE_API_MODE=shadow` → `live`.
- Suppression du code front qui calcule l'XP/le niveau ; nettoyage du localStorage.
- Archivage des données locales (export avant purge, conservation 30 jours).
- Recette : parcours complet (inscription → quête → validation → XP → boutique → Forge).

## Repli

- Repli instantané : repasser `VITE_API_MODE=shadow` (le front rebascule sur son cache local)
  sans redéploiement de l'API.
- Repli des données : les écritures serveur sont conservées (append-only) ; une reprise se
  fait par compensations auditées, jamais par réécriture.

## Suivi

| Indicateur | Cible |
|---|---|
| Écart XP local / serveur à la bascule | < 1 % des comptes |
| Taux d'erreur 5xx sur 24 h | < 0,5 % |
| Latence p95 `/dashboard` | < 300 ms |
| Requêtes non idempotentes rejouées | 0 effet double (garanti par la base) |
