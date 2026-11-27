/**
 * Code212 Quest — Types métier
 * Source de vérité alignée sur le contrat API `/api/v1` (apps/api/docs/API_CONTRACT.md).
 */

export type UserRole = 'student' | 'trainer' | 'moderator' | 'admin'

/** Les quatre voies de progression Code212 (cf. note de conception V0.2). */
export type TrackCode = 'codeur' | 'aidant' | 'batisseur' | 'explorateur'

export type QuestDifficulty = 'debutant' | 'intermediaire' | 'avance' | 'expert'
export type QuestStatus = 'brouillon' | 'publiee' | 'archivee'
export type SubmissionStatus = 'en_attente' | 'validee' | 'rejetee'
export type ChallengeStatus = 'a_venir' | 'en_cours' | 'termine'
export type ChallengeMode = 'solo' | 'equipe' | 'duel'
export type BadgeRarity = 'commun' | 'rare' | 'epique' | 'legendaire'
export type RewardCategory = 'cosmetique' | 'avantage' | 'materiel' | 'mentorat'
export type ForgeCategorySlug = 'entraide' | 'projets' | 'coding-league' | 'annonces' | 'cafe'

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  displayName: string
  pseudonym: string
  email: string
  studentCode: string
  program: string
  cohort: string
  roles: UserRole[]
  level: number
  levelTitle: string
  xp: number
  xpToNextLevel: number
  levelFloor: number
  levelCeiling: number
  germs: number
  streakDays: number
  bestStreak: number
  questsCompleted: number
  questsInProgress: number
  badgesEarned: number
  trackPoints: Record<TrackCode, number>
  dominantTrack: TrackCode
  competitionOptIn: boolean
  pseudonymized: boolean
  weeklyGoalXp: number
  weeklyXp: number
  joinedAt: string
}

export interface LevelConfig {
  level: number
  title: string
  xpThreshold: number
  requirements: string[]
  benefits: string[]
}

export interface TrackRank {
  rank: number
  code: string
  label: string
  threshold: number
}

export interface Track {
  code: TrackCode
  name: string
  description: string
  icon: string
  color: string
  points: number
  rank: TrackRank
  nextRank: TrackRank | null
  questIds: number[]
}

export interface QuestStep {
  id: number
  order: number
  title: string
  description: string
  kind: 'lecture' | 'quiz' | 'code' | 'livrable' | 'live'
  xp: number
  durationMinutes: number
  status: 'verrouille' | 'disponible' | 'en_cours' | 'valide' | 'rejete'
  score?: number
  feedback?: string
}

export interface Quest {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  category: string
  track: TrackCode
  difficulty: QuestDifficulty
  status: QuestStatus
  xpReward: number
  trackPoints: number
  germsReward: number
  durationMinutes: number
  participants: number
  completionRate: number
  prerequisites: number[]
  badges: string[]
  authorName: string
  createdAt: string
  coverGradient: string
  icon: string
  enrolled: boolean
  progress: number
  steps: QuestStep[]
  objectives: string[]
}

export interface Submission {
  id: number
  questId: number
  questTitle: string
  studentId: number
  studentName: string
  studentPseudonym: string
  stepId: number
  stepTitle: string
  content: string
  status: SubmissionStatus
  submittedAt: string
  reviewedAt?: string
  reviewerName?: string
  xpAwarded: number
  feedback?: string
}

export interface LedgerEntry {
  id: number
  xpDelta: number
  trackType: TrackCode | null
  sourceEvent: string
  referenceId: string
  label: string
  createdAt: string
  ruleVersion: number
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  displayName: string
  pseudonym: string
  program: string
  level: number
  xp: number
  weeklyXp: number
  questsCompleted: number
  streakDays: number
  isCurrentUser: boolean
  trend: 'up' | 'down' | 'same' | 'new'
}

export interface LeaderboardPeriod {
  key: 'semaine' | 'mois' | 'semestre' | 'all_time'
  label: string
}

export interface Badge {
  code: string
  name: string
  description: string
  track: TrackCode
  rarity: BadgeRarity
  icon: string
  /** Optional artwork displayed once the badge has been earned. */
  imageUrl?: string
  xp: number
  rule: string
  earned: boolean
  earnedAt?: string
  progress: number
  target: number
  evidence?: string
}

export interface Reward {
  id: number
  name: string
  description: string
  category: RewardCategory
  cost: number
  stock: number
  icon: string
  gradient: string
  limited?: boolean
  owned?: number
}

export interface RewardOrder {
  id: number
  userId: number
  userName: string
  rewardId: number
  rewardName: string
  quantity: number
  total: number
  status: 'en_attente' | 'approuvee' | 'livree' | 'refusee'
  createdAt: string
}

