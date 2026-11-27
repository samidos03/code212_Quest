/**
 * Code212 Quest — jeu de données de démonstration.
 *
 * Ces données alimentent le mode « démo » de l'API (VITE_USE_MOCK=true).
 * Elles respectent la forme des payloads exposés par Laravel dans `/api/v1`
 * afin que le basculement vers le backend réel n'implique aucun changement
 * de composants.
 */
import type {
  AdminOverview,
  Badge,
  Certification,
  Challenge,
  ForgeCategory,
  ForgeSolution,
  ForgeThread,
  LeaderboardEntry,
  LearningPath,
  LevelConfig,
  Mission,
  Quest,
  Reward,
  RewardOrder,
  Submission,
  Track,
  TrackCode,
  XpRule,
} from '@/types'
import { FULLSTACK_PATH_ID, fullStackModules } from './fullstack-fixture'

const now = Date.now()
const iso = (daysAgo: number, hour = 10) => {
  const d = new Date(now - daysAgo * 86400000)
  d.setHours(hour, (daysAgo * 7) % 60, 0, 0)
  return d.toISOString()
}

/* ------------------------------------------------------------------ niveaux */

export const levels: LevelConfig[] = [
  { level: 1, title: 'Nouveau venus', xpThreshold: 0, requirements: ['Créer son profil'], benefits: ['Accès aux quêtes d’introduction'] },
  { level: 2, title: 'Explorateur', xpThreshold: 250, requirements: ['Compléter 1 quête'], benefits: ['Voie Codeur débloquée'] },
  { level: 3, title: 'Apprenti', xpThreshold: 600, requirements: ['Compléter 3 quêtes', '1 badge obtenu'], benefits: ['La Forge — poster une question'] },
  { level: 4, title: 'Praticien', xpThreshold: 1100, requirements: ['5 quêtes', '2 badges'], benefits: ['Créer une quête (candidature)'] },
  { level: 5, title: 'Confirmé', xpThreshold: 1800, requirements: ['10 quêtes', 'série de 3 jours'], benefits: ['Voie Aidant débloquée'] },
  { level: 6, title: 'Avancé', xpThreshold: 2700, requirements: ['15 quêtes', '1 parcours validé'], benefits: ['Certifications Open Badges'] },
  { level: 7, title: 'Expert', xpThreshold: 3600, requirements: ['25 quêtes', '3 parcours'], benefits: ['Voie Bâtisseur débloquée'] },
  { level: 8, title: 'Architecte', xpThreshold: 4500, requirements: ['35 quêtes', '5 badges', 'niveau 6 validé'], benefits: ['Accès aux défis inter-universités'] },
  { level: 9, title: 'Maître', xpThreshold: 5800, requirements: ['45 quêtes', 'voie dominante identifiée'], benefits: ['Voie Explorateur débloquée'] },
  { level: 10, title: 'Légende Code212', xpThreshold: 8000, requirements: ['60 quêtes', '10 badges', 'validation Centre'], benefits: ['Statut de mentor, badge sigmatique'] },
]

/* -------------------------------------------------------------------- voies */

const rankNames: Record<TrackCode, string[]> = {
  codeur: ['Novice', 'Apprenti', 'Confirmé', 'Expert', 'Maître'],
  aidant: ['Passerelle', 'Soutien', 'Mentor', 'Pilier', 'Référent'],
  batisseur: ['Éclaireur', 'Bâtisseur', 'Architecte', 'Chef de projet', 'Monument'],
  explorateur: ['Curieux', 'Randonneur', 'Pionnier', 'Ambassadeur', 'Légende'],
}
const rankThresholds = [0, 100, 400, 1000, 2000]

function buildTrack(code: TrackCode, name: string, description: string, icon: string, color: string, points: number, questIds: number[]): Track {
  const ranks = rankNames[code].map((label, i) => ({
    rank: i + 1,
    code: `${code}-r${i + 1}`,
    label,
    threshold: rankThresholds[i],
  }))
  const current = [...ranks].reverse().find((r) => points >= r.threshold) ?? ranks[0]
  const next = ranks.find((r) => r.threshold > points) ?? null
  return { code, name, description, icon, color, points, rank: current, nextRank: next, questIds }
}

export const tracks: Track[] = [
  buildTrack('codeur', 'Codeur', 'Maîtrise technique : algorithmique, frameworks, qualité de code.', '</>', '#6701e6', 1240, [1, 3, 5, 8]),
  buildTrack('aidant', 'Aidant', 'Entraide, mentorat et qualité de la communauté.', '✦', '#c5027f', 860, [2, 6, 9]),
  buildTrack('batisseur', 'Bâtisseur', 'Projets de bout en bout et architecture de solutions.', '◈', '#00b8d4', 610, [4, 7, 11]),
  buildTrack('explorateur', 'Explorateur', 'Veille, nouveaux domaines et ouverture internationale.', '⌘', '#f59e0b', 430, [10, 12]),
]

/* ------------------------------------------------------------------ quêtes */

type StepSeed = [title: string, kind: QuestStepKind, xp: number, minutes: number, description: string]
type QuestStepKind = 'lecture' | 'quiz' | 'code' | 'livrable' | 'live'

const step = (order: number, [title, kind, xp, minutes, description]: StepSeed) => ({
  id: order,
  order,
  title,
  description,
  kind,
  xp,
  durationMinutes: minutes,
  status: 'verrouille' as const,
})

