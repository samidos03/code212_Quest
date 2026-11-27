# Code212 Directeur · Patch v01

## Changements
- Lien « La Forge · Direction » dans la navigation Directeur.
- Espace `/director/forge` : affichage des discussions, création de sujets via le formulaire existant, raccourci vers la file des signalements et panneau de modération **simulé localement** (avertissement, demande de bannissement, épinglage, verrouillage, masquage, création de section). Les actions simulées n'affectent **pas** la base Laravel ni les droits réels.
- Profil `/director/profile` : nickname, bio, citation, choix parmi les avatars existants, carte d'identité compacte.
- Avatar du Directeur dans la barre supérieure, cliquable.
- Carte : niveau, XP, Gems, messages (valeur locale de démonstration), progression **indicative** et badges de démonstration.

## À réaliser côté backend
- Endpoints RBAC pour modération, sanction et journal d'audit ; catégories dynamiques ; upload d'avatar sécurisé ; vraie progression XP et badges ; synchronisation des préférences et compteurs.
- Ne pas interpréter les actions locales comme des sanctions effectives.

## Installation (depuis la racine du projet)
1. Sauvegarder le projet, ou exécuter les commandes fournies dans le message.
2. `unzip -o ~/Downloads/code212-directeur-patch-v01.zip -d .`
3. `cd apps/web && npm install && npm run build`

## Contrôles
- Archive ZIP validée.
- Compilation TypeScript non vérifiable ici : dépendances npm incomplètes dans l'environnement d'exécution. Vérifier `npm run build` localement avant déploiement.
