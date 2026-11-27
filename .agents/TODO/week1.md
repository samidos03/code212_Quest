# Semaine 1 — Socle fiable et espace apprenant testable

## Objectif de la semaine

Livrer une première tranche verticale vérifiable en mode API réel : parcours consultable, étape de quête soumise dans l'ordre, puis approuvée ou renvoyée avec commentaire par un formateur. La Forge doit utiliser l'API réelle pour ses échanges et son circuit de modération. Cette semaine débloque la suite de la préparation V1 ; elle ne constitue pas, à elle seule, une autorisation de mise en production.

> **État au 27 novembre 2026 :** le build frontend et les tests backend ciblés du parcours passent. Le parcours Full-Stack et ses cours sont présents dans le seeder Laravel, mais la base locale ne contient encore aucun parcours et le mode mock n'expose pas encore tout le même contenu. Ne pas considérer le parcours réel de bout en bout comme validé avant les tâches restantes des jours 2 et 3.

**Légende :** `[x]` réalisé et vérifié au niveau indiqué ; `[ ]` reste à faire ou nécessite une vérification d'intégration.

## Priorités et tâches

### Jour 1 — Débloquer le développement

- [x] **API :** corriger les deux erreurs de syntaxe PHP relevées dans le rapport et exécuter les tests disponibles. **Résultat connu :** les tests ciblés du parcours passent ; la suite backend complète conserve 6 échecs (AdminAuditTest, LevelProgressionTest et RoleAuthorizationTest), à diagnostiquer avant clôture.
- [x] **Web :** corriger les imports TypeScript bloquants et vérifier `npm run build`.

### Décision fonctionnelle — Parcours en modules

- [x] Le seeder Laravel définit un parcours Full-Stack ordonné en trois modules : HTML/CSS, JavaScript, puis PHP/Laravel.
- [x] Les modules du seeder contiennent des chapitres courts avec points clés, exemples originaux et QCM.
- [x] Les chapitres et QCM sont facultatifs : des tests prouvent que les QCM non passés ou échoués ne bloquent pas les quêtes finales.
- [ ] Le seeder définit actuellement un QCM par chapitre ; définir un petit pool de questions et vérifier la sélection aléatoire. Le backend mélange les questions/options présentes, mais cela ne crée pas encore de variété quand un chapitre n'a qu'une question.
- [x] La quête finale est la condition de validation du module ; le module suivant reste bloqué jusqu'à l'approbation du formateur. Couverture par tests backend ciblés.
- [x] Le schéma existant a été étendu par migrations pour les chapitres et leur contenu ; la migration locale est appliquée.
- [ ] Vérifier le parcours complet en mode API réel après exécution des seeders : la base locale est actuellement vide (0 parcours, 0 leçon, 0 QCM).
- [ ] Aligner les fixtures mock sur le seeder Laravel : elles ne présentent actuellement que deux modules et le détail mock ne couvre que le Module 1.
- [ ] Compléter ou confirmer la couverture pédagogique prévue (SQL et intégration frontend/backend ne sont pas encore explicitement représentés dans les chapitres seedés).
- [ ] Plus tard : concevoir un workflow de création/génération des parcours, modules et quêtes.
- [ ] Mesurer la maîtrise et la qualité des livrables sans récompenser le temps passé en ligne, les clics ou les soumissions répétitives.

### Jour 2 — Contrats API et contenu des parcours

**Point de passage vers le Jour 3 :** terminer les éléments Jour 2 encore `[ ]` ci-dessous, ou noter explicitement les arbitrages acceptés. En particulier, il manque l'alignement complet du mock et une vérification des données seedées via l'API.

- [ ] **API :** l'implémentation des endpoints parcours, modules, soumissions et réponses `{ data }` existe ; documenter leur contrat complet (payloads, champs, statuts, erreurs 422) et confirmer l'alignement avec le frontend en mode API réel.
- [x] **API :** relier la file `submissions` à la tentative exacte de `quest_submissions` ; migration et tests ciblés couvrent l'association et les nouvelles tentatives.
- [x] **Apprenant :** le seeder versionné définit le parcours débutant Full-Stack. **À vérifier avant clôture :** exécuter les migrations/seeders dans la base de développement et confirmer les données retournées par l'API.
- [ ] **Contenu Full-Stack :** trois modules et six chapitres concis sont définis dans le seeder (HTML/CSS, JavaScript, Laravel/Eloquent/API). Ajouter ou confirmer explicitement SQL et l'intégration frontend/backend, puis aligner le mock.
- [x] **Organisation modulaire :** vérifier si le modèle actuel des parcours/étapes peut grouper ces chapitres en modules avec leçons, exercices et quête finale ; définir et implémenter le plus petit contrat nécessaire, sans ajouter de tables/API si le modèle existant suffit.
- [x] **Contenu des autres voies :** hors périmètre Jour 2 sur consigne utilisateur.