const questSeeds: Array<{
  id: number
  slug: string
  title: string
  subtitle: string
  category: string
  track: TrackCode
  difficulty: Quest['difficulty']
  xpReward: number
  trackPoints: number
  germs: number
  minutes: number
  participants: number
  rate: number
  author: string
  icon: string
  gradient: string
  days: number
  prereq: number[]
  objectives: string[]
  badges: string[]
  steps: StepSeed[]
}> = [
  {
    id: 1, slug: 'ai-prompt-engineering', title: 'AI Prompt Engineering', subtitle: 'Construire des prompts qui tiennent la route',
    category: 'Intelligence artificielle', track: 'codeur', difficulty: 'debutant', xpReward: 450, trackPoints: 120, germs: 30,
    minutes: 45, participants: 128, rate: 68, author: 'Dr. Salma Bennani', icon: '✦', gradient: 'violet', days: 26, prereq: [],
    objectives: ['Maîtriser les 6 blocs d’un prompt efficace', 'Évaluer une réponse de modèle', 'Documenter une stratégie de prompting'],
    badges: ['AI Explorer'],
    steps: [
      ['Comprendre les LLM', 'lecture', 60, 10, 'Panorama des modèles, fenêtres de contexte et limites.'],
      ['Anatomie d’un prompt', 'quiz', 80, 10, 'Rôle, contexte, consignes, exemples, format, itération.'],
      ['Atelier prompt itératif', 'code', 180, 15, 'Construire puis raffiner un prompt de qualification technique.'],
      ['Livrable : bibliothèque de prompts', 'livrable', 130, 10, 'Documenter 5 prompts réutilisables et leur grille d’évaluation.'],
    ],
  },
  {
    id: 2, slug: 'cybersecurity-sprint', title: 'Cybersecurity Sprint', subtitle: 'Penser comme un attaquant, agir comme un gardien',
    category: 'Cybersécurité', track: 'codeur', difficulty: 'intermediaire', xpReward: 700, trackPoints: 180, germs: 45,
    minutes: 80, participants: 86, rate: 54, author: 'Prof. Karim Idrissi', icon: '⌘', gradient: 'cyan', days: 24, prereq: [1],
    objectives: ['Modéliser une surface d’attaque', 'Auditer une configuration', 'Rédiger un rapport exploitable'],
    badges: ['Cyber Guardian'],
    steps: [
      ['Surface d’attaque d’une application web', 'lecture', 100, 15, 'OWASP Top 10 appliqué au contexte étudiant.'],
      ['TP : cartographie d’une API vulnérable', 'code', 240, 30, 'Tester un endpoint avec les outils autorisés du centre.'],
      ['Quiz certification', 'quiz', 120, 15, '10 questions, seuil 8/10 pour valider.'],
      ['Livrable : rapport de remédiation', 'livrable', 240, 20, 'Prioriser 5 vulnérabilités et planifier les correctifs.'],
    ],
  },
  {
    id: 3, slug: 'build-a-rest-api', title: 'Build a REST API', subtitle: 'Du schéma au déploiement',
    category: 'Développement', track: 'codeur', difficulty: 'avance', xpReward: 900, trackPoints: 220, germs: 60,
    minutes: 120, participants: 64, rate: 41, author: 'Mehdi Alaoui', icon: '</>', gradient: 'magenta', days: 21, prereq: [1],
    objectives: ['Modéliser une API REST cohérente', 'Gérer erreurs et versions', 'Documenter et tester'],
    badges: ['API Architect'],
    steps: [
      ['Conception de l’API', 'lecture', 120, 20, 'Ressources, verbes, codes HTTP, versionnement.'],
      ['Implémentation Laravel', 'code', 320, 40, 'Modèles, migrations, contrôleurs, ressources.'],
      ['Authentification & rate limiting', 'code', 220, 30, 'Sanctum, policies, throttling.'],
      ['Tests et documentation', 'livrable', 240, 30, 'Tests Pest, OpenAPI, postman collection.'],
    ],
  },
  {
    id: 4, slug: 'data-detective', title: 'Data Detective', subtitle: 'Faire parler des données propres',
    category: 'Data & Analytics', track: 'batisseur', difficulty: 'intermediaire', xpReward: 600, trackPoints: 160, germs: 40,
    minutes: 60, participants: 94, rate: 61, author: 'Pr. Youssef Belhaj', icon: '◈', gradient: 'orange', days: 19, prereq: [],
    objectives: ['Nettoyer un jeu de données', 'Construire une visualisation honnête', 'Rédiger une recommandation'],
    badges: ['Data Mind'],
    steps: [
      ['Nettoyage de données réelles', 'code', 180, 20, 'Valeurs manquantes, doublons, types incohérents.'],
      ['Analyse exploratoire', 'code', 160, 20, 'Statistiques descriptives et lecture critique.'],
      ['Visualisation & storytelling', 'livrable', 260, 20, 'Un graphique, une histoire, une décision.'],
    ],
  },
  {
    id: 5, slug: 'devops-pipeline', title: 'DevOps Pipeline', subtitle: 'De la branche au déploiement',
    category: 'DevOps', track: 'batisseur', difficulty: 'avance', xpReward: 850, trackPoints: 200, germs: 55,
    minutes: 110, participants: 52, rate: 38, author: 'Nada Cherkaoui', icon: '⚙', gradient: 'cyan', days: 18, prereq: [3],
    objectives: ['Écrire un pipeline CI', 'Conteneuriser une application', 'Automatiser les tests'],
    badges: ['Pipeline Master'],
    steps: [
      ['CI : pipelines de base', 'lecture', 110, 15, 'GitHub Actions, secrets, environments.'],
      ['Docker multi-stage', 'code', 300, 35, 'Image optimisée, cache, sécurité.'],
      ['Tests automatisés en CI', 'code', 220, 30, 'Tests unitaires + intégration, quality gates.'],
      ['Déploiement & rollback', 'livrable', 220, 30, 'Documentation de déploiement et procédure de retour arrière.'],
    ],
  },
  {
    id: 6, slug: 'mt-mentorat', title: 'Devenir mentor', subtitle: 'Transmettre ce que l’on sait',
    category: 'Communauté', track: 'aidant', difficulty: 'intermediaire', xpReward: 500, trackPoints: 260, germs: 35,
    minutes: 70, participants: 71, rate: 72, author: 'Centre CODE212', icon: '★', gradient: 'magenta', days: 16, prereq: [],
    objectives: ['Rédiger une réponse utile', 'Encadrer un binôme', 'Animer une session live'],
    badges: ['Aideur'],
    steps: [
      ['Écrire pour aider', 'lecture', 90, 15, 'Méthode, ton, exemples reproductibles.'],
      ['Répondre dans La Forge', 'livrable', 180, 25, '3 réponses acceptées par un formateur.'],
      ['Session live d’entraide', 'live', 230, 30, 'Animer 30 min, fenced par le Centre.'],
    ],
  },
  {
    id: 7, slug: 'architecture-clean', title: 'Architecture Clean', subtitle: 'Concevoir pour durer',
    category: 'Architecture', track: 'batisseur', difficulty: 'expert', xpReward: 1100, trackPoints: 280, germs: 75,
    minutes: 150, participants: 38, rate: 29, author: 'Dr. Karim Idrissi', icon: '▦', gradient: 'violet', days: 14, prereq: [3, 5],
    objectives: ['Cartographier un domaine métier', 'Isoler la logique métier', 'Documenter les décisions (ADR)'],
    badges: ['Architecte'],
    steps: [
      ['Découpage en domaines', 'lecture', 160, 25, 'Bounded contexts, dépendances, hexagonal.'],
      ['Refactoring guidé', 'code', 420, 60, 'Extraire la logique métier d’un projet réel.'],
      ['Livrable : 3 ADR', 'livrable', 520, 65, 'Architecture Decision Records argumentés et sourcés.'],
    ],
  },
  {
    id: 8, slug: 'javascript-avance', title: 'JavaScript Avancé', subtitle: 'Asynchrone, typage et performance',
    category: 'Développement', track: 'codeur', difficulty: 'avance', xpReward: 820, trackPoints: 210, germs: 50,
    minutes: 100, participants: 77, rate: 47, author: 'Mehdi Alaoui', icon: 'JS', gradient: 'orange', days: 12, prereq: [1],
    objectives: ['Maîtriser event loop et promises', 'Typage progressif', 'Mesurer les performances'],
    badges: ['Async Adept'],
    steps: [
      ['Event loop & concurrence', 'lecture', 140, 20, 'Microtâches, workers, concurrence réelle.'],
      ['TypeScript en pratique', 'code', 320, 40, 'Types génériques, narrowing, satisfies.'],
      ['Profiling & optimisation', 'code', 360, 40, 'Mesurer avant d’optimiser, bundle analysis.'],
    ],
  },
  {
    id: 9, slug: 'git-collaboration', title: 'Git & Collaboration', subtitle: 'Travailler à plusieurs sans se marcher dessus',
    category: 'Outils', track: 'aidant', difficulty: 'debutant', xpReward: 380, trackPoints: 200, germs: 25,
    minutes: 40, participants: 143, rate: 79, author: 'Centre CODE212', icon: '⑂', gradient: 'cyan', days: 11, prereq: [],
    objectives: ['Écrire des commits utiles', 'Résoudre un conflit', 'Ouvrir une Pull Request propre'],
    badges: ['Git Guardian'],
    steps: [
      ['Modèle de branches du centre', 'lecture', 70, 10, 'trunk-based, conventions de nommage.'],
      ['TP conflits & rébase', 'code', 160, 20, 'Résoudre 5 conflits préparés.'],
      ['Livrable : PR commentée', 'livrable', 150, 10, 'Une PR lue et relue par un pair.'],
    ],
  },
  {
    id: 10, slug: 'veille-techno', title: 'Veille technologique', subtitle: 'Rester lucide face au bruit',
    category: 'Innovation', track: 'explorateur', difficulty: 'debutant', xpReward: 420, trackPoints: 240, germs: 30,
    minutes: 50, participants: 59, rate: 58, author: 'Cluster CCIS', icon: '◐', gradient: 'violet', days: 9, prereq: [],
    objectives: ['Construire un flux de veille', 'Évaluer la crédibilité d’une source', 'Partager une synthèse utile'],
    badges: ['Veille Active'],
    steps: [
      ['Sources fiables & RSS', 'lecture', 80, 15, 'Panorama des sourcesчай pour la tech.'],
      ['Filtre & synthèse', 'livrable', 190, 20, 'Une note de veille de 500 mots sourcée.'],
      ['Restitution dans La Forge', 'live', 150, 15, 'Présentation de 5 min à ton groupe.'],
    ],
  },
  {
    id: 11, slug: 'projet-fil-rouge', title: 'Projet fil rouge', subtitle: 'Construire, montrer, défendre',
    category: 'Projet', track: 'batisseur', difficulty: 'expert', xpReward: 1400, trackPoints: 320, germs: 100,
    minutes: 300, participants: 24, rate: 22, author: 'Jury Centre CODE212', icon: '⬢', gradient: 'magenta', days: 7, prereq: [5, 7],
    objectives: ['Livrer un projet complet', 'Documenter et présenter', 'Recevoir une évaluation signée'],
    badges: ['Bâtisseur', 'Certification projet'],
    steps: [
      ['Cadrage & plan', 'livrable', 180, 40, 'Périmètre, user stories, backlog, jalons.'],
      ['Développement', 'code', 700, 160, 'Itérations, revue de code, tests.'],
      ['Défense devant jury', 'live', 520, 100, 'Soutenance 10 min + questions.'],
    ],
  },
  {
    id: 12, slug: 'open-source-contrib', title: 'Contribuer à l’Open Source', subtitle: 'Sa première pull request',
    category: 'Communauté', track: 'explorateur', difficulty: 'intermediaire', xpReward: 640, trackPoints: 250, germs: 45,
    minutes: 90, participants: 44, rate: 45, author: 'Communauté open source', icon: '◎', gradient: 'orange', days: 5, prereq: [9],
    objectives: ['Trouver un projet accueillant', 'Rédiger une contribution acceptable', 'Faire relire sa PR'],
    badges: ['First Merge'],
    steps: [
      ['Choisir un projet', 'lecture', 90, 15, 'Signaux d’un projet friendly, guidelines.'],
      ['Contribuer', 'code', 320, 45, 'Fix ou doc, tests, commits propres.'],
      ['PR acceptée', 'livrable', 230, 30, 'Lien vers la PR fusionnée.'],
    ],
  },
  {
    id: 13, slug: 'full-stack-web', title: 'Développement Web Full-Stack', subtitle: '6 étapes concises pour tester la chaîne complète',
    category: 'Développement Web', track: 'codeur', difficulty: 'debutant', xpReward: 350, trackPoints: 100, germs: 25,
    minutes: 60, participants: 85, rate: 92, author: 'Centre CODE212', icon: '</>', gradient: 'violet', days: 1, prereq: [],
    objectives: [
      'Structurer une interface en HTML/CSS sémantique',
      'Rendre la page interactive en JavaScript moderne',
      'Traiter des requêtes en PHP et requêter une base SQL',
      'Exposer une API REST Laravel et la consommer',
    ],
    badges: ['Full-Stack Starter'],
    steps: [
      ['HTML & CSS : Structure et Style', 'code', 50, 10, 'Syntaxe : <main>, <header>, flexbox. Exemple : carte responsive. Test : créer une carte profil centrée.'],
      ['JavaScript : DOM et Événements', 'code', 50, 10, 'Syntaxe : document.querySelector, addEventListener. Exemple : clic déclenchant une action. Test : injecter du texte au clic.'],
      ['PHP : Formulaires et Traitement', 'code', 50, 10, 'Syntaxe : htmlspecialchars($_POST["val"]). Exemple : script recevant un formulaire. Test : valider et renvoyer la saisie nettoyée.'],
      ['SQL : Bases et Relations', 'code', 50, 10, 'Syntaxe : SELECT u.nom, q.titre FROM users u JOIN quests q ON q.user_id = u.id. Exemple : requête jointe. Test : écrire une jointure avec filtre.'],
      ['Laravel : Routes et Contrôleurs', 'code', 50, 10, 'Syntaxe : Route::get("/api/v1/...", [Ctrl::class, "index"]). Exemple : contrôleur API JSON. Test : déclarer un endpoint et valider un FormRequest.'],
      ['Intégration Full-Stack : API REST & Frontend', 'livrable', 100, 10, 'Syntaxe : fetch("/api/v1/...") + affichage React. Exemple : chargement asynchrone d une liste. Test : soumettre le livrable complet.'],
    ],
  },
]

