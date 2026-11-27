import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { XpRule } from '@/types'

/* ------------------------------------------------------------- apprenant */

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: api.me, staleTime: 60_000 })

export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard })

export const useQuests = (params?: { track?: string; difficulty?: string; category?: string; search?: string }) =>
  useQuery({ queryKey: ['quests', params], queryFn: () => api.quests(params) })

export const useQuest = (id: number) => useQuery({ queryKey: ['quest', id], queryFn: () => api.quest(id) })

export function useEnrollQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.enrollQuest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quest'] })
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useSubmitStep(questId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { stepId: number; content: string }) => api.submitStep(questId, payload.stepId, payload.content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quest', questId] })
      qc.invalidateQueries({ queryKey: ['ledger'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useLedger = () => useQuery({ queryKey: ['ledger'], queryFn: api.ledger })

export const useLeaderboard = (period: string) =>
  useQuery({ queryKey: ['leaderboard', period], queryFn: () => api.leaderboard(period) })

export const useLevels = () => useQuery({ queryKey: ['levels'], queryFn: api.levels })
export const useTracks = () => useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
export const useBadges = () => useQuery({ queryKey: ['badges'], queryFn: api.badges })
export const usePaths = () => useQuery({ queryKey: ['paths'], queryFn: api.paths })
export const useMissions = () => useQuery({ queryKey: ['missions'], queryFn: api.missions })
export const useCertifications = () => useQuery({ queryKey: ['certifications'], queryFn: api.certifications })
export const useRewards = () => useQuery({ queryKey: ['rewards'], queryFn: api.rewards })
export const useChallenges = () => useQuery({ queryKey: ['challenges'], queryFn: api.challenges })
export const useForgeCategories = () => useQuery({ queryKey: ['forge', 'categories'], queryFn: api.forgeCategories })
export const useForgeThreads = (category?: string) =>
  useQuery({ queryKey: ['forge', 'threads', category ?? 'all'], queryFn: () => api.forgeThreads(category) })

export function useClaimMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.claimMission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['ledger'] })
    },
  })
}

export function useJoinChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.joinChallenge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  })
}

export function usePurchaseReward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.purchaseReward(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

/* ------------------------------------------------------------------ Forge */

export const useForgeThread = (id: number) =>
  useQuery({ queryKey: ['forge', 'thread', id], queryFn: () => api.forgeThread(id) })

export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createThread,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forge'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useReplyToThread(threadId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => api.replyToThread(threadId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forge'] }),
  })
}

export function useAcceptSolution(threadId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (solutionId: number) => api.acceptSolution(threadId, solutionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forge'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useLikeThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.toggleLikeThread(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forge'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useReportThread() {
  return useMutation({ mutationFn: ({ id, reason }: { id: number; reason: string }) => api.reportThread(id, reason) })
}

/* ------------------------------------------------------------------ profil */

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/* ------------------------------------------------------------------- admin */

export const useAdminOverview = () => useQuery({ queryKey: ['admin', 'overview'], queryFn: api.adminOverview })
export const useAdminSubmissions = () => useQuery({ queryKey: ['admin', 'submissions'], queryFn: api.adminSubmissions })
export const useAdminRules = () => useQuery({ queryKey: ['admin', 'rules'], queryFn: api.adminRules })
export const useAdminOrders = () => useQuery({ queryKey: ['admin', 'orders'], queryFn: api.adminOrders })
export const useAdminStudents = () => useQuery({ queryKey: ['admin', 'students'], queryFn: api.adminStudents })

export function useReviewSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; decision: 'validee' | 'rejetee'; feedback: string }) =>
      api.reviewSubmission(payload.id, payload.decision, payload.feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; patch: Partial<XpRule> }) => api.updateRule(payload.id, payload.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'rules'] }),
  })
}

export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; status: import('@/types').RewardOrder['status'] }) =>
      api.updateOrder(payload.id, payload.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}
