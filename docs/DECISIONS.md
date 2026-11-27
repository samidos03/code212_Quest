# Code212 Quest — Décisions et arbitrages

Ce document liste les choix structurants, leur justification, et ceux qui **doivent être validés avec
le Centre CODE212** avant la mise en production.

---

## 1. Thème clair par défaut, sombre pour les compétitions

**Décision.** Le thème suit l'espace : clair pour le pédagogique (tableau de bord, quêtes, parcours,
missions, badges, La Forge, boutique, certifications, profil, administration), sombre pour l'arène et
le classement.

**Justification.** Le sombre n'est pas « plus moderne » : il est **fonctionnel**. Il signale un changement
de régime — on passe de « apprendre » à « concourir ». Le mode sombre des surfaces denses (tableaux
de scores, compte à rebours, notifications live) réduit la fatigue visuelle et met en valeur les
signaux néon (cyan) et l'état « live ».

**Conséquence.** Aucun composant ne stylise le thème manuellement : les tokens basculement. Un choix
manuel de l'utilisateur est persisté et prévaut sur la règle de route.

**À valider.** Le Centre peut vouloir l'inverse (sombre par défaut) — le changement se fait en une
ligne dans `lib/theme.tsx`.

---

## 2. Deux monnaie : XP permanent + germes dépensables

**Décision.** L'XP est **permanent** et détermine les niveaux ; les **germes** se dépensent à la
boutique. Les deux sont écrits dans des journaux append-only distincts.

**Justification.** La version V0.4 du prototype avait une économie unique en germes, ce qui
mélangeait progression et consommation : dépenser pour un avatar faisait perdre du niveau. Séparer
les deux supprime ce conflit et rend la boutique sans risque.

**À valider.** Toute rétrogradation après achat doit être décidée explicitement et testée. Notre
recommandation : **aucune rétrogradation** — l'XP acquis ne se perd jamais.

---

## 3. Ledger append-only, gains idempotents

**Décision.** Tout gain est une écriture dans `xp_ledger`, avec contrainte unique
`(user_id, source_event, reference_id)`. Aucune modification ni suppression possible — un trigger
PostgreSQL bloque `UPDATE`, `DELETE` et `TRUNCATE`.

**Justification.** C'est le seul moyen de garantir qu'un double-clic, un rejeu de webhook ou deux
validateurs simultanés ne crédient pas deux fois. La contrainte est en base, pas en code : elle
résiste aux requêtes parallèles que le code ne peut pas voir.

**Conséquence.** Une correction de barème ne réécrit pas l'historique : elle passe par une écriture
compensatoire, avec justification. Le barème appliqué est conservé avec sa version.

---

## 4. Barèmes plafonnés et versionnés

**Décision.** 10 règles XP, chacune avec une valeur, un plafond journalier, une version et un
activateur. Une règle désactivée ne crédite rien.

**Justification.** Sans plafond, une boucle (ou un abus de la Forge) peut vider l'économie en
une journée. La version permet de changer un barème sans invalider les gains passés.

**À valider.** Les valeurs et plafonds proposés (+1 500 XP/jour max) sont des hypothèses de
conception : ils doivent être calibrés sur une semaine d'usage réel.

---

## 5. Aucune sanction automatique

**Décision.** Les malus pour inactivité, échec, profil incomplet ou absence de badge restent
**désactivés par défaut**. Une règle de pénalité existe dans le catalogue mais n'est pas activée.

**Justification.** Sanctionner automatiquement des étudiants qui échouent ou s'absentent risque de
renforcer les inégalités au lieu de les réduire. Ces règles exigent une validation institutionnelle,
une information préalable et une procédure de recours.

---

## 6. Le classement est opt-in

**Décision.** Un apprenant n'apparaît dans aucun classement tant qu'il n'a pas accepté la
compétition. Son score reste compté ; seul son identité est masquée. Le retrait est possible à tout
moment depuis le profil.

**Justification.** La note de conception V0.5 mentionne un « mode sans compétition » ; nous en avons
fait un consentement explicite, appliqué côté serveur. Un classement involontaire est une mise en
conditionnement, pas une fonctionnalité.

---

## 7. La Forge : la qualité prime sur le volume