export const quests: Quest[] = questSeeds.map((q) => ({
  id: q.id,
  slug: q.slug,
  title: q.title,
  subtitle: q.subtitle,
  description: `${q.subtitle}. Cette quête vous guide pas à pas à travers des exercices corrigés par les formateurs du centre CODE212, avec un livrable évalué et une attestation de compétence.`,
  category: q.category,
  track: q.track,
  difficulty: q.difficulty,
  status: 'publiee',
  xpReward: q.xpReward,
  trackPoints: q.trackPoints,
  germsReward: q.germs,
  durationMinutes: q.minutes,
  participants: q.participants,
  completionRate: q.rate,
  prerequisites: q.prereq,
  badges: q.badges,
  authorName: q.author,
  createdAt: iso(q.days),
  coverGradient: q.gradient,
  icon: q.icon,
  enrolled: false,
  progress: 0,
  steps: q.steps.map((s, i) => step(i + 1, s)),
  objectives: q.objectives,
}))

/* ------------------------------------------------------------------ badges */

const badgeSeeds: Array<[string, string, TrackCode, Badge['rarity'], number, string, string, number, number]> = [
  ['AI Explorer', 'Première quête IA terminée', 'codeur', 'commun', 50, '✦', 'Compléter une quête Intelligence artificielle', 0, 1],
  ['Cyber Guardian', 'Fondamentaux cybersécurité validés', 'codeur', 'rare', 120, '⌘', 'Terminer la quête Cybersecurity Sprint', 0, 1],
  ['API Architect', 'Backend complet maîtrisé', 'codeur', 'epique', 200, '</>', 'Livrer une API REST testée', 0, 1],
  ['Async Adept', 'Maîtrise de l’asynchrone', 'codeur', 'rare', 120, '⚡', 'Terminer JavaScript Avancé', 0, 1],
  ['Pipeline Master', 'CI/CD opérationnel', 'batisseur', 'rare', 130, '⚙', 'Terminer DevOps Pipeline', 0, 1],
  ['Data Mind', 'Lecture critique des données', 'batisseur', 'commun', 60, '◈', 'Terminer Data Detective', 1, 1],
  ['Architecte', 'Décisions d’architecture argumentées', 'batisseur', 'legendaire', 350, '▦', 'Terminer Architecture Clean', 0, 1],
  ['Bâtisseur', 'Projet fil rouge livré', 'batisseur', 'epique', 300, '⬢', 'Terminer Projet fil rouge', 0, 1],
  ['Aideur', 'Première réponse acceptée', 'aidant', 'commun', 50, '★', 'Aider un pair dans La Forge', 0, 1],
  ['Mentor', '10 réponses acceptées', 'aidant', 'rare', 140, '★', '10 réponses acceptées par des formateurs', 3, 10],
  ['Pilier', 'Session live animée', 'aidant', 'epique', 240, '◈', 'Animer une session d’entraide', 0, 1],
  ['Git Guardian', 'Collaborateur fiable', 'aidant', 'commun', 40, '⑂', 'Terminer Git & Collaboration', 0, 1],
  ['Veille Active', 'Curiosity structurée', 'explorateur', 'commun', 50, '◐', 'Terminer Veille technologique', 0, 1],
  ['First Merge', 'Première contribution acceptée', 'explorateur', 'rare', 130, '◎', 'Faire fusionner une pull request', 0, 1],
  ['Ambassadeur', 'Parrainage de 3 nouveaux arrivants', 'explorateur', 'epique', 260, '✧', 'Accompagner 3 nouveaux étudiants', 0, 3],
  ['Early Bird', 'Actif avant 8h, 5 jours de suite', 'explorateur', 'commun', 45, '☀', '5 connexions matinales', 0, 5],
  ['In serie', '7 jours de série', 'aidant', 'commun', 60, '🔥', 'Maintenir 7 jours consécutifs', 7, 7],
  ['Marathon', '30 jours de série', 'explorateur', 'legendaire', 400, '🏔', 'Maintenir 30 jours consécutifs', 0, 30],
  ['Première Quête', 'Tu as commencé', 'codeur', 'commun', 25, '◔', 'Terminer ta première quête', 0, 1],
  ['Dizaines', '10 quêtes terminées', 'codeur', 'rare', 110, '◑', 'Terminer 10 quêtes', 0, 10],
  ['Centurion', '100 quêtes terminées', 'codeur', 'legendaire', 500, '⬢', 'Terminer 100 quêtes', 0, 100],
  ['Parcours Complet', 'Un parcours intégral', 'batisseur', 'rare', 150, '▣', 'Terminer tous les parcours liés', 0, 1],
  ['Certifié', 'Première certification', 'codeur', 'rare', 150, '❖', 'Obtenir une certification', 0, 1],
  ['Double Certifié', 'Deux certifications', 'batisseur', 'epique', 220, '❖', 'Obtenir deux certifications', 0, 2],
  ['Réputation', '10 upvotes reçues', 'aidant', 'commun', 70, '↑', 'Recevoir 10 votes positifs', 0, 10],
  ['Polyvalent', '3 voies actives', 'explorateur', 'epique', 230, '✺', 'Progresser sur 3 voies', 2, 3],
  ['Voie Dominante', 'Une voie au rang 3', 'batisseur', 'rare', 160, '◆', 'Atteindre le rang 3 sur une voie', 0, 1],
  ['Retourneur', 'Revenir après 30 jours', 'aidant', 'commun', 55, '↺', 'Reprendre après une pause', 0, 1],
  ['Membre Fidèle', '30 jours sur la plateforme', 'explorateur', 'rare', 140, '❥', '30 jours d’activité', 0, 30],
  ['Ambassadeur UCA', 'Représenter le centre', 'explorateur', 'legendaire', 450, '★', 'Mission de représentation validée', 0, 1],
]

