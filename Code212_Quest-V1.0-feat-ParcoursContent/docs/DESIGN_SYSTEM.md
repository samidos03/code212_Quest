# Code212 Quest — Design system

Identité visuelle : **EdTech Premium × Gaming × SaaS moderne**.
Charte source : magenta `#c5027f` · cyan `#00dfff` · violet `#6701e6`.

---

## 1. Principes

1. **Le contenu d'abord.** Les effets « gaming » (glow, dégradés, particules) sont réservés aux
   éléments de récompense : niveau, badges,_arène. Le reste reste sobre et lisible.
2. **Deux modes, une identité.** Le clair et le sombre partagent exactement les mêmes tokens
   sémantiques : on change de mode, jamais de marque.
3. **L'espace dicte le mode.** Le pédagogique est clair, le compétitif est sombre. L'utilisateur
   peut forcer un mode, mais le défaut suit l'espace.
4. **Mobile-first réel.** Chaque écran doit rester lisible à 360 px avant de penser au desktop.
5. **Accessibilité par défaut.** Contrastes AA, focus visible, navigation clavier, cibles ≥ 40 px.

---

## 2. Couleurs

### Tokens de base (light)

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `250 30% 98.5%` | Fond de page |
| `--surface` | `0 0% 100%` | Cartes, panneaux |
| `--surface-2` / `--surface-3` | `252 42% 97.5%` / `252 32% 95%` | Surfaces creuses, champs, jauges |
| `--fg` | `258 32% 13%` | Texte principal |
| `--fg-muted` / `--fg-subtle` | `255 12% 44%` / `255 10% 60%` | Texte secondaire / labels |
| `--border` / `--border-strong` | `254 30% 92%` / `254 24% 85%` | Traits |

### Marque

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--primary` (violet) | `268 99% 45%` `#6701e6` | `268 92% 64%` | Actions, progression, Codeur |
| `--accent` (magenta) | `322 98% 39%` `#c5027f` | `326 100% 63%` | Récompenses, Aidant, alertes de gains |
| `--cyan` | `188 100% 53%` `#00dfff` | `189 100% 55%` | Live,_arène, temps réel |
| `--cyan-fg` | `194 100% 30%` | `189 100% 62%` | **Variante text-safe** du cyan |

> Le cyan pur `#00dfff` n'est jamais utilisé comme couleur de texte sur fond clair : il est réservé
> aux aplats, aux traits et aux icônes. Sur fond clair, le texte cyan utilise `--cyan-fg`
> (`#0090b0`, ratio ≥ 4.5:1). C'est une contrainte d'accessibilité, pas une nuance esthétique.

### Sémantique

`--success` `--warning` `--danger`, chacune avec sa variante `-soft` (fond) — utilisés
exclusivement pour l'état, jamais pour la décoration.

### Ce qui est interdit

- Le cyan comme texte sur fond clair.
- Le dégradé de marque sur du texte de plus de 24 px (contraste insuffisant) : réservé aux fonds,
  aux traits et aux titres en `text-gradient`.
- Plus de deux couleurs de marque dans une même carte.

---

## 3. Typographie

| Famille | Rôle | Graisses auto-hébergées |
|---|---|---|
| **Rajdhani** | Titres, chiffres, KPI, boutons, labels en capitales | 500 / 600 / 700 |
| **Inter** | Texte courant, formulaires, tableaux | variable 100–900 |

Polices servies depuis `apps/web/public/fonts/` (woff2 + `fonts.css`) : **aucune dépendance CDN**,
aucun risque de rendu décalé hors ligne.

### Échelle

| Usage | Taille | Police | Interligne |
|---|---|---|---|
| H1 de page | 26 → 30 px | Rajdhani 700 | 1.15 |
| Titre de section | 17 → 19 px | Rajdhani 700 | 1.2 |
| Titre de carte | 16–18 px | Rajdhani 700 | 1.25 |
| Texte courant | 13.5 px | Inter 400 | 1.6 |
| Label / kicker | 9–11 px, `tracking 0.14–0.2em`, capitales | Inter 700 | — |
| KPI | 26–30 px, `tabular-nums` | Rajdhani 700 | 1 |

Le `kicker` (micro-label en capitales) est la signature de l'identité : il précède chaque titre
de section et de carte.

---

## 4. Thèmes

### Stratégie

```ts
resolveRouteTheme(pathname) // '/arena', '/leaderboard' → 'dark', sinon 'light'
const theme = préférence explicite ?? thème de la route
```

- `/arena` et `/leaderboard` forcent le **sombre**.
- Tous les autres espaces (pédagogiques, profil, administration) sont en **clair**.
- Un choix manuel de l'utilisateur est persisté en `localStorage` (`code212.theme`) et prend le pas.
- La bascule manuelle est immédiate et visible dans la topbar (soleil / lune).

### Ce qui change entre les deux modes

| | Clair | Sombre |
|---|---|---|
| Fond | blanc cassé teinté violet | violet très profond `#0b0716` |
| Cartes | blanches, ombre douce diffuse | `#171029`, liseré clair, glow néon |
| Accent cyan | aplats + `--cyan-fg` | cyan pur, lisible |
| Grilles | `art-grid` très discrète | `arena-grid` violette visible |
| Ombres | diffuses, basses | profondes + halo coloré |

Les deux thèmes partagent les mêmes classes : **aucun composant ne doit styliser le thème
manuellement**. Passer `--primary` à `bg-primary/10` suffit.

---

## 5. Composants

