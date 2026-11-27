/**
 * Code212 Quest — adaptateur « démo » de l'API.
 *
 * Reproduit la forme des réponses Laravel (`/api/v1`) et applique les mêmes
 * invariants métier que le backend : idempotence du ledger, gains XP uniques,
 * achats atomiques, quotas de la Forge, respect du consentement au classement.
 *
 * Le passage à l'API réelle se fait sans toucher aux composants : il suffit de
 * passer `VITE_USE_MOCK=false` et de renseigner `VITE_API_BASE_URL`.
 */
import {
  adminOverview,
  badges as seedBadges,
  certifications,
  challenges as seedChallenges,
  currentUser,
  forgeCategories,
  forgeSolutions as seedSolutions,
  forgeThreads as seedThreads,
  leaderboard as seedLeaderboard,
  levels,
  missions as seedMissions,
  paths as seedPaths,
  quests as seedQuests,
  rewardOrders as seedOrders,
  rewards as seedRewards,
  submissions as seedSubmissions,
  tracks as seedTracks,
  weeklyActivity,
  xpRules as seedRules,
} from './db'
import { fullStackModules } from './fullstack-fixture'
import type {
  AdminOverview,
  Badge,
  Certification,
  Challenge,
  DashboardData,
  ForgeCategory,
  ForgeSolution,
  ForgeThread,
  LeaderboardEntry,
  LearningPath,
  LedgerEntry,
  LevelConfig,
  Mission,
  Quest,
  QuestStep,
  Reward,
  RewardOrder,
  Submission,
  Track,
  UserProfile,
  ForgeAuthorIdentity,
  XpRule,
} from '@/types'

const forgeAuthorProfiles: Record<number, ForgeAuthorIdentity> = {
  3: { pseudonym: 'Équipe CODE212', type: 'Créateur', role: 'admin', communityRoles: ['admin', 'team'], level: 10, levelTitle: 'Directeur de la Forge', levelProgress: 78, xp: 6400, germs: 980, messageCount: 214, badges: [{ id: 'team-1', name: 'Mentor de la Forge' }, { id: 'team-2', name: 'Pilier de la communauté' }] },
  30: { pseudonym: 'A. El Fassi', role: 'admin' },
  9: { pseudonym: 'O. Benali', type: 'Aidant', role: 'moderator', communityRoles: ['mentor', 'moderator'], level: 6, levelTitle: 'Maître Code212', levelProgress: 43, xp: 2640, germs: 410, messageCount: 128, badges: [{ id: 'mentor-1', name: 'Mentor de la Forge' }, { id: 'mentor-2', name: 'Explicateur' }, { id: 'mentor-3', name: 'Main tendue' }] },
  12: { pseudonym: 'A. Berrada', type: 'Codeur', role: 'student', level: 5, levelTitle: 'Codeur confirmé', levelProgress: 64, xp: 1840, germs: 260, messageCount: 36, moderationStatus: 'warned-1', moderationEndsAt: '2026-11-22T18:00:00+01:00', moderationReason: 'Rappel des règles de respect entre membres', badges: [{ id: 'code-1', name: 'Premier commit' }, { id: 'code-2', name: 'Code propre' }] },
  15: { pseudonym: 'G. Amrani', type: 'Aidant', role: 'moderator', communityRoles: ['moderator'], level: 4, levelTitle: 'Explorateur du code', levelProgress: 51, xp: 1320, germs: 180, messageCount: 22, badges: [{ id: 'code-3', name: 'Curieux' }] },
  18: { pseudonym: 'R. El Idrissi', type: 'Codeur', role: 'student', level: 6, starCount: 10, levelTitle: 'Maître Code212', levelProgress: 43, xp: 2640, germs: 410, messageCount: 48, badges: [
    { id: 'code-4', name: 'Optimiseur' }, { id: 'code-5', name: 'Chasseur de bugs' },
    { id: 'code-6', name: 'Premier commit' }, { id: 'code-7', name: 'Code propre' },
    { id: 'code-8', name: 'Champion coding league' }, { id: 'code-9', name: 'Main tendue' },
    { id: 'code-10', name: 'Esprit d’équipe' }, { id: 'code-11', name: 'Explicateur' },
    { id: 'code-12', name: 'Mentor de la Forge' }, { id: 'code-13', name: 'Pilier de la communauté' },
    { id: 'code-14', name: 'Chef de projet' }, { id: 'code-15', name: 'Architecte' },
    { id: 'code-16', name: 'Curieux' }, { id: 'code-17', name: 'Éclaireur' },
    { id: 'code-18', name: 'Sécurité d’abord' }, { id: 'code-19', name: 'Série de 30 jours' },
    { id: 'code-20', name: 'Série de 100 jours' }, { id: 'code-21', name: 'Contributeur open source' },
  ] },
  21: { pseudonym: 'S. Lemtouni', type: 'Explorateur', role: 'student', level: 3, levelTitle: 'Exploratrice', levelProgress: 72, xp: 890, germs: 120, messageCount: 14, moderationStatus: 'banned', moderationEndsAt: '2026-11-25T18:00:00+01:00', moderationReason: 'Comportement contraire aux règles de La Forge', badges: [{ id: 'explore-1', name: 'Éclaireur' }] },
  22: { pseudonym: 'K. Bennani', type: 'Codeur', role: 'student', level: 5, levelTitle: 'Codeur confirmé', levelProgress: 38, xp: 1650, germs: 230, messageCount: 31, moderationStatus: 'warned-1', reportCount: 1, badges: [{ id: 'design-1', name: 'Premier commit' }] },
}

