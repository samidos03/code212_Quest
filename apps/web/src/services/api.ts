/**
 * Client HTTP vers l'API Laravel `/api/v1`.
 *
 * En mode démo (`VITE_USE_MOCK=true`, défaut) les appels sont servis par
 * `services/mock/server.ts` avec la même signature de payload.
 */
import { mockApi } from './mock/server'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api/v1'

/** `true` tant que le backend Laravel n'est pas branché. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = !USE_MOCK ? window.sessionStorage.getItem('code212.api_token') : null
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new ApiError(
      payload?.message ?? `Erreur ${response.status} — ${response.statusText}`,
      response.status,
      payload?.errors,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/* Adaptation du contrat Laravel Forge vers les types du frontend. */
type ForgeRaw = Record<string, any>
const forgeSlugs = ['entraide', 'projets', 'coding-league', 'annonces', 'cafe'] as const
const categoryCode = (v: unknown) => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
function forgeData<T>(payload: { data: T } | T): T {
  return payload && typeof payload === 'object' && 'data' in payload ? (payload as { data: T }).data : payload as T
}
function forgeCategory(raw: ForgeRaw): import('@/types').ForgeCategory {
  const code = categoryCode(raw.code ?? raw.nom)
  const slug = forgeSlugs.find(s => s === code) ?? (code === 'cafe-de-la-forge' ? 'cafe' : 'entraide')
  return { slug, name: String(raw.nom ?? slug), description: String(raw.description ?? ''), icon: '💬', threads: Number(raw.threads ?? 0), requiresApproval: false, moderatedBy: null }
}
function forgeThread(raw: ForgeRaw, cats: ForgeRaw[] = []): import('@/types').ForgeThread {
  const cat = cats.find(c => Number(c.id) === Number(raw.categorie_id))
  const slug = forgeCategory(cat ?? { code: raw.categorie ?? 'entraide' }).slug
  const author = raw.auteur ?? {}
  const pseudonym = String(author.pseudonyme ?? 'Membre CODE212')
  return {
    id: Number(raw.id), category: slug, title: String(raw.titre ?? ''), body: String(raw.contenu ?? ''),
    authorId: Number(author.id ?? 0), authorName: pseudonym, authorPseudonym: pseudonym,
    authorRole: 'student', createdAt: String(raw.cree_le ?? new Date().toISOString()),
    replies: Number(raw.nb_solutions ?? 0), views: Number(raw.vue ?? 0), likes: 0, liked: false,
    solved: raw.statut === 'resolue', tags: Array.isArray(raw.tags) ? raw.tags : [],
    solutionIds: [], closed: raw.statut === 'verrouillee' || raw.statut === 'masquee', pinned: Boolean(raw.epingle),
    author: { pseudonym },
  }
}
function forgeSolution(raw: ForgeRaw): import('@/types').ForgeSolution {
  const author = raw.auteur ?? {}
  const pseudonym = String(author.pseudonyme ?? 'Membre CODE212')
  return {
    id: Number(raw.id), threadId: Number(raw.fil_id), authorId: Number(author.id ?? 0),
    authorName: pseudonym, authorPseudonym: pseudonym,
    body: raw.code ? `${String(raw.contenu ?? '')}\n\n${String(raw.code)}` : String(raw.contenu ?? ''),
    accepted: Boolean(raw.acceptee), acceptedAt: raw.acceptee_le ?? undefined,
    createdAt: String(raw.cree_le ?? new Date().toISOString()), likes: Number(raw.votes ?? 0),
    mine: false, author: { pseudonym },
  }
}
async function forgeRawCategories(): Promise<ForgeRaw[]> {
  return forgeData(await http.get<{ data: ForgeRaw[] }>('/forge/categories'))
}

/* ------------------------------------------- adaptateurs domaine (Laravel -> Web) */

function extractData<T>(payload: { data: T } | T): T {
  return payload && typeof payload === 'object' && 'data' in payload ? (payload as { data: T }).data : (payload as T)
}