/** Etat d'avancement coherent : 8 badges obtenus, les autres en progression. */
const badgeProgress: Record<string, { earned: boolean; progress: number }> = {
  'Première Quête': { earned: true, progress: 1 },
  'Git Guardian': { earned: true, progress: 1 },
  'Aideur': { earned: true, progress: 1 },
  'Data Mind': { earned: true, progress: 1 },
  'In serie': { earned: true, progress: 7 },
  'Veille Active': { earned: true, progress: 1 },
  'Réputation': { earned: true, progress: 10 },
  'Early Bird': { earned: true, progress: 5 },
  'AI Explorer': { earned: false, progress: 0 },
  'Cyber Guardian': { earned: false, progress: 0 },
  'Mentor': { earned: false, progress: 3 },
  'Dizaines': { earned: false, progress: 4 },
  'Polyvalent': { earned: false, progress: 2 },
  'Parcours Complet': { earned: false, progress: 1 },
  'Membre Fidèle': { earned: false, progress: 12 },
  'Voie Dominante': { earned: false, progress: 1 },
}

const badgeImageUrls: Record<string, string> = {
  'AI Explorer': '/badges/ai-explorer.png',
  'Cyber Guardian': '/badges/cyber-guardian.png',
}

export const badges: Badge[] = badgeSeeds.map(([name, description, track, rarity, xp, icon, rule, _earned, target], i) => {
  const state = badgeProgress[name] ?? { earned: false, progress: Math.max(0, target - 1) }
  const progress = state.earned ? target : Math.min(state.progress, Math.max(0, target - 1))
  return {
    code: `BDG-${String(i + 1).padStart(3, '0')}`,
    name,
    description,
    track,
    rarity,
    icon,
    ...(badgeImageUrls[name] ? { imageUrl: badgeImageUrls[name] } : {}),
    xp,
    rule,
    earned: state.earned,
    earnedAt: state.earned ? iso(4 + i) : undefined,
    progress,
    target,
    evidence: state.earned ? 'Preuve validee par le Centre CODE212' : undefined,
  }
})

/* --------------------------------------------------------------- parcours */

export const paths: LearningPath[] = [
  {
    id: FULLSTACK_PATH_ID, slug: 'fullstack', title: 'Parcours Développeur Full-Stack',
    description: 'Parcours débutant Full-Stack en 3 modules progressifs : Fondations HTML/CSS, Dynamique JavaScript et Backend Laravel API.',
    track: 'codeur', level: 'debutant', quests: fullStackModules.map((m) => m.finalQuest.id), progress: 0, xpReward: 500,
    estimatedHours: 14, enrolled: true, icon: '</>', gradient: 'violet',
    skills: ['HTML/CSS', 'JavaScript', 'PHP', 'SQL', 'Laravel', 'React'],
    // Mêmes modules, ordre et quêtes finales que le seeder Laravel.
    modules: fullStackModules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order: m.order,
      status: m.order === 1 ? 'en_cours' : 'verrouille',
      exercisesTotal: m.lessons.reduce((n, l) => n + l.exercises.length, 0),
      exercisesPassed: 0,
      questId: m.finalQuest.id,
    })),
  },
  {
    id: 2, slug: 'ia-data', title: 'IA & Data Science',
    description: 'Prompting, modèles, analyse de données et mise en production raisonnée.',
    track: 'codeur', level: 'avance', quests: [1, 4, 12], progress: 28, xpReward: 4100,
    estimatedHours: 18, enrolled: true, icon: '✦', gradient: 'magenta',
    skills: ['Prompt engineering', 'Pandas', 'Statistiques', 'Éthique'],
  },
  {
    id: 3, slug: 'cyber', title: 'Cybersécurité Offensive & Défensive',
    description: 'Comprendre l’attaque pour mieux défendre, dans un cadre éthique et encadré.',
    track: 'codeur', level: 'avance', quests: [2, 5], progress: 15, xpReward: 2800,
    estimatedHours: 12, enrolled: false, icon: '⌘', gradient: 'cyan',
    skills: ['OWASP', 'Analyse de logs', 'Docker', 'Durcissement'],
  },
  {
    id: 4, slug: 'devops', title: 'DevOps & Cloud',
    description: 'Pipelines, conteneurs, observabilité et déploiements reproductibles.',
    track: 'batisseur', level: 'avance', quests: [5, 3, 7], progress: 0, xpReward: 3600,
    estimatedHours: 16, enrolled: false, icon: '⚙', gradient: 'cyan',
    skills: ['Docker', 'CI/CD', 'Kubernetes', 'Observabilité'],
  },
  {
    id: 5, slug: 'leadership', title: 'Soft Skills & Leadership Tech',
    description: 'Mentorat, communication technique et leadership d’une équipe produit.',
    track: 'aidant', level: 'debutant', quests: [6, 9, 10], progress: 45, xpReward: 1900,
    estimatedHours: 8, enrolled: true, icon: '★', gradient: 'orange',
    skills: ['Mentorat', 'Communication', 'Gestion de projet', 'Veille'],
  },
]