function forgeAuthor(authorId: number, pseudonym: string, role?: ForgeThread['authorRole']): ForgeAuthorIdentity {
  return forgeAuthorProfiles[authorId] ?? { pseudonym, role, type: role === 'student' ? 'Codeur' : undefined }
}

const STORAGE_KEY = 'code212.mock.state'

interface MockState {
  xp: number
  germs: number
  ledger: LedgerEntry[]
  enrolled: number[]
  stepProgress: Record<string, { status: QuestStep['status']; score?: number }>
  claimedMissions: number[]
  joinedChallenges: number[]
  likedThreads: number[]
  likedSolutions: number[]
  purchases: { rewardId: number; quantity: number }[]
  orderStatus: Record<number, RewardOrder['status']>
  submissionStatus: Record<number, Submission['status']>
  ruleOverrides: Record<number, Partial<XpRule>>
  rulesEnabled: Record<number, boolean>
  forgeThreads: ForgeThread[]
  forgeSolutions: ForgeSolution[]
}

const defaultState = (): MockState => ({
  xp: currentUser.xp,
  germs: currentUser.germs,
  ledger: [
    { id: 1, xpDelta: 450, trackType: 'codeur', sourceEvent: 'quest.complete', referenceId: 'quest-1', label: 'Quête « AI Prompt Engineering » validée', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), ruleVersion: 3 },
    { id: 2, xpDelta: 260, trackType: 'codeur', sourceEvent: 'quest.complete', referenceId: 'quest-3', label: 'Quête « Build a REST API » validée', createdAt: new Date(Date.now() - 9 * 86400000).toISOString(), ruleVersion: 3 },
    { id: 3, xpDelta: 40, trackType: 'aidant', sourceEvent: 'forge.answer', referenceId: 'thread-1', label: 'Réponse acceptée dans La Forge', createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), ruleVersion: 4 },
    { id: 4, xpDelta: 180, trackType: null, sourceEvent: 'streak.weekly', referenceId: 'streak-w42', label: 'Bonus de série hebdomadaire', createdAt: new Date(Date.now() - 13 * 86400000).toISOString(), ruleVersion: 2 },
    { id: 5, xpDelta: 600, trackType: 'codeur', sourceEvent: 'quest.complete', referenceId: 'quest-8', label: 'Quête « JavaScript Avancé » validée', createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), ruleVersion: 3 },
  ],
  enrolled: [1, 8, 10],
  stepProgress: {
    '1-1': { status: 'valide', score: 92 },
    '1-2': { status: 'valide', score: 88 },
    '1-3': { status: 'valide', score: 95 },
    '1-4': { status: 'en_cours' },
    '8-1': { status: 'valide', score: 90 },
    '8-2': { status: 'en_cours' },
    '10-1': { status: 'valide', score: 85 },
  },
  claimedMissions: [5],
  joinedChallenges: [1, 5, 7],
  likedThreads: [2],
  likedSolutions: [],
  purchases: [],
  orderStatus: {},
  submissionStatus: {},
  ruleOverrides: {},
  rulesEnabled: {},
  forgeThreads: [],
  forgeSolutions: [],
})

let state: MockState = load()