Composants escritos dans l'esprit shadcn/ui (Radix + `cva`), dans `apps/web/src/components/ui/`.

| Composant | Variantes | Usage |
|---|---|---|
| `Button` | `primary` `accent` `cyan` `outline` `ghost` `soft` `danger` `dark` · tailles `sm md lg icon icon-sm` | Actions |
| `Card` | — | Panneaux de contenu |
| `Badge` | `default` `primary` `accent` `cyan` `success` `warning` `danger` `outline` | États, tags |
| `Progress` | ton `primary` `accent` `cyan` `success` | Jauges, progression |
| `Tabs` `Dialog` `Sheet` `DropdownMenu` `Select` `Switch` `Tooltip` `Avatar` `Input` `Textarea` `Label` `Separator` `Skeleton` | — | Primitives Radix |

### Règles

- `Button` n'a jamais d'icône seule sans `aria-label`.
- Toute action destructrice (`danger`) demande une confirmation ou affiche un toast explicite.
- Les états vides sontIllustration + message + action secondaire — jamais une page vide.
- Les formulaires valident côté client **et** côté serveur : l'interface anticipe, elle n'est pas la source de vérité.

### Composants métier (`components/shared/`)

| Composant | Rôle |
|---|---|
| `PageHeader` | kicker + titre + description + actions — en-tête standard de page |
| `SectionHeading` | titre de section + action à droite |
| `StatCard` | KPI unifié (icône, valeur, note) |
| `LevelRing` | anneau de progression du niveau (SVG, dégradé de marque) |
| `QuestCard` / `QuestRow` | carte catalogue et ligne de liste |
| `QuestArt` | visuel dégradé + motif technique des quêtes |

---

## 5 bis. Emblème de direction (Directeur · Super Admin)

Le compte de direction porte un **emblème blason** distinct de tous les profils apprenants :

| Élément | Traitement | Signification |
|---|---|---|
| Couronne dorée, posée sur l'anneau | 3 pointes + gemme cyan | Autorité, direction |
| Laurier doré (12 feuilles effilées par côté) | Or `#e8b84b` | Distinction, appartenance |
| Tuile 212 en dégradé de charte | magenta → violet → cyan | Rattachement à Code212 |
| Monogramme « 212 » | Rajdhani 700, embarqué en base64 | Marque, lisible hors ligne |
| Anneau extérieur | Dégradé de charte, 13 px | Cohérence avec le reste du produit |
| Fond nucleus | Radial `#331863` → `#0a0517` + vignette | Profondeur, rendu « premium » |

- Fichier source : `apps/web/public/avatars/super-admin.svg` (28 Ko, police embarquée).
- Exports PNG : 512 / 256 / 128 / 64 px, fond transparent (signature, e-mail, documents).
- Régénération : `npm run generate:avatar` (script `scripts/generate-avatar-assets.mjs`).
- Utilisation : composant `SuperAdminAvatar` (sidebar, topbar mobile) et `SuperAdminRibbon` (ruban doré).
- L'emblème est identique en thème clair et sombre : c'est un emblème de marque, pas une illustration thémable.

## 6. Motifs graphiques

| Motif | Classe | Usage |
|---|---|---|
| Grille technique | `.art-grid` | fond des visuels de cartes, halos |
| Aurore | `.bg-hero-aurora` | bannière du tableau de bord |
| Grille arène | `.bg-arena-grid` | fond de l'arène et du classement (sombre) |
| Dégradé de marque | `.bg-brand-gradient` | boutons principaux, bandeaux, avatars |
| Texte dégradé | `.text-gradient` | titres de mise en avant (dark : palette éclaircie) |

Les halos (`shadow-glow`, `shadow-glow-accent`, `shadow-glow-cyan`) sont réservés aux éléments
interactifs de premier plan : bouton actif, carte de défi mise en avant.

---

## 7. Responsive

| Palier | Largeur | Adaptation |
|---|---|---|
| Mobile | < 640 px | 1 colonne, barre d'onglets basse (5 entrées), navigation en tiroir, KPI sur 2 colonnes |
| Tablette | 640–1024 px | 2 colonnes, en-têtes de tableau empilés |
| Desktop | ≥ 1024 px | Grilles 12 colonnes, sidebar fixe 268 px, barre d'onglets masquée |

Règles : jamais de largeur fixe en px sur un conteneur de contenu ; les tableaux deviennent des
listes empilées sous 1024 px ; les actions principales restent atteignables au pouce.

---

## 8. Accessibilité

- Contraste AA minimum (4.5:1 texte, 3:1 composants et icônes porteuses d'information).
- Focus visible : `outline: 2px solid hsl(var(--ring))` + offset 2 px, jamais supprimé.
- Icônes porteuses de sens accompagnées d'un `aria-label` ou d'un texte adjacent.
- Navigation clavier complète sur les menus, dialogues et tiroirs (Radix).
- Les animations `framer-motion` respectent `prefers-reduced-motion` (à câbler via
  `MotionConfig reducedMotion="user"`).
- Les données chiffrées utilisent `tabular-nums` pour éviter le saut de layout.

---

## 9. Ce qu'il reste à faire

- [ ] Câbler `MotionConfig reducedMotion="user"` au niveau de l'application.
- [ ] Version arabe + RTL (le sens de lecture du dashboard est déjà horizontal, la grille s'inversera via `dir`).
- [ ] Audit WCAG 2.2 AA complet sur la version branchée API.
- [ ] Bibliothèque d'icônes métier (remplacer les glyphes Unicode `✦ ◈ ⌘` par des icônes Lucide dédiées).