/* ---------------------------------------------------------------- missions */

export const missions: Mission[] = [
  { id: 1, title: 'Quête de la semaine', description: 'Terminer 3 quêtes de n’importe quelle voie.', period: 'hebdomadaire', target: 3, progress: 2, xpReward: 250, germsReward: 20, claimed: false, expiresAt: iso(-3), icon: '◔' },
  { id: 2, title: 'Série de 5 jours', description: 'Te connecter 5 jours consécutifs cette semaine.', period: 'hebdomadaire', target: 5, progress: 5, xpReward: 180, germsReward: 15, claimed: false, expiresAt: iso(-3), icon: '🔥' },
  { id: 3, title: 'Aide un pair', description: 'Répondre à 2 questions dans La Forge.', period: 'hebdomadaire', target: 2, progress: 1, xpReward: 200, germsReward: 15, claimed: false, expiresAt: iso(-3), icon: '★' },
  { id: 4, title: 'Expertise mensuelle', description: 'Terminer 8 quêtes sur le mois.', period: 'mensuel', target: 8, progress: 5, xpReward: 600, germsReward: 50, claimed: false, expiresAt: iso(-14), icon: '⬢' },
  { id: 5, title: 'Communauté active', description: '10 contributions utiles (questions, réponses, veilles).', period: 'mensuel', target: 10, progress: 10, xpReward: 450, germsReward: 40, claimed: true, expiresAt: iso(-14), icon: '✺' },
]

/* -------------------------------------------------------------- challenges */

export const challenges: Challenge[] = [
  {
    id: 1, slug: 'ai-sprint-24h', title: 'AI Sprint 24H', description: '24 heures pour prototyper une solution IA utile à la vie étudiante.',
    category: 'Intelligence artificielle', mode: 'equipe', status: 'en_cours', difficulty: 'avance', xpReward: 1500,
    startsAt: iso(1, 8), endsAt: iso(-1, 8), participants: 148, maxParticipants: 200, prize: '2 000 germes + badge Hunter',
    joined: true, progress: 62, score: 740, teamName: 'Équipe Nova', track: 'codeur',
    rules: ['Équipe de 3 à 5 membres', 'Dépôt d’une démo de 3 minutes', 'Code ouvert exigé'],
  },
  {
    id: 2, slug: 'capture-the-flag', title: 'Capture The Flag', description: 'Le classique revisité : 6 catégories asynchrones, crypto et web.',
    category: 'Cybersécurité', mode: 'solo', status: 'en_cours', difficulty: 'expert', xpReward: 1200,
    startsAt: iso(3, 9), endsAt: iso(-2, 17), participants: 212, maxParticipants: 300, prize: 'Badge Cyber Guardian accéléré',
    joined: false, progress: 0, track: 'codeur',
    rules: ['Classement individuel pseudonymisé', 'Aucune triche, audit des logs', 'Durée 48h'],
  },
  {
    id: 3, slug: 'duel-algorithmes', title: 'Duel d’algorithmes', description: 'Duel en 1v1, 25 minutes, deux problèmes, un vainqueur.',
    category: 'Algorithmique', mode: 'duel', status: 'a_venir', difficulty: 'intermediaire', xpReward: 600,
    startsAt: iso(-2, 18), endsAt: iso(-4, 22), participants: 64, maxParticipants: 128, prize: '150 germes par victoire',
    joined: false, progress: 0, track: 'codeur',
    rules: ['Appariement par niveau', 'Victoire = +75 XP', 'Format best-of-3'],
  },
  {
    id: 4, slug: 'data-jam', title: 'Data Jam', description: '72h pour transformer un jeu de données ouvert en décision argumentée.',
    category: 'Data & Analytics', mode: 'equipe', status: 'a_venir', difficulty: 'intermediaire', xpReward: 1000,
    startsAt: iso(-5, 10), endsAt: iso(-8, 10), participants: 0, maxParticipants: 150, prize: 'Certification Data Literacy',
    joined: false, progress: 0, track: 'batisseur',
    rules: ['Datasets fournis par le centre', 'Pitch de 5 minutes', 'Code et données reproductibles'],
  },
  {
    id: 5, slug: 'code-review-cup', title: 'Code Review Cup', description: 'Relire le code des autres, améliorer le collectif.',
    category: 'Communauté', mode: 'solo', status: 'termine', difficulty: 'debutant', xpReward: 500,
    startsAt: iso(12, 9), endsAt: iso(5, 18), participants: 97, maxParticipants: 200, prize: 'Voie Aidant accélérée',
    joined: true, progress: 100, score: 920, track: 'aidant',
    rules: ['10 revues de qualité minimum', 'Notation par les pairs'],
  },
  {
    id: 6, slug: 'hack-uca-2026', title: 'Hack UCA 2026', description: 'Le hackathon inter-facultés : 48h, 5tracks, un podium.',
    category: 'Innovation', mode: 'equipe', status: 'a_venir', difficulty: 'expert', xpReward: 2500,
    startsAt: iso(-20, 9), endsAt: iso(-22, 18), participants: 0, maxParticipants: 400, prize: 'Sponsor + certification',
    joined: false, progress: 0, track: 'explorateur',
    rules: ['Inter-universités', 'Mentorat assuré par le centre', 'Pitch devant jury'],
  },
  {
    id: 7, slug: 'sql-marathon', title: 'SQL Marathon', description: '6hours pour battre le temps de résolution de requêtes.',
    category: 'Data & Analytics', mode: 'solo', status: 'termine', difficulty: 'intermediaire', xpReward: 700,
    startsAt: iso(20, 9), endsAt: iso(14, 15), participants: 133, maxParticipants: 200, prize: 'Badge Data Mind',
    joined: true, progress: 100, score: 1180, track: 'codeur',
    rules: ['6 manches de 45 minutes', 'Classement par temps moyen'],
  },
  {
    id: 8, slug: 'ui-challenge', title: 'UI Challenge', description: 'Reproduire et améliorer une interface, design system de Code212.',
    category: 'Design', mode: 'solo', status: 'en_cours', difficulty: 'intermediaire', xpReward: 800,
    startsAt: iso(2, 8), endsAt: iso(-3, 23), participants: 89, maxParticipants: 150, prize: 'Pack design (300 germes)',
    joined: false, progress: 0, track: 'batisseur',
    rules: ['Maquette + prototype fonctionnel', 'Évaluation design system'],
  },
]