export interface LearningPath {
  id: number
  slug: string
  title: string
  description: string
  track: TrackCode
  level: QuestDifficulty
  quests: number[]
  progress: number
  xpReward: number
  estimatedHours: number
  enrolled: boolean
  icon: string
  gradient: string
  skills: string[]
}

export interface Mission {
  id: number
  title: string
  description: string
  period: 'hebdomadaire' | 'mensuel'
  target: number
  progress: number
  xpReward: number
  germsReward: number
  claimed: boolean
  expiresAt: string
  icon: string
}

export interface Challenge {
  id: number
  slug: string
  title: string
  description: string
  category: string
  mode: ChallengeMode
  status: ChallengeStatus
  difficulty: QuestDifficulty
  xpReward: number
  startsAt: string
  endsAt: string
  participants: number
  maxParticipants: number
  prize?: string
  joined: boolean
  progress: number
  score?: number
  teamName?: string
  rules: string[]
  track: TrackCode
}

export interface ForgeThread {
  id: number
  category: ForgeCategorySlug
  title: string
  body: string
  authorId: number
  authorName: string
  authorPseudonym: string
  authorRole: UserRole
  createdAt: string
  replies: number
  views: number
  likes: number
  liked: boolean
  solved: boolean
  tags: string[]
  solutionIds: number[]
  pinned?: boolean
  closed?: boolean
  author?: ForgeAuthorIdentity
}

export type ForgeModerationStatus = 'normal' | 'warned-1' | 'warned-2' | 'banned'

export interface ForgeAuthorBadge {
  id: string
  name: string
  imageUrl?: string
}

/** Optional forum identity fields; older API responses can safely omit them. */
export interface ForgeAuthorIdentity {
  pseudonym: string
  avatarUrl?: string
  role?: UserRole
  type?: 'Codeur' | 'Aidant' | 'Créateur' | 'Explorateur'
  level?: number
  levelTitle?: string
  xp?: number
  germs?: number
  badges?: ForgeAuthorBadge[]
  moderationStatus?: ForgeModerationStatus
  moderationEndsAt?: string
  moderationReason?: string
  levelProgress?: number
  starCount?: number
  messageCount?: number
  isDirector?: boolean
  communityRoles?: ('director' | 'admin' | 'team' | 'moderator' | 'supervisor' | 'mentor')[]
  reportCount?: number
}

export interface ForgeSolution {
  id: number
  threadId: number
  authorId: number
  authorName: string
  authorPseudonym: string
  body: string
  accepted: boolean
  acceptedAt?: string
  createdAt: string
  likes: number
  mine: boolean
  authorRole?: UserRole
  author?: ForgeAuthorIdentity
}

export interface ForgeCategory {
  slug: ForgeCategorySlug
  name: string
  description: string
  icon: string
  threads: number
  requiresApproval: boolean
  moderatedBy: string | null
}

export interface DashboardData {
  profile: UserProfile
  level: LevelConfig
  nextLevel: LevelConfig | null
  weeklyActivity: { day: string; xp: number; label: string }[]
  recentBadges: Badge[]
  activeQuests: Quest[]
  recommendedQuests: Quest[]
  leaderboardPreview: LeaderboardEntry[]
  trackSnapshot: Track[]
  nextMissions: Mission[]
  streakDays: string[]
}

export interface AdminOverview {
  kpis: {
    students: number
    studentsDelta: number
    activeQuests: number
    questsDelta: number
    completionRate: number
    completionDelta: number
    xpDistributed: number
    xpDelta: number
    pendingSubmissions: number
    moderationQueue: number
    avgSessionMinutes: number
  }
  engagement: { day: string; active: number; completed: number; label: string }[]
  topQuests: { id: number; title: string; participants: number; completionRate: number; xp: number }[]
  trackDistribution: { track: TrackCode; name: string; points: number; students: number; color: string }[]
  pendingSubmissions: Submission[]
  recentOrders: RewardOrder[]
  moderationQueue: { id: number; type: 'discussion' | 'solution'; title: string; reason: string; reporter: string; createdAt: string }[]
}

export interface XpRule {
  id: number
  code: string
  label: string
  description: string
  xp: number
  dailyCap: number
  track: TrackCode | null
  active: boolean
  version: number
  category: 'quetes' | 'communaute' | 'presence' | 'evenement' | 'penalite'
}

export interface Certification {
  id: number
  code: string
  title: string
  issuer: string
  track: TrackCode
  issuedAt: string
  expiresAt?: string
  status: 'obtenue' | 'en_cours' | 'expiree'
  progress: number
  criteria: string[]
  skills: string[]
  credentialUrl?: string
  signed: boolean
}

export interface Paginated<T> {
  data: T[]
  meta: { total: number; page: number; perPage: number; lastPage: number }
}
