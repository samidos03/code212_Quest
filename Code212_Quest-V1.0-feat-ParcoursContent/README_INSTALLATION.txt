PATCH CIBLE : uniquement les 2 fichiers fournis par l'utilisateur.
IMPORTANT : Sauvegarde obligatoire AVANT application. Ne jamais installer ce ZIP sans sauvegarde.

Depuis le dossier racine du projet :

BACKUP="$HOME/Desktop/Forge_AVANT_V11_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
cp apps/web/src/pages/student/forge-thread-page.tsx "$BACKUP/"
cp apps/web/src/components/forge/forge-author-card.tsx "$BACKUP/"
echo "SAUVEGARDE : $BACKUP"

Puis : unzip -o "$HOME/Downloads/code212-forge-v11-patch.zip" -d .

Pour restaurer :
cp "$BACKUP/forge-thread-page.tsx" apps/web/src/pages/student/
cp "$BACKUP/forge-author-card.tsx" apps/web/src/components/forge/

Ce patch ne modifie pas forge-page.tsx (page d'accueil), non fourni dans cette demande.
Les fonctionnalités nécessitant de nouvelles API Laravel (non-lus, abonnements, mentions validées,
notifications, temps réel) ne sont pas simulées comme étant opérationnelles.