/* --------------------------------------------------------------- classement */

const lbNames: Array<[string, string, string, number, number, number, number, LeaderboardEntry['trend']]> = [
  ['Omar Benali', 'O. Benali', 'Data science', 6240, 18, 12, 31, 'up'],
  ['Yasmine El Amrani', 'Yasmine', 'Génie informatique', 4820, 14, 9, 7, 'same'],
  ['Salma Tazi', 'S. Tazi', 'Réseaux & sécurité', 4390, 12, 11, 22, 'up'],
  ['Adam Berrada', 'A. Berrada', 'Génie logiciel', 3980, 9, 7, 5, 'down'],
  ['Nour Chraibi', 'N. Chraibi', 'Intelligence artificielle', 3620, 11, 8, 14, 'up'],
  ['Ilyas Mansouri', 'I. Mansouri', 'Data science', 3380, 7, 6, 9, 'same'],
  ['Hiba Ouazzani', 'H. Ouazzani', 'Génie informatique', 3140, 8, 5, 18, 'up'],
  ['Mehdi Zouiten', 'M. Zouiten', 'Cyber sécurité', 2980, 6, 6, 3, 'down'],
  ['Ghita Amrani', 'G. Amrani', 'Génie logiciel', 2760, 7, 4, 11, 'same'],
  ['Rachid El Idrissi', 'R. El Idrissi', 'Intelligence artificielle', 2540, 5, 5, 8, 'up'],
  ['Sofia Lemtouni', 'S. Lemtouni', 'Data science', 2380, 4, 4, 6, 'same'],
  ['Karim Bennani', 'K. Bennani', 'Réseaux & sécurité', 2210, 3, 3, 4, 'down'],
]

export const leaderboard: LeaderboardEntry[] = lbNames.map(([name, pseudo, program, xp, weekly, completed, streak, trend], i) => ({
  rank: i + 1,
  userId: 2,
  displayName: name,
  pseudonym: pseudo,
  program,
  level: xp >= 4500 ? 8 : xp >= 3600 ? 7 : xp >= 2700 ? 6 : xp >= 1800 ? 5 : xp >= 1100 ? 4 : 3,
  xp,
  weeklyXp: weekly * 120,
  questsCompleted: completed,
  streakDays: streak,
  isCurrentUser: name === 'Yasmine El Amrani',
  trend,
}))

/* ------------------------------------------------------------------ boutique */

export const rewards: Reward[] = [
  { id: 1, name: 'Avatar Néon', description: 'Avatar animé exclusif, visible partout sur la plateforme.', category: 'cosmetique', cost: 350, stock: 42, icon: '◈', gradient: 'violet', owned: 0 },
  { id: 2, name: 'Cadre de badge Or', description: 'Encadrement doré pour tes badgesvalidated.', category: 'cosmetique', cost: 500, stock: 18, icon: '❖', gradient: 'orange', limited: true, owned: 0 },
  { id: 3, name: 'Session mentor 1h', description: 'Une heure de mentorat individuel avec un formateur du centre.', category: 'mentorat', cost: 1200, stock: 8, icon: '★', gradient: 'magenta', limited: true, owned: 0 },
  { id: 4, name: 'Accès anticipé Labo IA', description: 'Accès prioritaire aux ateliers du laboratoire Intelligence Artificielle.', category: 'avantage', cost: 800, stock: 25, icon: '✦', gradient: 'cyan', owned: 0 },
  { id: 5, name: 'T-shirt Code212', description: 'Édition limitée du centre, taille M.', category: 'materiel', cost: 900, stock: 12, icon: '⬢', gradient: 'magenta', owned: 0 },
  { id: 6, name: 'Badge Orbital', description: 'Badge cosmétique animé, non transférable.', category: 'cosmetique', cost: 250, stock: 120, icon: '◎', gradient: 'cyan', owned: 0 },
  { id: 7, name: 'Visa examen blanc', description: 'Accès à une session d’examen blanc blanc.', category: 'avantage', cost: 600, stock: 30, icon: '❋', gradient: 'orange', owned: 0 },
  { id: 8, name: 'Clé USB Code212', description: 'Support de stockage 32 Go gravé au logo du centre.', category: 'materiel', cost: 450, stock: 0, icon: '⬡', gradient: 'violet', owned: 0 },
]

/* ---------------------------------------------------------------- La Forge */

export const forgeCategories: ForgeCategory[] = [
  { slug: 'entraide', name: 'Entraide', description: 'Posez une question, aidez un pair.', icon: '★', threads: 342, requiresApproval: false, moderatedBy: 'Salma Tazi' },
  { slug: 'projets', name: 'Projets', description: 'Montrez ce que vous construisez.', icon: '⬢', threads: 128, requiresApproval: false, moderatedBy: 'Dr. Karim Idrissi' },
  { slug: 'coding-league', name: 'Coding League', description: 'Annonces et résultats des compétitions.', icon: '⌘', threads: 64, requiresApproval: true, moderatedBy: 'Centre CODE212' },
  { slug: 'annonces', name: 'Annonces', description: 'Actualités du centre etubu sessions.', icon: '◈', threads: 41, requiresApproval: true, moderatedBy: 'Centre CODE212' },
  { slug: 'cafe', name: 'Café de la Forge', description: 'Conversations libres entre étudiants.', icon: '☕', threads: 217, requiresApproval: false, moderatedBy: 'Omar Benali' },
]

export const forgeThreads: ForgeThread[] = [
  {
    id: 1, category: 'entraide', title: 'Erreur TypeScript « Object is possibly undefined » dans un useEffect',
    body: 'Bonjour, je bloque sur un useEffect qui fetch un compte utilisateur. TypeScript me dit que user est possiblement undefined au moment du setState. Quelqu’un a une approche propre qui ne casse pas le rendu ?',
    authorId: 12, authorName: 'Adam Berrada', authorPseudonym: 'A. Berrada', authorRole: 'student',
    createdAt: iso(0, 9), replies: 7, views: 184, likes: 12, liked: false, solved: true, tags: ['typescript', 'react'], solutionIds: [1, 2],
    pinned: true,
  },
  {
    id: 2, category: 'projets', title: 'MediTrack — suivi des patients pour les stages cliniques',
    body: 'Je développe une application de suivi pour mon stage à l’hôpital. J’ai un prototype Laravel + Vue, jinterested par des retours sur le modèle de données.',
    authorId: 15, authorName: 'Ghita Amrani', authorPseudonym: 'G. Amrani', authorRole: 'student',
    createdAt: iso(1, 14), replies: 5, views: 96, likes: 8, liked: true, solved: false, tags: ['laravel', 'projet'], solutionIds: [],
  },
  {
    id: 3, category: 'coding-league', title: 'Inscriptions Coding League 2026 — dernière semaine',
    body: 'Les inscriptions pour la ligue de coding closes samedi. Les équipes de 3 sont prioritaires sur les individuelles cette année.',
    authorId: 3, authorName: 'Centre CODE212', authorPseudonym: 'Équipe CODE212', authorRole: 'admin',
    createdAt: iso(2, 10), replies: 21, views: 612, likes: 47, liked: false, solved: false, tags: ['annonce', 'compétition'], solutionIds: [], pinned: true,
  },
  {
    id: 4, category: 'entraide', title: 'Conteneur Docker qui sort en OOM sur le build Vite',
    body: 'Mon build Vite dépasse la mémoire sur une machine 4 Go. J’ai déjà essayé NODE_OPTIONS mais ça ne suffit pas sur les gros bundles.',
    authorId: 18, authorName: 'Rachid El Idrissi', authorPseudonym: 'R. El Idrissi', authorRole: 'student',
    createdAt: iso(3, 11), replies: 11, views: 305, likes: 19, liked: false, solved: true, tags: ['docker', 'vite'], solutionIds: [3],
  },
  {
    id: 5, category: 'cafe', title: 'Quelqu’un a déjà travaillé chez un éditeur de jeux à Casablanca ?',
    body: 'Je prépare mon stage de fin d’études et je suis curieux de savoir comment se passe une candidature dans ce secteur.',
    authorId: 21, authorName: 'Sofia Lemtouni', authorPseudonym: 'S. Lemtouni', authorRole: 'student',
    createdAt: iso(4, 17), replies: 9, views: 141, likes: 15, liked: false, solved: false, tags: ['carrière', 'stage'],
  } as unknown as ForgeThread,
  {
    id: 6, category: 'projets', title: 'Retour sur mon portfolio : je cherche un avis brutal',
    body: 'J’ai refait mon portfolio en React et Tailwind. Je cherche des retours francs, surtout sur la hiérarchie visuelle et les projets mis en avant.',
    authorId: 22, authorName: 'Karim Bennani', authorPseudonym: 'K. Bennani', authorRole: 'student',
    createdAt: iso(6, 13), replies: 14, views: 268, likes: 22, liked: false, solved: false, tags: ['portfolio', 'design'], solutionIds: [],
  },
]