### Jour 3 — Parcours et quête de bout en bout

- [ ] **Web :** une interface de navigation des modules/chapitres et de leurs états existe. Vérifier le parcours complet ; corriger les écarts entre mock et API, notamment l'absence des trois modules dans le mock.
- [x] **Quêtes :** les seeders définissent les quêtes finales Full-Stack avec livrables et critères ; les tests ciblés valident l'attente, l'approbation et le verrouillage du module suivant.
- [x] **API :** le service vérifie l'accès, crée les soumissions en attente et ne termine le module qu'après approbation ; le test ciblé couvre la progression sans cours ni QCM.
- [ ] **Formateur :** afficher la file des soumissions en attente et permettre approuver ou renvoyer avec un commentaire ; refléter l'état et le feedback côté apprenant.
- [ ] **Validation fonctionnelle bloquante avant de considérer Jour 3 terminé :** exécuter migrations et seeders, passer `VITE_USE_MOCK=false`, puis vérifier avec un apprenant et un formateur le parcours complet : inscription, cours facultatif, soumission, attente, renvoi, nouvelle tentative, approbation, récompenses et déblocage. La base locale est actuellement vide ; ce scénario réel n'a pas encore été exécuté.

### Jour 4 — La Forge réelle, sans confondre entraide et validation pédagogique

- [ ] **Web :** vérifier le cycle fil → réponse → proposition de solution, avec états, erreurs et confirmations issus de l'API plutôt que de `localStorage` ou de toasts simulés.
- [ ] **API :** confirmer les permissions, validations, limites de soumission et journalisation ; corriger les routes ou payloads manquants indispensables au scénario retenu.
- [ ] **Ensemble :** rendre les consignes de contribution claires (contexte, code/extrait, résultat attendu, étapes déjà essayées) et permettre de signaler un contenu.
- [ ] **La Forge :** reporter le vote tant que le seuil de niveau (3 ou 4 dans le rapport) n'est pas tranché ; masquer l'action plutôt que laisser un 501. Les quêtes nécessitent une validation formateur ; les réponses ordinaires de la Forge restent communautaires.

### Jour 5 — Stabilisation et démonstration

- [ ] **API :** exécuter migrations/seeders et tests backend sur PostgreSQL ; ajouter des tests ciblés pour l'ordre des étapes, les permissions et l'approbation/idempotence XP. Les migrations locales sont appliquées et les tests ciblés passent, mais la base applicative est vide ; la suite complète a encore 6 échecs à diagnostiquer.
- [ ] **Web :** le build frontend passe ; exécuter les scénarios UI réels sur API seedée et vérifier les états chargement, vide, erreur et soumission en attente.
- [ ] **Intégration :** faire la revue des PR, vérifier CI/contrats API et démontrer le parcours apprenant → formateur → résultat.
- [ ] **Ensemble :** ouvrir une issue distincte pour tout bloqueur restant ; ne pas masquer une fonctionnalité mock ou une dépendance non résolue comme « terminée ».

## Répartition et règles GitHub

- **Périmètre API :** backend Laravel, contrats API, migrations et tests associés.
- **Périmètre Web :** frontend apprenant/formateur et contenu de test.
- **Revue :** chaque PR est relue par un autre contributeur ; aucune PR n'est auto-approuvée.
- `main` représente la production ; `develop` est l'intégration de la prochaine version.
- Créer une branche temporaire `feat/` par fonctionnalité depuis `develop`, puis ouvrir une PR vers `develop`. Un autre contributeur relit ; fusionner avec un merge commit après CI verte, puis supprimer la branche.
- Pas de push direct sur `develop` ; chaque nouvelle branche part de la dernière version de `develop`.
- Quand `develop` est testée, faire relire la PR de release vers `main`. Aucun travail ne dépend d'une intervention du superviseur.

## Définition de terminé — Semaine 1

- [ ] Build frontend et suite backend passent dans CI, avec PostgreSQL pour les tests concernés.
- [ ] Le parcours Full-Stack de démonstration présente au moins un module avec cours progressif, exercices, quête finale et critères vérifiables.
- [ ] Le module suivant reste verrouillé jusqu'à l'approbation de la quête finale par le formateur ; l'apprenant voit l'état et le feedback.
- [ ] Le formateur peut approuver ou renvoyer un livrable ; l'apprenant voit l'état et le commentaire.
- [ ] Le scénario retenu de La Forge fonctionne en mode API réel, avec autorisations et modération explicites.
- [ ] Les critères ci-dessus sont démontrés en `VITE_USE_MOCK=false` et les limites restantes sont suivies dans des issues.

## Hors périmètre de cette semaine

SSO UCA réel, Libki, signature cryptographique de certificats, refonte complète de tous les espaces et déploiement public. Ces sujets dépendent d'arbitrages ou d'infrastructures et ne doivent pas retarder la tranche verticale.