**Décision.** 40 XP pour une réponse, 120 XP si elle est acceptée comme solution. Quotas : 5 réponses
rémunérées par jour, 2 par demandeur et par semaine. L'auto-validation est interdite.

**Justification.** Récompenser le volume de messages dégrade la qualité et ouvre la collusion. Le
système des quotas et de diversité reprend les règles de la note de conception.

**À valider.** Le seuil de 2 solutions par semaine est à ajuster selon le nombre d'apprenants.

---

## 8. Quatre voies, cinq rangs, dix niveaux

**Décision.** Voies : Codeur (technique), Aidant (communauté), Bâtisseur (projets), Explorateur
(ouverture). Cinq rangs par voie, seuils 0 / 100 / 400 / 1 000 / 2 000. Dix niveaux globaux, seuils
0 → 8 000 XP.

**Justification.** Les voies permettent à un profil « community manager » comme à un profil
« architecture » de progresser sans se comparer à un même ranking. Les niveaux globaux donnent un
langage commun à toute la promotion.

**À valider.** La voie dominante est calculée sur 30 jours glissants — à confirmer avec le Centre, de
même que les seuils de rang, qui dépendront des premiers usages réels.

---

## 9. Certification = attestations non signées en v0.6

**Décision.** Les certifications sont exposées comme des attestations internes, avec un identifiant
et des critères, **sans signature cryptographique**. L'interface le dit explicitement.

**Justification.** Open Badges 3.0 exige une identité d'émetteur, une DID, une gestion des clés, des
preuves et une politique de révocation. Présenter des attestations non signées comme des
certifications reconnues serait un risque réputationnel pour l'université. Nous préférons assumer la
limite dans le produit plutôt que la masquer.

---

## 10. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Frontend | React + TypeScript + Vite | Typage strict sur un domaine métier riche ; build rapide |
| Styles | Tailwind CSS | Tokens de thème centralisés, cohérence à l'échelle |
| UI | shadcn/ui (Radix) | Composants accessibles, code dans le dépôt (pas de dépendance binaire) |
| Animations | Framer Motion | Transitions de qualité, `reducedMotion="user"` respecté |
| Graphiques | Recharts | Adapté aux séries simples, bundle maîtrisé |
| Icônes | Lucide | Cohérence, tree-shaking |
| Données | TanStack Query | Cache, invalidation, états loading/error/empty |
| Backend | Laravel API | Écosystème institutionnel, policies, jobs, queue — cohérent avec un hébergement mutualisé |
| Base | PostgreSQL | Contraintes uniques, jsonb, triggers, index partiels |
| Cache/queue | Redis | Rate limiting, files asynchrones, sessions |

**Écart assumé** : shadcn/ui est écrit à la main dans `components/ui/` plutôt que cloné depuis le CLI,
pour contrôler le design system (tokens Code212, thèmes) et éviter une dépendance au registre.

---

## 11. Monolithe applicatif plutôt que microservices

**Décision.** Un monorepo `apps/web` + `apps/api`, un seul déploiement API, un seul PostgreSQL.

**Justification.** L'échelle visée (quelques milliers d'étudiants) ne le justifie pas. Un monolithe
modulaire avec 13 services métier offre la même séparation conceptuelle, sans la complexité
opérationnelle, les transactions distribuées et les observabilités croisées.

**Seul le moteur de ledger a vocation à être extrait** si le volume devient un problème — c'est le
seul composant à charge transactionnelle élevée.

---

## 12. Points restant à trancher par le Centre

1. **Monnaie unique ou XP + germes** — recommandation : XP + germes (cf. §2).
2. **Seuils des niveaux et des rangs** — calibration sur données réelles.
3. **Plafonds journaliers XP** — valeur proposée : 1 500 XP/jour.
4. **Droit de vote dans La Forge** — le niveau 4 est proposé, mais le rôle « Résident Actif » niveau 3
   prévoit déjà le vote. **Une seule règle doit être retenue.**
5. **Identité de l'émetteur Open Badges** et politique de révocation.
6. **Identité des modérateurs** et durées de bannissement.
7. **Critères d'éligibilité** à un classement ou à une certification (niveau minimum ? validation
   Centre ?).
8. **Usage des données de présence** (Libki) : finalité, base légale, conservation.