function load(): MockState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<MockState>) }
  } catch {
    return defaultState()
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota indisponible : la démo continue en mémoire */
  }
}

/** Latence simulée pour rendre l'UI réaliste (squelettes, états de chargement). */
const delay = (ms = 180 + Math.random() * 220) => new Promise((r) => setTimeout(r, ms))

/** Tentatives de QCM du mode mock (mémoire de session, pas de localStorage). */
const exerciseState: Record<number, { passed: boolean; attempts: number }> = {}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function levelFor(xp: number): LevelConfig {
  return [...levels].reverse().find((l) => xp >= l.xpThreshold) ?? levels[0]
}

function nextLevelFor(xp: number): LevelConfig | null {
  return levels.find((l) => l.xpThreshold > xp) ?? null
}

/** Crée une entrée de ledger en respectant la clé d'idempotence serveur. */
function credit(sourceEvent: string, referenceId: string, xpDelta: number, label: string, trackType: LedgerEntry['trackType'] = null) {
  const existing = state.ledger.find((entry) => entry.sourceEvent === sourceEvent && entry.referenceId === referenceId)
  if (existing) return { awarded: false, entry: existing }
  const entry: LedgerEntry = {
    id: Date.now(),
    xpDelta,
    trackType,
    sourceEvent,
    referenceId,
    label,
    createdAt: new Date().toISOString(),
    ruleVersion: 1,
  }
  state.ledger = [entry, ...state.ledger]
  state.xp = Math.max(0, state.xp + xpDelta)
  persist()
  return { awarded: true, entry }
}

function hydrateQuest(quest: Quest): Quest {
  const steps = quest.steps.map((step) => {
    const progress = state.stepProgress[`${quest.id}-${step.id}`]
    return progress ? { ...step, ...progress } : step
  })
  const done = steps.filter((s) => s.status === 'valide').length
  const progress = steps.length ? Math.round((done / steps.length) * 100) : 0
  return { ...quest, steps, enrolled: state.enrolled.includes(quest.id), progress: state.enrolled.includes(quest.id) ? progress : 0 }
}

function profile(): UserProfile {
  const level = levelFor(state.xp)
  const next = nextLevelFor(state.xp)
  const trackPoints = { codeur: 1240, aidant: 860, batisseur: 610, explorateur: 430 } as UserProfile['trackPoints']
  return {
    id: currentUser.id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    displayName: currentUser.displayName,
    pseudonym: currentUser.pseudonym,
    email: currentUser.email,
    studentCode: currentUser.studentCode,
    program: currentUser.program,
    cohort: currentUser.cohort,
    roles: [...currentUser.roles],
    level: level.level,
    levelTitle: level.title,
    xp: state.xp,
    xpToNextLevel: next ? next.xpThreshold - state.xp : 0,
    levelFloor: level.xpThreshold,
    levelCeiling: next?.xpThreshold ?? level.xpThreshold,
    germs: state.germs,
    streakDays: currentUser.streakDays,
    bestStreak: currentUser.bestStreak,
    questsCompleted: 9 + Math.max(0, Math.round((state.xp - currentUser.xp) / 500)),
    questsInProgress: state.enrolled.length,
    badgesEarned: seedBadges.filter((b) => b.earned).length,
    trackPoints,
    dominantTrack: 'codeur',
    competitionOptIn: currentUser.competitionOptIn,
    pseudonymized: currentUser.pseudonymized,
    weeklyGoalXp: currentUser.weeklyGoalXp,
    weeklyXp: currentUser.weeklyXp,
    joinedAt: currentUser.joinedAt,
  }
}

/* ------------------------------------------------------------- apprenant */