export const forgeSolutions: ForgeSolution[] = [
  {
    id: 1, threadId: 1, authorId: 9, authorName: 'Omar Benali', authorPseudonym: 'O. Benali',
    body: 'Le plus simple : tu remontes l’état de chargement avant d’accéder à user.\n\n```ts\nconst [user, setUser] = useState<User | null>(null)\nuseEffect(() => {\n  let alive = true\n  fetch("/api/me").then(r => r.json()).then(d => alive && setUser(d))\n  return () => { alive = false }\n}, [])\n```\n\nLe flag `alive` évite aussi le setState après unmount.',
    accepted: true, acceptedAt: iso(0, 11), createdAt: iso(0, 10), likes: 24, mine: false,
  },
  {
    id: 2, threadId: 1, authorId: 12, authorName: 'Adam Berrada', authorPseudonym: 'A. Berrada',
    body: 'Tu peux aussi discriminer le union : `if (!data) return` avant le setState.',
    accepted: false, createdAt: iso(0, 10), likes: 6, mine: true,
  },
  {
    id: 3, threadId: 4, authorId: 3, authorName: 'Dr. Karim Idrissi', authorPseudonym: 'K. Idrissi',
    body: 'Construisez l’image avec `--memory=2g` et montez le cache npm. Le build multi-stage sans les devDependencies réduit l’empreinte de moitié.',
    accepted: true, acceptedAt: iso(3, 15), createdAt: iso(3, 13), likes: 18, mine: false,
  },
  {
    id: 4, threadId: 2, authorId: 30, authorName: 'Amine El Fassi', authorPseudonym: 'A. El Fassi', authorRole: 'admin',
    body: 'Très belle initiative. Pensez à limiter les accès par rôle et à journaliser les consultations : le suivi clinique doit rester strictement réservé aux encadrants et aux stagiaires concernés.',
    accepted: false, createdAt: iso(0, 16), likes: 3, mine: false,
  },
]

/* -------------------------------------------------------------- certifications */

export const certifications: Certification[] = [
  {
    id: 1, code: 'C212-AI-2026-0842', title: 'AI & Prompt Engineering', issuer: 'Code212 · Intelligence artificielle',
    track: 'codeur', issuedAt: iso(12), status: 'obtenue', progress: 100, signed: false,
    criteria: ['3 quêtes validées', 'Quiz final ≥ 80 %', 'Livrable évalué par un formateur'],
    skills: ['Prompting', 'Évaluation LLM', 'Documentation'],
  },
  {
    id: 2, code: 'C212-WD-2026-0618', title: 'Web Development Essentials', issuer: 'Code212 · Développement',
    track: 'codeur', issuedAt: iso(44), status: 'obtenue', progress: 100, signed: false,
    criteria: ['5 quêtes validées', 'Projet fil rouge rendu', 'Revue de code par les pairs'],
    skills: ['React', 'Laravel', 'Git'],
  },
  {
    id: 3, code: 'C212-DATA-2026-0121', title: 'Data Literacy Foundations', issuer: 'Code212 · Data & Analytics',
    track: 'batisseur', issuedAt: iso(70), status: 'en_cours', progress: 70, signed: false,
    criteria: ['3 quêtes validées', 'Analyse documentée', 'Quiz final ≥ 70 %'],
    skills: ['Statistiques', 'Visualisation', 'Pandas'],
  },
  {
    id: 4, code: 'C212-CYB-2026-0093', title: 'Cyber Security Awareness', issuer: 'Code212 · Cybersécurité',
    track: 'codeur', issuedAt: iso(95), status: 'expiree', progress: 100, signed: false,
    criteria: ['2 quêtes validées', 'Quiz final ≥ 80 %'],
    skills: ['OWASP', 'Analyse de logs'],
  },
]

/* --------------------------------------------------------- rules & submissions */

export const xpRules: XpRule[] = [
  { id: 1, code: 'quest.complete', label: 'Quête terminée', description: 'Récompense à la validation d’une quête par un formateur.', xp: 450, dailyCap: 1500, track: null, active: true, version: 3, category: 'quetes' },
  { id: 2, code: 'quest.step', label: 'Étape validée', description: 'Bonus par étape validée dans une quête en cours.', xp: 80, dailyCap: 800, track: null, active: true, version: 2, category: 'quetes' },
  { id: 3, code: 'quest.hard', label: 'Quête difficile', description: 'Bonus de difficulté : +50 % de la récompense.', xp: 220, dailyCap: 600, track: null, active: true, version: 1, category: 'quetes' },
  { id: 4, code: 'forge.answer', label: 'Réponse acceptée', description: 'Rémunération d’une réponse validée par l’auteur du fil.', xp: 40, dailyCap: 200, track: 'aidant', active: true, version: 4, category: 'communaute' },
  { id: 5, code: 'forge.question', label: 'Question publiée', description: 'Question utile publiée dans La Forge.', xp: 20, dailyCap: 100, track: 'aidant', active: true, version: 2, category: 'communaute' },
  { id: 6, code: 'forge.answer.accepted', label: 'Solution acceptée', description: 'Palier supérieur pour une solution acceptée.', xp: 120, dailyCap: 300, track: 'aidant', active: true, version: 1, category: 'communaute' },
  { id: 7, code: 'presence.checkin', label: 'Présence validée', description: 'Session de présence validée (source Libki à confirmer).', xp: 50, dailyCap: 100, track: null, active: false, version: 1, category: 'presence' },
  { id: 8, code: 'event.participation', label: 'Participation à un événement', description: 'Participation à un événement Code212 ou Coding League.', xp: 80, dailyCap: 200, track: null, active: true, version: 1, category: 'evenement' },
  { id: 9, code: 'streak.weekly', label: 'Série hebdomadaire', description: 'Bonus de 7 jours consécutifs.', xp: 150, dailyCap: 150, track: null, active: true, version: 2, category: 'evenement' },
  { id: 10, code: 'penalty.inactivity', label: 'Malus d’inactivité', description: 'Pénalité pour inactivité prolongée (suspendu : aucune sanction automatique).', xp: -50, dailyCap: 0, track: null, active: false, version: 1, category: 'penalite' },
]

