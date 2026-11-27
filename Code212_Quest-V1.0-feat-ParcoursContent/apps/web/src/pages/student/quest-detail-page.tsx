import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleDashed,
  Clock3,
  Coins,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Play,
  Send,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useEnrollQuest, useQuest, useSubmitStep } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea, Label } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { questArtGradients } from '@/components/shared/quest-card'
import { DIFFICULTY_LABEL, TRACK_LABEL, cn, formatDuration, formatNumber } from '@/lib/utils'
import type { QuestStep } from '@/types'

const stepIcon = {
  lecture: GraduationCap,
  quiz: Target,
  code: Play,
  livrable: FileText,
  live: Users,
} as const

const stepLabel = {
  lecture: 'Cours',
  quiz: 'Quiz',
  code: 'Atelier',
  livrable: 'Livrable',
  live: 'Session live',
} as const

function StepRow({
  step,
  index,
  onSubmit,
  disabled,
}: {
  step: QuestStep
  index: number
  onSubmit: (step: QuestStep) => void
  disabled: boolean
}) {
  const Icon = stepIcon[step.kind]
  const done = step.status === 'valide'
  const active = step.status === 'en_cours' || step.status === 'disponible'

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {index < 99 && <span className="absolute left-[19px] top-10 h-[calc(100%-24px)] w-px bg-border" aria-hidden />}
      <span
        className={cn(
          'relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors',
          done && 'border-success/30 bg-success-soft text-success',
          active && 'border-primary/30 bg-primary-soft text-primary',
          step.status === 'rejete' && 'border-danger/30 bg-danger-soft text-danger',
          step.status === 'verrouille' && 'border-border bg-surface-2 text-fg-subtle',
        )}
      >
        {done ? <Check className="h-[18px] w-[18px]" /> : step.status === 'verrouille' ? <Lock className="h-4 w-4" /> : <Icon className="h-[18px] w-[18px]" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="kicker">{stepLabel[step.kind]}</span>
          {step.score !== undefined && (
            <Badge variant="success" className="py-0">
              Score {step.score} %
            </Badge>
          )}
        </div>
        <p className="mt-1 font-display text-[16.5px] font-bold text-fg">{step.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{step.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-accent">
            <Zap className="h-3.5 w-3.5" /> +{step.xp} XP
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
            <Clock3 className="h-3.5 w-3.5" /> {formatDuration(step.durationMinutes)}
          </span>
          {step.status === 'en_cours' && (
            <Button size="sm" variant="outline" onClick={() => onSubmit(step)} disabled={disabled}>
              <Send className="h-3.5 w-3.5" /> Déposer mon livrable
            </Button>
          )}
          {step.status === 'valide' && <span className="text-[11.5px] font-semibold text-success">Validée par un formateur</span>}
          {step.status === 'en_cours' && <span className="text-[11.5px] text-fg-subtle">En attente de validation</span>}
        </div>
      </div>
    </li>
  )
}

export function QuestDetailPage() {
  const { id } = useParams()
  const questId = Number(id)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: quest, isLoading } = useQuest(questId)
  const enroll = useEnrollQuest()
  const submit = useSubmitStep(questId)
  const [activeStep, setActiveStep] = useState<QuestStep | null>(null)
  const [content, setContent] = useState('')

  if (isLoading || !quest) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const prerequisites = quest.prerequisites
    .map((pid) => ({ id: pid, title: `Quête #${pid}` }))

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white sm:p-8">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-95', questArtGradients[quest.coverGradient] ?? questArtGradients.violet)} />
        <div className="art-grid absolute inset-0 opacity-20 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                {DIFFICULTY_LABEL[quest.difficulty]}
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                {quest.category}
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                {TRACK_LABEL[quest.track]}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[30px] font-bold leading-tight sm:text-[38px]">{quest.title}</h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/85">{quest.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] font-medium text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {formatNumber(quest.participants)} participants
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" /> {formatDuration(quest.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-4 w-4" /> {quest.completionRate} % de réussite
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> {quest.authorName}
              </span>
            </div>
          </div>

          <div className="shrink-0 lg:text-right">
            {quest.enrolled ? (
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-md">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/75">Progression</p>
                <p className="mt-1 font-display text-[30px] font-bold leading-none">{quest.progress} %</p>
                <Progress value={quest.progress} className="mt-2 h-1.5 bg-white/25 [&>div]:bg-white" />
              </div>
            ) : (
              <Button
                size="lg"
                variant="ghost"
                className="bg-white text-[#6701e6] hover:bg-white/90"
                onClick={() => enroll.mutate(quest.id, { onSuccess: () => toast('Quête ajoutée à votre parcours', { description: 'Vous pouvez désormais valider les étapes une à une.' }) })}
                loading={enroll.isPending}
              >
                <Play className="h-4 w-4" /> Rejoindre la quête
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <section className="panel p-5">
            <p className="kicker">Objectifs pédagogiques</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {quest.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2.5 text-[13.5px] text-fg">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-success-soft text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {objective}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="kicker">Déroulé</p>
                <h2 className="mt-1 font-display text-[19px] font-bold text-fg">Étapes de la quête</h2>
              </div>
              <span className="text-[12px] font-semibold text-fg-subtle">
                {quest.steps.filter((s) => s.status === 'valide').length}/{quest.steps.length} validées
              </span>
            </div>
            <ol>
              {quest.steps.map((step, index) => (
                <StepRow key={step.id} step={step} index={index} onSubmit={setActiveStep} disabled={!quest.enrolled} />
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <section className="panel p-5">
            <p className="kicker">Récompenses</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-accent-soft px-3.5 py-3">
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
                  <Zap className="h-4 w-4" /> XP global
                </span>
                <span className="font-display text-[18px] font-bold text-accent">+{formatNumber(quest.xpReward)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary-soft px-3.5 py-3">
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
                  <Trophy className="h-4 w-4" /> Points {TRACK_LABEL[quest.track]}
                </span>
                <span className="font-display text-[18px] font-bold text-primary">+{formatNumber(quest.trackPoints)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-cyan-soft px-3.5 py-3">
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-cyan-fg">
                  <Coins className="h-4 w-4" /> Germes
                </span>
                <span className="font-display text-[18px] font-bold text-cyan-fg">+{formatNumber(quest.germsReward)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-fg-subtle">
              Les gains sont crédités une seule fois, à la validation par un formateur (règle serveur idempotente).
            </p>
          </section>

          {quest.badges.length > 0 && (
            <section className="panel p-5">
              <p className="kicker">Badges liés</p>
              <div className="mt-3 space-y-2">
                {quest.badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#c5027f] to-[#6701e6] text-white">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-fg">{badge}</span>
                      <span className="block text-[11px] text-fg-subtle">Débloqué à la validation</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {prerequisites.length > 0 && (
            <section className="panel p-5">
              <p className="kicker">Prérequis</p>
              <div className="mt-3 space-y-2">
                {prerequisites.map((prereq) => (
                  <div key={prereq.id} className="flex items-center gap-2.5 text-[13px] text-fg-muted">
                    <CircleDashed className="h-4 w-4 text-fg-subtle" />
                    {prereq.title}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="panel p-5">
            <p className="kicker">Encadrement</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-fg">{quest.authorName}</p>
                <p className="text-[11.5px] text-fg-subtle">Formateur référent · Centre CODE212</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={Boolean(activeStep)} onOpenChange={(open) => !open && setActiveStep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déposer votre livrable</DialogTitle>
            <DialogDescription>
              Étape « {activeStep?.title} » — votre dépôt sera transmis au formateur référent pour validation. Vous pouvez le modifier jusqu’à la validation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="livrable">Votre réponse / lien de dépôt</Label>
            <Textarea
              id="livrable"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre travail, collez un lien de dépôt ou partagez un extrait de code…"
            />
            <p className="text-[11.5px] text-fg-subtle">
              Minimum 30 caractères. La validation déclenche l’attribution des XP et des points de voie.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveStep(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!activeStep || content.trim().length < 30) {
                  toast('Livrable trop court', { description: 'Merci de détailler votre travail (30 caractères minimum).', kind: 'error' })
                  return
                }
                submit.mutate(
                  { stepId: activeStep.id, content: content.trim() },
                  {
                    onSuccess: (result) => {
                      setActiveStep(null)
                      setContent('')
                      toast('Livrable déposé', {
                        description: result.xpAwarded > 0 ? `+${result.xpAwarded} XP provisoires, en attente de validation.` : 'Déjà validé : aucun XP supplémentaire.',
                      })
                    },
                  },
                )
              }}
              loading={submit.isPending}
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer au formateur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
