# Code212 Quest

Plateforme de gamification pédagogique du **Centre CODE212 — Université Cadi Ayyad, Marrakech**.

Ce dépôt est le produit consolidé des deux prototypes fournis (prototype HTML/JS « V0.5 » et starter
React/Vite « MVP ») : une base unique, typée, responsive, avec un thème clair pour les espaces
pédagogiques et un thème sombre pour les espaces compétitifs.

```
code212-quest/
├── apps/
│   ├── web/        React 18 · TypeScript · Vite · Tailwind · shadcn/ui · Framer Motion · Recharts
│   └── api/        Laravel 11/12 · PostgreSQL · Redis · Sanctum/OIDC   (squelette complet)
└── docs/           Design system, architecture, roadmap, décisions
```

---

## Démarrage immédiat (frontend, sans backend)

```bash
cd apps/web
npm install
cp .env.example .env.local     # VITE_USE_MOCK=true par défaut
npm run dev
```

Ouvrez **http://localhost:5173**. L'application fonctionne intégralement sur un jeu de données
de démonstration servi par un adaptateur local : chaque écran, chaque état d'interface et chaque
invariant métier sont déjà câblés.

**Basculer sur l'API Laravel** : renseignez `VITE_USE_MOCK=false` et `VITE_API_BASE_URL=https://api.uca.ma/api/v1`.
Aucun composant n'a besoin d'être modifié — voir `apps/web/src/services/api.ts`.

## Backend Laravel

```bash
cd apps/api
composer install
cp .env.example .env            #.configure PostgreSQL, Redis, OIDC UCA
php artisan migrate --seed
php artisan test
```

> Le code PHP n'a pas pu être exécuté dans l'environnement de conception (PHP/Composer absents).
> Une passe `composer install && php artisan migrate --seed && php artisan test` est indispensable
> avant toute mise en service. Détails : [`apps/api/README.md`](apps/api/README.md).

---

## Ce que la plateforme couvre

| Espace | Écrans | Rôle |
|---|---|---|
| **Pédagogique** (thème clair) | Tableau de bord, 12 quêtes + fiche détaillée, 5 parcours, missions, 30 badges, 4 voies & rangs, 10 niveaux, La Forge (forum), boutique, certifications, profil | Apprenant |
| **Compétitif** (thème sombre) | Arène (8 défis live), classement (4 périodes, podium) | Apprenant |
| **Administration** (thème clair) | Pilotage, analytics, 12 quêtes gérables, validation des livrables, commandes boutique, règles XP versionnées, file de modération, annuaire étudiants | Formateur / modérateur / admin |

### Identité visuelle

- **Charte Code212** : magenta `#c5027f`, cyan `#00dfff`, violet `#6701e6`.
- **Typographie** : Rajdhani (titres, chiffres, « gaming ») + Inter (texte courant) — auto-hébergées, sans dépendance CDN.
- **Thème clair par défaut** pour le pédagogique, **sombre** pour l'arène et le classement, avec bascule manuelle persistée et suivi automatique de l'espace.
- Mobile-first : barre d'onglets basse sur mobile, navigation latérale en tiroir, grilles fluides.

---

## Invariants métier (garantis côté serveur)

1. **Ledger XP append-only** — `xp_ledger` avec contrainte unique `(user_id, source_event, reference_id)` ;
   jamais d'`UPDATE`/`DELETE` (déclencheur PostgreSQL bloquant), corrections par écriture compensatoire.
2. **Idempotence** — une quête, une étape ou une solution ne peut créditer qu'une seule fois.
3. **Achat atomique** — verrou de ligne sur le stock et le solde, transaction SQL, solde non négatif.
4. **Quotas de la Forge** — 5 réponses rémunérées/jour, 2 par demandeur et par semaine, auto-validation interdite.
5. **Consentement** — un classement n'expose jamais un participant n'ayant pas accepté la compétition.
6. **Audit** — chaque décision d'administration est journalisée avec auteur, cible et justification.
7. **Aucune sanction automatique** — les malus (inactivité, échec, profil incomplet) restent désactivés par défaut.

---

## Documentation

| Document | Contenu |
|---|---|
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens, thèmes, typographie, composants, règles d'usage |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Monorepo, flux de données, sécurité, modèle de rôles |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Ce qui est livré, ce qui reste à faire, séquencement |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Arbitrages produit et techniques, points à valider avec le Centre |
| [`apps/api/docs/API_CONTRACT.md`](apps/api/docs/API_CONTRACT.md) | Contrat API complet (60 routes) |
| [`apps/api/docs/MIGRATION_PLAN.md`](apps/api/docs/MIGRATION_PLAN.md) | Plan de bascule localStorage → API |

---

## Point de vigilance institutionnel

Les badges et certifications sont **des attestations non signées** : la conformité Open Badges 3.0
(signature VC-JWT, DID émetteur, preuves, révocation) exige une infrastructure dédiée et une
gouvernance de l'émetteur qui n'existe pas encore. Les intégrations **API UCA (OIDC)** et **Libki**
(présence) sont câblées côté API mais inactives : leur disponibilité et leurs quotas restent à
confirmer avec l'université.
