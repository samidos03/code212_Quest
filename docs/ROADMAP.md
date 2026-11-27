# Code212 Quest — Feuille de route

 consolidation des deux prototypes fournis : **prototype HTML/JS (V0.5)** et **starter React/Vite (MVP)**.

## 1. Ce qui est livré dans cette version (v0.6)

### Frontend — React 18 · TypeScript · Vite · Tailwind · shadcn/ui

| Espace | Écrans | Statut |
|---|---|---|
| Tableau de bord | Hero, 4 KPI, progression de niveau, activité hebdo, quêtes en cours, missions, badges, top, voies | ✅ |
| Quêtes | Catalogue filtrable (voie / difficulté / recherche), 12 quêtes, fiche détaillée avec 4 étapes, dépôt de livrable | ✅ |
| Parcours | 5 parcours avec progression et compétences | ✅ |
| Missions | Hebdomadaires et mensuelles, réclamation unique | ✅ |
| Badges & voies | 30 badges filtrables, 4 voies × 5 rangs, 10 niveaux globaux | ✅ |
| La Forge | 5 rubriques, discussions, réponses, solution acceptée, like, signalement, publication | ✅ |
| Boutique | 8 récompenses, solde de germes, achat avec confirmation | ✅ |
| Certifications | 4 attestations, critères, compétences, statut | ✅ |
| Profil | Identité, préférences, consentement, journal XP, voies | ✅ |
| Arène (sombre) | 8 défis, défi live avec compte à rebours, filtres, inscription | ✅ |
| Classement (sombre) | Podium, 4 périodes, tendances, ligne « Vous » | ✅ |
| Administration | Pilotage, analytics, 12 quêtes, validation, commandes, règles XP, modération, annuaire | ✅ |

### Transverse

- Design system complet (tokens clair/sombre, 16 primitives shadcn/ui, typographie auto-hébergée).
- Thème contextuel : clair pour le pédagogique, sombre pour le compétitif, bascule manuelle persistée.
- Responsive validé à 390 px et 1440 px, barre d'onglets mobile, navigation en tiroir.
- Adaptateur de démonstration qui applique **les mêmes invariants que le backend**.
- TypeScript strict, build de production découpé en chunks.

### Backend — squelette Laravel complet

- 219 fichiers PHP : 60 routes, 34 modèles, 35 migrations PostgreSQL, 13 services, 6 policies,
  22 ressources, 19 FormRequests, 12 seeders, 8 tests d'invariant.
- `xp_ledger` et `germes_ledger` append-only **au niveau PostgreSQL** (triggers).
- Contrat API documenté et plan de migration.

## 2. Ce qui n'est pas livré (et pourquoi)

| Sujet | Statut | Raison |
|---|---|---|
| Badges Open Badges 3.0 signés | Attestation **non signée** | Exige une infrastructure d'émetteur (VC-JWT, DID, gouvernance des clés) et une décision institutionnelle |
| Authentification UCA | Callback OIDC câblé, non branché | Issuer, client et scopes à obtenir de l'université |
| Présence Libki | Table + contrôleur câblés, aucun flux réel | Disponibilité et quotas des API Libki à confirmer |
| Moteur d'attribution automatique des rôles | Non implémenté | Doit suivre une procédure de validation Centre (candidature → validation) |
| Analyse par cohorte réelle | Vue agrégée en démo | Brancher sur les tables de fait une fois le ledger en production |
| Export PDF des certifications | Bouton en état informatif | Service de certification à construire |
| Tests E2E navigateur | Non écrit | À écrire après branchement API (Playwright est déjà disponible dans l'environnement) |
| Version arabe / RTL | Non écrit | Le design system est horizontal ; l'inversion via `dir` reste à faire |

## 3. Séquencement proposé (10 semaines)

### Phase 1 — Socle réel (S1–S2)
1. `composer install`, `php artisan migrate --seed`, `php artisan test` sur PostgreSQL.
2. Branchement de l'API Laravel sur le frontend (`VITE_USE_MOCK=false`).
3. Authentification OIDC UCA : inscription, connexion, résolution des rôles.
4. Tests E2E des parcours critiques (connexion → quête → validation → gain).

### Phase 2 — Pédagogie opérationnelle (S3–S5)
5. CRUD complet des quêtes côté admin (étapes, critères, barèmes, publication).
6. Circuit de validation : dépôt → file → décision → gain idempotent → notification.
7. Règles XP versionnées et simulateur de barème branché sur le ledger réel.
8. Journal d'audit consultable et exportable.

### Phase 3 — Communauté & compétition (S6–S7)
9. La Forge branchée : catégories, modération par rubrique, quotas, signalements.
10. Arène branchée : inscriptions, scores, dep remis (source de vérité serveur).
11. Classement : consentement effectif, pseudonymisation, retrait du classement.

### Phase 4 — Identité & crédibilité (S8–S9)
12. Gouvernance de l'émetteur Open Badges : identité DID, clés, signature, révocation.
13. Portefeuille de compétences : attestation signée + vérification publique.
14. Journal de bord apprenant et export du relevé de compétences.

### Phase 5 — Industrialisation (S10)
15. CI/CD, tests de charge sur le ledger, supervision, alerting.
16. Documentation d'exploitation, runbooks, astreinte.

## 4. Risques à surveiller

| Risque | Impact | Parade |
|---|---|---|
| Rétrogradation après dépense de germes | Perte de progression perçue | XP permanent protégé, solde dépensable séparé ; toute rétrogradation doit être décidée explicitement |
| Course entre validations concurrentes | Double gain ou gain perdu | Contrainte unique en base + transaction + verrou de ligne |
| Inflation des gains via les quotas | Dérive de l'économie | Plafonds journaliers par règle, quotas de la Forge, audit des volumes |
| Classement perçu comme discriminatoire | Perte de confiance | Consentement explicite, pseudonymisation, retrait possible, agrégation par cohorte |
| Usage discriminatoire des sanctions | Préjudice aux étudiants | Aucune sanction automatique ; validation Centre, information, recours |
| Attestations non signées prises pour des certifications | Risque réputationnel | Mention explicite « non signée » dans l'interface et les exports |
| Dépendance à Libki / API UCA | Blocage du volet présence | Fonctionnement dégradé sans présence ; contrat documenté |

## 5. Idées d'extension (non engagées)

- **Duels en direct** avec arbitrage et chat d'arène.
- **Saison de compétition** avec paliers, Ligues et récompenses de fin de saison.
- **Portfolio de compétences** exportable en CV (PDF/JSON) à partir des preuves validées.
- **Recommandation de quêtes** par renforcement de compétences, avec validation humaine.
- **Mode « passif-competitif »** : follower sans figurer au classement.
- **Badges de constellation** : illustration dynamique générée à partir des badges obtenus.
- **LTI 1.3** pour diffuser les quêtes dans le LMS institutionnel.