function adaptPath(raw: Record<string, any>): import('@/types').LearningPath {
  const track = (raw.voie ?? raw.track_code ?? raw.track ?? 'codeur') as import('@/types').TrackCode
  const gradientMap: Record<string, string> = {
    codeur: 'violet',
    aidant: 'magenta',
    batisseur: 'cyan',
    explorateur: 'orange',
  }
  const iconMap: Record<string, string> = {
    codeur: '</>',
    aidant: '★',
    batisseur: '◈',
    explorateur: '⌘',
  }
  const modules = Array.isArray(raw.modules)
    ? raw.modules.map((m: any) => ({
        id: Number(m.id),
        title: String(m.titre ?? m.title ?? ''),
        description: m.description ? String(m.description) : undefined,
        order: Number(m.ordre ?? m.order ?? 1),
        status: (m.statut ?? m.status ?? 'non_inscrit') as import('@/types').ModuleStatus,
        exercisesTotal: Number(m.exercices_total ?? 0),
        exercisesPassed: Number(m.exercices_passes ?? 0),
        questId: m.quete_id ? Number(m.quete_id) : undefined,
      }))
    : undefined

  return {
    id: Number(raw.id),
    slug: String(raw.code ?? raw.slug ?? `path-${raw.id}`).toLowerCase(),
    title: String(raw.titre ?? raw.title ?? ''),
    description: String(raw.description ?? ''),
    track,
    level: (raw.difficulte ?? raw.level ?? 'debutant') as import('@/types').QuestDifficulty,
    quests: Array.isArray(raw.etapes) ? raw.etapes.map((s: any) => Number(String(s.ref_id ?? '').replace(/\D/g, '') || s.id || 1)) : [1],
    progress: Number(raw.progression ?? raw.progress ?? 0),
    xpReward: Number(raw.bonus_xp ?? raw.xp_bonus ?? raw.xpReward ?? 500),
    estimatedHours: Number(raw.estimatedHours ?? 10),
    enrolled: Boolean(raw.inscrit ?? raw.enrolled),
    icon: iconMap[track] ?? '</>',
    gradient: gradientMap[track] ?? 'violet',
    skills: Array.isArray(raw.skills) ? raw.skills : ['HTML/CSS', 'JavaScript', 'PHP', 'SQL', 'Laravel'],
    modules,
  }
}

