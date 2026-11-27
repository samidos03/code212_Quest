# Patch carte V09 pour La Forge React

Cible : projet React/Vite `code212-quest 13 minmax`, après installation du patch Forge V03.

Ce patch remplace uniquement `apps/web/src/components/forge/forge-author-card.tsx` et ajoute les 19 illustrations de badges de `Code212_Quest_V09_Badges_Profil(1).zip` dans `apps/web/public/v09-badges/`.

Les cartes sont déjà utilisées par la page `forge-thread-page.tsx` du patch V03, pour le sujet et les réponses. Aucune donnée fictive n'est injectée. L'insigne Directeur suppose que le patch Directeur V02 est installé.

Installation depuis la racine :

```sh
cp apps/web/src/components/forge/forge-author-card.tsx ~/Desktop/forge-author-card-avant-clonage.tsx
unzip -o ~/Downloads/code212-forge-carte-v09-react-patch.zip -d .
cd apps/web && npm run build
```

Le statut `signale` doit être filtré côté API pour ne pas exposer des signalements confidentiels aux membres ordinaires.
