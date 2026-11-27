## Description
<!-- Quel problème cette PR résout-elle ? Résumer le changement et son impact utilisateur. -->

## Issue et destination
- Issue : Closes #
- Branche cible : `develop` (ou `main` uniquement pour une PR de release/correctif approuvé)

## Périmètre
- [ ] Frontend (`apps/web`) — espace :
- [ ] API (`apps/api`)
- [ ] Base de données / migrations / seeders
- [ ] CI, configuration ou documentation

## Critères d'acceptation
- [ ] 
- [ ] 

## Validation et preuves
- [ ] Build frontend : commande/résultat
- [ ] Tests backend : commande/résultat
- [ ] Vérifié en mode connecté (`VITE_USE_MOCK=false`) si le flux touche l'API
- [ ] Test de migration/seeders et PostgreSQL si la base est concernée
- [ ] États erreur, chargement, vide et permissions vérifiés si concernés
- [ ] Capture d'écran / vidéo pour un changement visuel :

## Contrats, sécurité et déploiement
- [ ] Contrat requête/réponse et erreurs API mis à jour si nécessaire
- [ ] Pas de secrets, `.env` réel, jetons ou données personnelles dans le diff/logs
- [ ] Migration forward-only ; aucune migration déjà fusionnée n'a été modifiée
- Notes de déploiement, configuration ou rollback :

## Revue
- [ ] PR limitée à une issue et suffisamment petite pour être revue
- [ ] Une approbation et CI verte avant fusion
- [ ] Superviseur requis pour DB, auth/RBAC, XP/économie ou P0