export const mockApi = {
  async getMe(): Promise<UserProfile> {
    await delay(120)
    return profile()
  },

  async getDashboard(): Promise<DashboardData> {
    await delay()
    const xp = state.xp
    const level = levelFor(xp)
    const next = nextLevelFor(xp)
    const hydrated = seedQuests.map(hydrateQuest)
    return {
      profile: profile(),
      level,
      nextLevel: next,
      weeklyActivity,
      recentBadges: seedBadges.filter((b) => b.earned).slice(0, 4),
      activeQuests: hydrated.filter((q) => state.enrolled.includes(q.id) && q.progress < 100),
      recommendedQuests: hydrated.filter((q) => !state.enrolled.includes(q.id)).slice(0, 3),
      leaderboardPreview: seedLeaderboard.slice(0, 5),
      trackSnapshot: seedTracks,
      nextMissions: seedMissions.filter((m) => !state.claimedMissions.includes(m.id)),
      streakDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    }
  },

  async getQuests(params?: { track?: string; difficulty?: string; category?: string; search?: string }): Promise<Quest[]> {
    await delay()
    return seedQuests
      .map(hydrateQuest)
      .filter((q) => {
        if (params?.track && params.track !== 'all' && q.track !== params.track) return false
        if (params?.difficulty && params.difficulty !== 'all' && q.difficulty !== params.difficulty) return false
        if (params?.category && params.category !== 'all' && q.category !== params.category) return false
        if (params?.search && !`${q.title} ${q.subtitle} ${q.category}`.toLowerCase().includes(params.search.toLowerCase())) return false
        return true
      })
  },

  async getQuest(id: number): Promise<Quest> {
    await delay()
    const quest = seedQuests.find((q) => q.id === id)
    if (!quest) throw new Error('Quête introuvable')
    return hydrateQuest(quest)
  },

  async enrollQuest(id: number): Promise<Quest> {
    await delay()
    if (!state.enrolled.includes(id)) {
      state.enrolled.push(id)
      persist()
    }
    const quest = seedQuests.find((q) => q.id === id)
    if (!quest) throw new Error('Quête introuvable')
    return hydrateQuest(quest)
  },

  async submitStep(questId: number, stepId: number, content: string): Promise<{ status: Submission['status']; xpAwarded: number }> {
    await delay(320)
    const quest = seedQuests.find((q) => q.id === questId)
    if (!quest) throw new Error('Quête introuvable')
    const step = quest.steps.find((s) => s.id === stepId)
    if (!step) throw new Error('Étape introuvable')
    const key = `${questId}-${stepId}`
    if (state.stepProgress[key]?.status === 'valide') {
      // Idempotence : une étape déjà validée ne redonne pas d'XP.
      return { status: 'en_attente', xpAwarded: 0 }
    }
    state.stepProgress[key] = { status: 'en_cours' }
    void content
    const result = credit('quest.step', key, Math.round(step.xp * 0.4), `Étape « ${step.title} » déposée`, quest.track)
    return { status: 'en_attente', xpAwarded: result.awarded ? Math.round(step.xp * 0.4) : 0 }
  },

  async getLedger(): Promise<LedgerEntry[]> {
    await delay()
    return state.ledger
  },

  async getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
    await delay()
    const factor = period === 'semaine' ? 0.12 : period === 'semestre' ? 0.7 : period === 'all_time' ? 1.4 : 0.35
    return seedLeaderboard.map((entry) => ({
      ...entry,
      xp: Math.round(entry.xp * factor),
      weeklyXp: Math.round(entry.weeklyXp * (period === 'semaine' ? 1 : 0.3)),
      isCurrentUser: entry.isCurrentUser,
    }))
  },

  async getBadges(): Promise<Badge[]> {
    await delay()
    return seedBadges
  },

  async getTracks(): Promise<Track[]> {
    await delay()
    return seedTracks
  },

  async getLevels(): Promise<LevelConfig[]> {
    await delay()
    return levels
  },

  async getPaths(): Promise<LearningPath[]> {
    await delay()
    return seedPaths
  },

  async getPath(id: number): Promise<LearningPath> {
    await delay()
    const p = seedPaths.find((path) => path.id === id) ?? seedPaths[0]
    return { ...p }
  },

  async enrollPath(id: number): Promise<{ inscription_id: number; parcours_id: number }> {
    await delay(200)
    return { inscription_id: 1, parcours_id: id }
  },

  async getModuleDetail(pathId: number, stepId: number): Promise<import('@/types').ModuleDetail> {
    await delay()
    const module = fullStackModules.find((m) => m.id === stepId) ?? fullStackModules[0]
    const exercises = module.lessons.flatMap((l) => l.exercises)
    const passed = exercises.filter((e) => exerciseState[e.id]?.passed).length
    const summary = seedPaths.find((p) => p.id === pathId)?.modules?.find((m) => m.id === module.id)

    return {
      id: module.id,
      pathId,
      title: module.title,
      description: module.description,
      order: module.order,
      status: summary?.status ?? (module.order === 1 ? 'en_cours' : 'verrouille'),
      exercisesTotal: exercises.length,
      exercisesPassed: passed,
      exercisesCompleted: passed === exercises.length,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        keyPoints: lesson.keyPoints,
        content: lesson.content,
        exampleCode: lesson.exampleCode,
        exampleExplanation: lesson.exampleExplanation,
        order: lesson.order,
        durationMinutes: lesson.durationMinutes,
        exercises: lesson.exercises.map((exercise) => {
          // Même tirage que l'API : une question du pool, options mélangées.
          const question = exercise.pool[Math.floor(Math.random() * exercise.pool.length)]
          return {
            id: exercise.id,
            title: exercise.title,
            instructions: question.question,
            validationType: 'qcm',
            options: shuffled(question.options),
            questionId: question.id,
            poolSize: exercise.pool.length,
            order: exercise.order,
            passed: Boolean(exerciseState[exercise.id]?.passed),
            attempts: exerciseState[exercise.id]?.attempts ?? 0,
          }
        }),
      })),
      finalQuest: { ...module.finalQuest, unlocked: true },
    }
  },

  async submitExercise(exerciseId: number, answer: string, questionId?: string): Promise<{ reussi: boolean; message: string; tentative: number }> {
    await delay(300)
    const exercise = fullStackModules.flatMap((m) => m.lessons.flatMap((l) => l.exercises)).find((e) => e.id === exerciseId)
    const question = exercise?.pool.find((q) => q.id === questionId)
    if (!exercise || !question) throw new Error('Question inconnue pour ce QCM. Rechargez le chapitre.')

    const entry = (exerciseState[exerciseId] ??= { passed: false, attempts: 0 })
    entry.attempts += 1
    const passed = answer.trim().toLowerCase() === question.correct
    entry.passed ||= passed

    return {
      reussi: passed,
      message: passed
        ? `Bonne réponse ! ${question.explanation}`
        : 'Ce n’est pas la bonne réponse. Relisez les points clés et réessayez !',
      tentative: entry.attempts,
    }
  },

  async getMissions(): Promise<Mission[]> {
    await delay()
    return seedMissions.map((m) => ({ ...m, claimed: state.claimedMissions.includes(m.id) }))
  },

  async claimMission(id: number): Promise<Mission> {
    await delay(260)
    const mission = seedMissions.find((m) => m.id === id)
    if (!mission) throw new Error('Mission introuvable')
    if (state.claimedMissions.includes(id)) return { ...mission, claimed: true }
    state.claimedMissions.push(id)
    credit('mission.complete', `mission-${id}`, mission.xpReward, `Mission « ${mission.title} » réclamée`)
    state.germs += mission.germsReward
    persist()
    return { ...mission, claimed: true }
  },

  async getChallenges(): Promise<Challenge[]> {
    await delay()
    return seedChallenges.map((c) => ({ ...c, joined: state.joinedChallenges.includes(c.id) }))
  },

  async joinChallenge(id: number): Promise<Challenge> {
    await delay(240)
    if (!state.joinedChallenges.includes(id)) {
      state.joinedChallenges.push(id)
      persist()
    }
    const challenge = seedChallenges.find((c) => c.id === id)
    if (!challenge) throw new Error('Challenge introuvable')
    return { ...challenge, joined: true }
  },

  async getRewards(): Promise<Reward[]> {
    await delay()
    return seedRewards.map((r) => ({
      ...r,
      owned: state.purchases.filter((p) => p.rewardId === r.id).reduce((sum, p) => sum + p.quantity, 0),
    }))
  },

  async purchaseReward(id: number): Promise<{ order: RewardOrder; balance: number }> {
    await delay(340)
    const reward = seedRewards.find((r) => r.id === id)
    if (!reward) throw new Error('Récompense introuvable')
    if (reward.stock <= 0) throw new Error('Stock épuisé')
    if (state.germs < reward.cost) throw new Error('Solde insuffisant')
    // Transaction atomique simulée : stock + solde + commande.
    reward.stock -= 1
    state.germs -= reward.cost
    const order: RewardOrder = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.displayName,
      rewardId: reward.id,
      rewardName: reward.name,
      quantity: 1,
      total: reward.cost,
      status: 'en_attente',
      createdAt: new Date().toISOString(),
    }
    state.purchases.push({ rewardId: reward.id, quantity: 1 })
    persist()
    return { order, balance: state.germs }
  },

  async getCertifications(): Promise<Certification[]> {
    await delay()
    return certifications
  },

  /* -------------------------------------------------------------- La Forge */

  async getForgeCategories(): Promise<ForgeCategory[]> {
    await delay()
    return forgeCategories
  },

  async getForgeThreads(category?: string): Promise<ForgeThread[]> {
    await delay()
    return [...seedThreads, ...state.forgeThreads]
      .filter((t) => !category || category === 'all' || t.category === category)
      .map((t) => ({
        ...t,
        replies: t.replies + state.forgeSolutions.filter((solution) => solution.threadId === t.id).length,
        author: forgeAuthor(t.authorId, t.authorPseudonym, t.authorRole),
        liked: state.likedThreads.includes(t.id),
        likes: t.likes + (state.likedThreads.includes(t.id) ? 1 : 0),
      }))
  },

  async getForgeThread(id: number): Promise<{ thread: ForgeThread; solutions: ForgeSolution[] }> {
    await delay()
    const thread = [...seedThreads, ...state.forgeThreads].find((t) => t.id === id)
    if (!thread) throw new Error('Discussion introuvable')
    const solutions = [...seedSolutions, ...state.forgeSolutions].filter((solution) => solution.threadId === id)
    return {
      thread: {
        ...thread,
        replies: thread.replies + state.forgeSolutions.filter((solution) => solution.threadId === id).length,
        author: forgeAuthor(thread.authorId, thread.authorPseudonym, thread.authorRole),
        liked: state.likedThreads.includes(thread.id),
      },
      solutions: solutions
        .map((s) => ({ ...s, author: forgeAuthor(s.authorId, s.authorPseudonym, s.authorRole), likes: s.likes + (state.likedSolutions.includes(s.id) ? 1 : 0) })),
    }
  },

  async createThread(payload: { category: string; title: string; body: string; tags: string[] }): Promise<ForgeThread> {
    await delay(300)
    const thread: ForgeThread = {
      id: Date.now(),
      category: payload.category as ForgeThread['category'],
      title: payload.title,
      body: payload.body,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorPseudonym: currentUser.pseudonym,
      authorRole: 'student',
      author: forgeAuthor(currentUser.id, currentUser.pseudonym, 'student'),
      createdAt: new Date().toISOString(),
      replies: 0,
      views: 1,
      likes: 0,
      liked: false,
      solved: false,
      tags: payload.tags,
      solutionIds: [],
    }
    state.forgeThreads.unshift(thread)
    persist()
    credit('forge.question', `thread-${thread.id}`, 20, 'Question publiée dans La Forge', 'aidant')
    return thread
  },

  async replyToThread(threadId: number, body: string): Promise<ForgeSolution> {
    await delay(280)
    const thread = [...seedThreads, ...state.forgeThreads].find((item) => item.id === threadId)
    if (!thread) throw new Error('Discussion introuvable')
    if (thread.closed) throw new Error('Cette discussion est clôturée.')
    const solution: ForgeSolution = {
      id: Date.now(),
      threadId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorPseudonym: currentUser.pseudonym,
      body,
      accepted: false,
      createdAt: new Date().toISOString(),
      likes: 0,
      mine: true,
      author: forgeAuthor(currentUser.id, currentUser.pseudonym, 'student'),
    }
    state.forgeSolutions.push(solution)
    persist()
    return solution
  },

  async acceptSolution(threadId: number, solutionId: number): Promise<ForgeSolution> {
    await delay(260)
    const solution = seedSolutions.find((s) => s.id === solutionId)
    if (!solution) throw new Error('Solution introuvable')
    if (solution.authorId === currentUser.id) throw new Error('Auto-validation interdite')
    const result = credit('forge.answer.accepted', `thread-${threadId}-solution-${solutionId}`, 120, 'Solution acceptée dans La Forge', 'aidant')
    return { ...solution, accepted: true, acceptedAt: new Date().toISOString(), mine: false, likes: solution.likes + (result.awarded ? 1 : 0) }
  },

  async toggleLikeThread(id: number): Promise<{ likes: number; liked: boolean }> {
    await delay(120)
    const thread = seedThreads.find((t) => t.id === id)
    if (!thread) throw new Error('Discussion introuvable')
    const index = state.likedThreads.indexOf(id)
    if (index >= 0) {
      state.likedThreads.splice(index, 1)
      state.ledger = state.ledger.filter((e) => !(e.sourceEvent === 'forge.like' && e.referenceId === `thread-${id}`))
    } else {
      state.likedThreads.push(id)
      credit('forge.like', `thread-${id}`, 5, 'Vote positif donné dans La Forge', 'aidant')
    }
    persist()
    return { likes: thread.likes + (index >= 0 ? 0 : 1), liked: index < 0 }
  },

  async reportThread(threadId: number, reason: string): Promise<void> {
    await delay(200)
    void threadId
    void reason
  },

  /* ------------------------------------------------------------------ admin */

  async getAdminOverview(): Promise<AdminOverview> {
    await delay()
    return {
      ...adminOverview,
      pendingSubmissions: seedSubmissions
        .filter((s) => (state.submissionStatus[s.id] ?? s.status) === 'en_attente'),
      recentOrders: seedOrders.map((o) => ({ ...o, status: state.orderStatus[o.id] ?? o.status })),
    }
  },

  async getAdminSubmissions(): Promise<Submission[]> {
    await delay()
    return seedSubmissions.map((s) => ({ ...s, status: state.submissionStatus[s.id] ?? s.status }))
  },

  async reviewSubmission(id: number, decision: 'validee' | 'rejetee', feedback: string): Promise<Submission> {
    await delay(300)
    const submission = seedSubmissions.find((s) => s.id === id)
    if (!submission) throw new Error('Soumission introuvable')
    state.submissionStatus[id] = decision
    persist()
    if (decision === 'validee') {
      const quest = seedQuests.find((q) => q.id === submission.questId)
      const step = quest?.steps.find((s) => s.id === submission.stepId)
      if (quest && step) {
        state.stepProgress[`${quest.id}-${step.id}`] = { status: 'valide', score: 100 }
        credit('quest.step', `${quest.id}-${step.id}`, step.xp, `Étape « ${step.title} » validée`, quest.track)
      }
    }
    return { ...submission, status: decision, feedback, reviewedAt: new Date().toISOString(), reviewerName: 'Walid Bouarifi' }
  },

  async getAdminRules(): Promise<XpRule[]> {
    await delay()
    return seedRules.map((rule) => ({
      ...rule,
      ...(state.ruleOverrides[rule.id] ?? {}),
      active: state.rulesEnabled[rule.id] ?? rule.active,
    }))
  },

  async updateRule(id: number, patch: Partial<XpRule>): Promise<XpRule> {
    await delay(220)
    const rule = seedRules.find((r) => r.id === id)
    if (!rule) throw new Error('Règle introuvable')
    state.ruleOverrides[id] = { ...(state.ruleOverrides[id] ?? {}), ...patch }
    if (typeof patch.active === 'boolean') state.rulesEnabled[id] = patch.active
    persist()
    return { ...rule, ...patch, version: rule.version + 1 }
  },

  async getAdminOrders(): Promise<RewardOrder[]> {
    await delay()
    return seedOrders.map((o) => ({ ...o, status: state.orderStatus[o.id] ?? o.status }))
  },

  async updateOrder(id: number, status: RewardOrder['status']): Promise<RewardOrder> {
    await delay(220)
    const order = seedOrders.find((o) => o.id === id)
    if (!order) throw new Error('Commande introuvable')
    state.orderStatus[id] = status
    persist()
    return { ...order, status }
  },

  async getAdminStudents(): Promise<Array<{ id: number; name: string; pseudonym: string; email: string; program: string; xp: number; level: number; quests: number; status: string; joinedAt: string }>> {
    await delay()
    return seedLeaderboard.map((entry, i) => ({
      id: entry.userId + i,
      name: entry.displayName,
      pseudonym: entry.pseudonym,
      email: `${entry.pseudonym.toLowerCase().replace(/[^a-z]/g, '.')}@uca.ac.ma`,
      program: entry.program,
      xp: entry.xp,
      level: entry.level,
      quests: entry.questsCompleted,
      status: i === 3 ? 'En attente' : i === 6 ? 'Inactif' : 'Actif',
      joinedAt: new Date(Date.now() - (60 + i * 17) * 86400000).toISOString(),
    }))
  },

  async updateProfile(patch: Partial<Pick<UserProfile, 'pseudonym' | 'competitionOptIn' | 'weeklyGoalXp' | 'email'>>): Promise<UserProfile> {
    await delay(200)
    Object.assign(currentUser, patch)
    persist()
    return profile()
  },

  async reset(): Promise<void> {
    state = defaultState()
    persist()
  },
}

export type MockApi = typeof mockApi