function adaptModuleDetail(raw: Record<string, any>): import('@/types').ModuleDetail {
  const lessons = Array.isArray(raw.lecons)
    ? raw.lecons.map((l: any) => ({
        id: Number(l.id),
        title: String(l.titre ?? ''),
        summary: l.resume ? String(l.resume) : undefined,
        keyPoints: Array.isArray(l.points_cles) ? l.points_cles.map(String) : [],
        content: String(l.contenu ?? ''),
        exampleCode: l.exemple_code ? String(l.exemple_code) : undefined,
        exampleExplanation: l.exemple_explication ? String(l.exemple_explication) : undefined,
        order: Number(l.ordre ?? 1),
        durationMinutes: Number(l.duree_minutes ?? 15),
        exercises: Array.isArray(l.exercices)
          ? l.exercices.map((ex: any) => ({
              id: Number(ex.id),
              title: String(ex.titre ?? ''),
              instructions: String(ex.instructions ?? ''),
              starterCode: ex.code_depart ? String(ex.code_depart) : undefined,
              validationType: String(ex.type_validation ?? 'keywords'),
              options: Array.isArray(ex.options)
                ? ex.options.map((opt: any) => ({
                    id: String(opt.id),
                    label: String(opt.label),
                  }))
                : undefined,
              questionId: ex.question_id ? String(ex.question_id) : undefined,
              poolSize: Number(ex.taille_pool ?? 1),
              order: Number(ex.ordre ?? 1),
              passed: Boolean(ex.reussi),
              attempts: Number(ex.tentatives ?? 0),
            }))
          : [],
      }))
    : []

  const q = raw.quete_finale
  const finalQuest = q
    ? {
        id: Number(q.id),
        code: String(q.code ?? ''),
        title: String(q.titre ?? ''),
        description: String(q.description ?? ''),
        stepId: q.etape_id ? Number(q.etape_id) : undefined,
        xp: Number(q.xp ?? 0),
        germs: Number(q.germes ?? 0),
        unlocked: Boolean(q.debloquee),
        submission: q.soumission
          ? {
              id: Number(q.soumission.id),
              status: q.soumission.statut,
              attempt: Number(q.soumission.tentative ?? 1),
              trainerFeedback: q.soumission.commentaire_formateur ? String(q.soumission.commentaire_formateur) : undefined,
              submittedAt: q.soumission.date_soumission ? String(q.soumission.date_soumission) : undefined,
            }
          : undefined,
      }
    : undefined

  return {
    id: Number(raw.id),
    pathId: Number(raw.parcours_id ?? 1),
    title: String(raw.titre ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    order: Number(raw.ordre ?? 1),
    status: (raw.statut ?? 'non_inscrit') as import('@/types').ModuleStatus,
    exercisesTotal: Number(raw.exercices_total ?? 0),
    exercisesPassed: Number(raw.exercices_passes ?? 0),
    exercisesCompleted: Boolean(raw.exercices_termines),
    lessons,
    finalQuest,
  }
}

function adaptQuest(raw: Record<string, any>): import('@/types').Quest {
  const steps = Array.isArray(raw.etapes) ? raw.etapes.map((s: any, idx: number) => ({
    id: Number(s.id ?? idx + 1),
    order: Number(s.ordre ?? s.order_index ?? idx + 1),
    title: String(s.titre ?? s.title ?? `Étape ${idx + 1}`),
    description: String(s.description ?? ''),
    kind: (s.type === 'atelier' ? 'code' : s.type === 'preuve' ? 'livrable' : s.type === 'qcm' ? 'quiz' : s.kind ?? 'lecture') as any,
    xp: Number(s.xp ?? s.xp_reward ?? 50),
    durationMinutes: Number(s.duree_minutes ?? s.duration_minutes ?? 20),
    status: (s.statut ?? s.status ?? 'disponible') as any,
    score: s.score !== undefined ? Number(s.score) : undefined,
    feedback: s.feedback ? String(s.feedback) : undefined,
  })) : []

  return {
    id: Number(raw.id),
    slug: String(raw.code ?? raw.slug ?? `quest-${raw.id}`).toLowerCase(),
    title: String(raw.titre ?? raw.title ?? ''),
    subtitle: String(raw.description ?? ''),
    description: String(raw.description ?? ''),
    category: String(raw.categorie ?? raw.category ?? 'Développement'),
    track: (raw.voie ?? raw.track_code ?? raw.track ?? 'codeur') as import('@/types').TrackCode,
    difficulty: (raw.difficulte ?? raw.difficulty ?? 'debutant') as import('@/types').QuestDifficulty,
    status: (raw.statut === 'publie' ? 'publiee' : raw.status ?? 'publiee') as any,
    xpReward: Number(raw.xp ?? raw.xp_reward ?? raw.xpReward ?? 300),
    trackPoints: Number(raw.germes ?? raw.germes_reward ?? raw.trackPoints ?? 60),
    germsReward: Number(raw.germes ?? raw.germes_reward ?? raw.germsReward ?? 60),
    durationMinutes: Number(raw.duree_minutes ?? raw.estimated_minutes ?? raw.durationMinutes ?? 60),
    participants: Number(raw.nb_inscriptions ?? raw.participants ?? 1),
    completionRate: Number(raw.completionRate ?? 85),
    prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites : [],
    badges: Array.isArray(raw.badges) ? raw.badges : [],
    authorName: String(raw.authorName ?? 'Formateur référent CODE212'),
    createdAt: String(raw.created_at ?? new Date().toISOString()),
    coverGradient: 'violet',
    icon: '</>',
    enrolled: Boolean(raw.enrolled ?? true),
    progress: Number(raw.progression ?? raw.progress ?? 0),
    steps,
    objectives: Array.isArray(raw.objectives) ? raw.objectives : ['Comprendre les fondamentaux', 'Appliquer par la pratique', 'Valider le livrable'],
  }
}

function adaptSubmission(raw: Record<string, any>): import('@/types').Submission {
  const user = raw.apprenant ?? raw.user ?? {}
  const statusMap: Record<string, any> = {
    'en_attente': 'en_attente',
    'approuvee': 'validee',
    'validee': 'validee',
    'rejetee': 'rejetee',
    'a_revoir': 'a_revoir',
  }
  return {
    id: Number(raw.id),
    questId: Number(raw.quest_id ?? raw.questId ?? 1),
    questTitle: String(raw.titre ?? raw.questTitle ?? 'Quête CODE212'),
    studentId: Number(user.id ?? raw.studentId ?? 1),
    studentName: String(user.pseudonyme ?? user.name ?? raw.studentName ?? 'Apprenant'),
    studentPseudonym: String(user.pseudonyme ?? raw.studentPseudonym ?? 'Apprenant'),
    stepId: Number(raw.quest_step_id ?? raw.stepId ?? 1),
    stepTitle: String(raw.titre ?? raw.stepTitle ?? 'Étape'),
    content: String(raw.contenu ?? raw.body ?? raw.content ?? raw.lien ?? ''),
    status: (statusMap[raw.statut ?? raw.status] ?? 'en_attente') as any,
    submittedAt: String(raw.envoye_le ?? raw.submittedAt ?? raw.created_at ?? new Date().toISOString()),
    reviewedAt: raw.corrige_le ?? raw.reviewedAt ?? undefined,
    reviewerName: raw.correcteur?.nom ?? raw.reviewerName ?? undefined,
    xpAwarded: Number(raw.xp ?? raw.xp_reward ?? raw.xpAwarded ?? 0),
    feedback: raw.feedback ?? raw.note ?? raw.review_note ?? undefined,
    attempt: raw.tentative != null ? Number(raw.tentative) : undefined,
  }
}

/* ------------------------------------------------------------------ facade */

/**
 * Point d'entrée unique pour l'application. Les composants n'appellent jamais
 * `http` ni `mockApi` directement : ils utilisent `api.*`.
 */
export const api = {
  // apprenant
  me: () => (USE_MOCK ? mockApi.getMe() : http.get<import('@/types').UserProfile>('/me')),
  dashboard: () => (USE_MOCK ? mockApi.getDashboard() : http.get<import('@/types').DashboardData>('/dashboard')),
  updateProfile: (patch: Parameters<typeof mockApi.updateProfile>[0]) =>
    USE_MOCK ? mockApi.updateProfile(patch) : http.patch<import('@/types').UserProfile>('/me', patch),

  // quêtes
  quests: async (params?: Record<string, string | undefined>) => {
    if (USE_MOCK) return mockApi.getQuests(params)
    const payload = await http.get<{ data: Record<string, any>[] } | Record<string, any>[]>(`/quests${qs(params)}`)
    return extractData(payload).map(adaptQuest)
  },
  quest: async (id: number) => {
    if (USE_MOCK) return mockApi.getQuest(id)
    const payload = await http.get<{ data: Record<string, any> } | Record<string, any>>(`/quests/${id}`)
    return adaptQuest(extractData(payload))
  },
  enrollQuest: (id: number) => (USE_MOCK ? mockApi.enrollQuest(id) : http.post<import('@/types').Quest>(`/quests/${id}/enroll`)),
  submitStep: (questId: number, stepId: number, content: string, notes?: string) =>
    USE_MOCK
      ? mockApi.submitStep(questId, stepId, content)
      : http.post<{ status: string; xpAwarded: number }>(
          `/quests/${questId}/steps/${stepId}/submit`,
          notes ? { content, commentaire: notes } : { content },
        ),

  // progression
  ledger: () => (USE_MOCK ? mockApi.getLedger() : http.get<import('@/types').LedgerEntry[]>('/ledger')),
  leaderboard: (period: string) =>
    USE_MOCK ? mockApi.getLeaderboard(period) : http.get<import('@/types').LeaderboardEntry[]>(`/leaderboards?period=${period}`),
  levels: () => (USE_MOCK ? mockApi.getLevels() : http.get<import('@/types').LevelConfig[]>('/levels')),
  tracks: () => (USE_MOCK ? mockApi.getTracks() : http.get<import('@/types').Track[]>('/tracks')),
  badges: () => (USE_MOCK ? mockApi.getBadges() : http.get<import('@/types').Badge[]>('/badges')),
  paths: async () => {
    if (USE_MOCK) return mockApi.getPaths()
    const payload = await http.get<{ data: Record<string, any>[] } | Record<string, any>[]>('/paths')
    return extractData(payload).map(adaptPath)
  },
  path: async (id: number) => {
    if (USE_MOCK) return mockApi.getPath(id)
    const payload = await http.get<{ data: Record<string, any> } | Record<string, any>>(`/paths/${id}`)
    return adaptPath(extractData(payload))
  },
  enrollPath: (id: number) =>
    USE_MOCK
      ? mockApi.enrollPath(id)
      : http.post<{ inscription_id: number; parcours_id: number }>(`/paths/${id}/enroll`),
  moduleDetail: async (pathId: number, stepId: number) => {
    if (USE_MOCK) return mockApi.getModuleDetail(pathId, stepId)
    const payload = await http.get<{ data: Record<string, any> } | Record<string, any>>(`/paths/${pathId}/modules/${stepId}`)
    return adaptModuleDetail(extractData(payload))
  },
  submitExercise: async (exerciseId: number, reponse: string, questionId?: string) => {
    if (USE_MOCK) return mockApi.submitExercise(exerciseId, reponse, questionId)
    const payload = await http.post<{ data: { reussi: boolean; message: string; tentative: number } } | { reussi: boolean; message: string; tentative: number }>(
      `/exercises/${exerciseId}/attempt`,
      questionId ? { reponse, question_id: questionId } : { reponse },
    )
    return extractData(payload)
  },
  missions: () => (USE_MOCK ? mockApi.getMissions() : http.get<import('@/types').Mission[]>('/missions')),
  claimMission: (id: number) => (USE_MOCK ? mockApi.claimMission(id) : http.post<import('@/types').Mission>(`/missions/${id}/claim`)),
  certifications: () => (USE_MOCK ? mockApi.getCertifications() : http.get<import('@/types').Certification[]>('/certifications')),

  // compétitions
  challenges: () => (USE_MOCK ? mockApi.getChallenges() : http.get<import('@/types').Challenge[]>('/challenges')),
  joinChallenge: (id: number) => (USE_MOCK ? mockApi.joinChallenge(id) : http.post<import('@/types').Challenge>(`/challenges/${id}/join`)),

  // boutique
  rewards: () => (USE_MOCK ? mockApi.getRewards() : http.get<import('@/types').Reward[]>('/rewards')),
  purchaseReward: (id: number) =>
    USE_MOCK ? mockApi.purchaseReward(id) : http.post<{ order: import('@/types').RewardOrder; balance: number }>(`/rewards/${id}/purchase`),

  // La Forge — conversion explicite du contrat Laravel (/api/v1).
  forgeCategories: async () => USE_MOCK ? mockApi.getForgeCategories() : (await forgeRawCategories()).map(forgeCategory),
  forgeThreads: async (category?: string) => {
    if (USE_MOCK) return mockApi.getForgeThreads(category)
    const cats = await forgeRawCategories()
    const match = cats.find(c => forgeCategory(c).slug === category)
    if (category && !match) return []
    const query = match ? `?categorie_id=${encodeURIComponent(String(match.id))}` : ''
    const payload = await http.get<{ data: ForgeRaw[] }>(`/forge/threads${query}`)
    return forgeData(payload).map(t => forgeThread(t, cats))
  },
  forgeThread: async (id: number) => {
    if (USE_MOCK) return mockApi.getForgeThread(id)
    const [payload, cats] = await Promise.all([
      http.get<{ data: ForgeRaw }>(`/forge/threads/${id}`), forgeRawCategories(),
    ])
    const raw = forgeData(payload)
    return { thread: forgeThread(raw, cats), solutions: Array.isArray(raw.solutions) ? raw.solutions.map(forgeSolution) : [] }
  },
  createThread: async (payload: { category: string; title: string; body: string; tags: string[] }) => {
    if (USE_MOCK) return mockApi.createThread(payload)
    const cats = await forgeRawCategories()
    const match = cats.find(c => forgeCategory(c).slug === payload.category)
    if (!match) throw new ApiError('Rubrique introuvable dans Laravel.', 422)
    const result = await http.post<{ data: ForgeRaw }>('/forge/threads', {
      categorie_id: Number(match.id), titre: payload.title, contenu: payload.body, tags: payload.tags,
    })
    return forgeThread(forgeData(result), cats)
  },
  replyToThread: async (threadId: number, body: string) => {
    if (USE_MOCK) return mockApi.replyToThread(threadId, body)
    const result = await http.post<{ data: ForgeRaw }>(`/forge/threads/${threadId}/replies`, { contenu: body })
    return forgeSolution(forgeData(result))
  },
  acceptSolution: (threadId: number, solutionId: number) =>
    USE_MOCK ? mockApi.acceptSolution(threadId, solutionId) : http.post<import('@/types').ForgeSolution>(`/forge/solutions/${solutionId}/accept`),
  // Vote de la Forge reporté tant que le seuil de niveau n'est pas tranché :
  // aucune action de vote n'est exposée dans l'interface.
  reportThread: (threadId: number, reason: string, solutionId?: number) =>
    USE_MOCK
      ? mockApi.reportThread(threadId, reason)
      : http.post(`/forge/threads/${threadId}/report`, solutionId ? { raison: reason, solution_id: solutionId } : { raison: reason }),

  // administration
  adminOverview: () => (USE_MOCK ? mockApi.getAdminOverview() : http.get<import('@/types').AdminOverview>('/admin/analytics')),
  adminSubmissions: async () => {
    if (USE_MOCK) return mockApi.getAdminSubmissions()
    const payload = await http.get<{ data: Record<string, any>[] } | Record<string, any>[]>('/admin/submissions?limite=100')
    return extractData(payload).map(adaptSubmission)
  },
  reviewSubmission: async (id: number, decision: import('@/types').ReviewDecision, feedback: string) => {
    if (USE_MOCK) return mockApi.reviewSubmission(id, decision, feedback)
    const payload = await http.post<{ data: Record<string, any> } | Record<string, any>>(`/admin/submissions/${id}/review`, { decision, feedback })
    return adaptSubmission(extractData(payload))
  },
  adminRules: () => (USE_MOCK ? mockApi.getAdminRules() : http.get<import('@/types').XpRule[]>('/admin/rules/xp')),
  updateRule: (id: number, patch: Partial<import('@/types').XpRule>) =>
    USE_MOCK ? mockApi.updateRule(id, patch) : http.patch<import('@/types').XpRule>(`/admin/rules/xp/${id}`, patch),
  adminOrders: () => (USE_MOCK ? mockApi.getAdminOrders() : http.get<import('@/types').RewardOrder[]>('/admin/orders')),
  updateOrder: (id: number, status: import('@/types').RewardOrder['status']) =>
    USE_MOCK ? mockApi.updateOrder(id, status) : http.patch<import('@/types').RewardOrder>(`/admin/orders/${id}`, { status }),
  adminStudents: () =>
    USE_MOCK ? mockApi.getAdminStudents() : http.get<Awaited<ReturnType<typeof mockApi.getAdminStudents>>>('/admin/students'),
}

function qs(params?: Record<string, string | undefined>) {
  if (!params) return ''
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') search.set(key, value)
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}