export const submissions: Submission[] = [
  {
    id: 1, questId: 3, questTitle: 'Build a REST API', studentId: 12, studentName: 'Adam Berrada', studentPseudonym: 'A. Berrada',
    stepId: 2, stepTitle: 'Implémentation Laravel', content: 'Dépôt du dépôt Git du projet fil rouge, tests Pest inclus.',
    status: 'en_attente', submittedAt: iso(0, 9), xpAwarded: 0,
  },
  {
    id: 2, questId: 4, questTitle: 'Data Detective', studentId: 21, studentName: 'Sofia Lemtouni', studentPseudonym: 'S. Lemtouni',
    stepId: 3, stepTitle: 'Visualisation & storytelling', content: 'Analyse du jeu de données Mobilités 2025.',
    status: 'en_attente', submittedAt: iso(1, 16), xpAwarded: 0,
  },
  {
    id: 3, questId: 1, questTitle: 'AI Prompt Engineering', studentId: 15, studentName: 'Ghita Amrani', studentPseudonym: 'G. Amrani',
    stepId: 4, stepTitle: 'Livrable : bibliothèque de prompts', content: 'Bibliothèque de 5 prompts documentés.',
    status: 'validee', submittedAt: iso(4, 11), reviewedAt: iso(4, 15), reviewerName: 'Dr. Salma Bennani', xpAwarded: 130,
  },
  {
    id: 4, questId: 11, questTitle: 'Projet fil rouge', studentId: 18, studentName: 'Rachid El Idrissi', studentPseudonym: 'R. El Idrissi',
    stepId: 3, stepTitle: 'Défense devant jury', content: 'Soutenance recorded — 12 min.',
    status: 'en_attente', submittedAt: iso(0, 8), xpAwarded: 0,
  },
]

export const rewardOrders: RewardOrder[] = [
  { id: 1, userId: 12, userName: 'Adam Berrada', rewardId: 5, rewardName: 'T-shirt Code212', quantity: 1, total: 900, status: 'en_attente', createdAt: iso(1, 12) },
  { id: 2, userId: 21, userName: 'Sofia Lemtouni', rewardId: 3, rewardName: 'Session mentor 1h', quantity: 1, total: 1200, status: 'en_attente', createdAt: iso(2, 10) },
  { id: 3, userId: 15, userName: 'Ghita Amrani', rewardId: 1, rewardName: 'Avatar Néon', quantity: 1, total: 350, status: 'approuvee', createdAt: iso(5, 9) },
  { id: 4, userId: 9, userName: 'Omar Benali', rewardId: 6, rewardName: 'Badge Orbital', quantity: 2, total: 500, status: 'livree', createdAt: iso(8, 14) },
]

/* --------------------------------------------------------------- profil actif */

export const currentUser = {
  id: 2,
  firstName: 'Yasmine',
  lastName: 'El Amrani',
  displayName: 'Yasmine El Amrani',
  pseudonym: 'Yasmine',
  email: 'y.elamrani@uca.ac.ma',
  studentCode: 'UCA-2024-GI-1842',
  program: 'Génie informatique',
  cohort: '2024 · Promotion 2',
  roles: ['student'] as const,
  level: 8,
  levelTitle: 'Architecte',
  xp: 4820,
  germs: 640,
  streakDays: 7,
  bestStreak: 12,
  questsCompleted: 9,
  questsInProgress: 3,
  badgesEarned: 8,
  competitionOptIn: true,
  pseudonymized: false,
  weeklyGoalXp: 3000,
  weeklyXp: 2620,
  joinedAt: '2025-09-08T09:00:00.000Z',
}

export const weeklyActivity = [
  { day: 'Lun', xp: 220, label: 'Lundi' },
  { day: 'Mar', xp: 340, label: 'Mardi' },
  { day: 'Mer', xp: 280, label: 'Mercredi' },
  { day: 'Jeu', xp: 460, label: 'Jeudi' },
  { day: 'Ven', xp: 390, label: 'Vendredi' },
  { day: 'Sam', xp: 520, label: 'Samedi' },
  { day: 'Dim', xp: 410, label: 'Dimanche' },
]

export const engagement = [
  { day: '11 nov.', active: 320, completed: 180, label: 'Mar. 11' },
  { day: '12 nov.', active: 410, completed: 240, label: 'Mer. 12' },
  { day: '13 nov.', active: 360, completed: 210, label: 'Jeu. 13' },
  { day: '14 nov.', active: 520, completed: 320, label: 'Ven. 14' },
  { day: '15 nov.', active: 480, completed: 290, label: 'Sam. 15' },
  { day: '16 nov.', active: 610, completed: 390, label: 'Dim. 16' },
  { day: '17 nov.', active: 690, completed: 430, label: 'Lun. 17' },
]

export const trackDistribution = [
  { track: 'codeur' as TrackCode, name: 'Codeur', points: 18420, students: 1240, color: '#6701e6' },
  { track: 'aidant' as TrackCode, name: 'Aidant', points: 9860, students: 862, color: '#c5027f' },
  { track: 'batisseur' as TrackCode, name: 'Bâtisseur', points: 7340, students: 604, color: '#00b8d4' },
  { track: 'explorateur' as TrackCode, name: 'Explorateur', points: 5210, students: 431, color: '#f59e0b' },
]

export const adminOverview: AdminOverview = {
  kpis: {
    students: 2486, studentsDelta: 12.8,
    activeQuests: 18, questsDelta: 3,
    completionRate: 68.7, completionDelta: 4.1,
    xpDistributed: 1240000, xpDelta: 16.3,
    pendingSubmissions: submissions.filter((s) => s.status === 'en_attente').length,
    moderationQueue: 4,
    avgSessionMinutes: 228,
  },
  engagement,
  topQuests: [
    { id: 9, title: 'Git & Collaboration', participants: 143, completionRate: 79, xp: 380 },
    { id: 1, title: 'AI Prompt Engineering', participants: 128, completionRate: 68, xp: 450 },
    { id: 4, title: 'Data Detective', participants: 94, completionRate: 61, xp: 600 },
    { id: 2, title: 'Cybersecurity Sprint', participants: 86, completionRate: 54, xp: 700 },
  ],
  trackDistribution,
  pendingSubmissions: submissions.filter((s) => s.status === 'en_attente'),
  recentOrders: rewardOrders,
  moderationQueue: [
    { id: 1, type: 'discussion', title: 'Conteneur Docker qui sort en OOM', reason: 'Hors sujet / contenu non vérifié', reporter: 'Ilyas Mansouri', createdAt: iso(0, 12) },
    { id: 2, type: 'solution', title: 'Suggestion de contournement non vérifiée', reason: 'Risque sécurité', reporter: 'Modération auto', createdAt: iso(1, 9) },
    { id: 3, type: 'discussion', title: 'Annonce de coursIER payante', reason: 'Publicité / lien externe', reporter: 'Nour Chraibi', createdAt: iso(2, 15) },
    { id: 4, type: 'discussion', title: 'Comparaison de frameworks', reason: 'Discussion hors charte', reporter: 'Sofia Lemtouni', createdAt: iso(3, 11) },
  ],
}
