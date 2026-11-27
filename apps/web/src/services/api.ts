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
    solutionIds: [], closed: raw.statut === 'fermee', pinned: Boolean(raw.epingle),
    author: { pseudonym },
  }
}
function forgeSolution(raw: ForgeRaw): import('@/types').ForgeSolution {
  const author = raw.auteur ?? {}
  const pseudonym = String(author.pseudonyme ?? 'Membre CODE212')
  return {
    id: Number(raw.id), threadId: Number(raw.fil_id), authorId: Number(author.id ?? 0),
    authorName: pseudonym, authorPseudonym: pseudonym, body: String(raw.contenu ?? ''),
    accepted: Boolean(raw.acceptee), acceptedAt: raw.acceptee_le ?? undefined,
    createdAt: String(raw.cree_le ?? new Date().toISOString()), likes: Number(raw.votes ?? 0),
    mine: false, author: { pseudonym },
  }
}
async function forgeRawCategories(): Promise<ForgeRaw[]> {
  return forgeData(await http.get<{ data: ForgeRaw[] }>('/forge/categories'))
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
  quests: (params?: Record<string, string | undefined>) =>
    USE_MOCK
      ? mockApi.getQuests(params)
      : http.get<import('@/types').Quest[]>(`/quests${qs(params)}`),
  quest: (id: number) => (USE_MOCK ? mockApi.getQuest(id) : http.get<import('@/types').Quest>(`/quests/${id}`)),
  enrollQuest: (id: number) => (USE_MOCK ? mockApi.enrollQuest(id) : http.post<import('@/types').Quest>(`/quests/${id}/enroll`)),
  submitStep: (questId: number, stepId: number, content: string) =>
    USE_MOCK
      ? mockApi.submitStep(questId, stepId, content)
      : http.post<{ status: string; xpAwarded: number }>(`/quests/${questId}/steps/${stepId}/submit`, { content }),

  // progression
  ledger: () => (USE_MOCK ? mockApi.getLedger() : http.get<import('@/types').LedgerEntry[]>('/ledger')),
  leaderboard: (period: string) =>
    USE_MOCK ? mockApi.getLeaderboard(period) : http.get<import('@/types').LeaderboardEntry[]>(`/leaderboards?period=${period}`),
  levels: () => (USE_MOCK ? mockApi.getLevels() : http.get<import('@/types').LevelConfig[]>('/levels')),
  tracks: () => (USE_MOCK ? mockApi.getTracks() : http.get<import('@/types').Track[]>('/tracks')),
  badges: () => (USE_MOCK ? mockApi.getBadges() : http.get<import('@/types').Badge[]>('/badges')),
  paths: () => (USE_MOCK ? mockApi.getPaths() : http.get<import('@/types').LearningPath[]>('/paths')),
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
  toggleLikeThread: (id: number) =>
    USE_MOCK ? mockApi.toggleLikeThread(id) : Promise.reject(new ApiError('Les votes de sujet ne sont pas disponibles dans cette API Laravel.', 501)),
  reportThread: (threadId: number, reason: string) =>
    USE_MOCK ? mockApi.reportThread(threadId, reason) : http.post(`/forge/threads/${threadId}/report`, { raison: reason }),

  // administration
  adminOverview: () => (USE_MOCK ? mockApi.getAdminOverview() : http.get<import('@/types').AdminOverview>('/admin/analytics')),
  adminSubmissions: () => (USE_MOCK ? mockApi.getAdminSubmissions() : http.get<import('@/types').Submission[]>('/admin/submissions')),
  reviewSubmission: (id: number, decision: 'validee' | 'rejetee', feedback: string) =>
    USE_MOCK
      ? mockApi.reviewSubmission(id, decision, feedback)
      : http.post<import('@/types').Submission>(`/admin/submissions/${id}/review`, { decision, feedback }),
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
