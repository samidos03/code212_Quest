import { CheckCircle2, Coins, Gift, Target, Zap } from 'lucide-react'
import { useClaimMission, useMissions } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { Mission } from '@/types'

export function MissionsPage() {
  const { data: missions, isLoading } = useMissions()
  const claim = useClaimMission()
  const { toast } = useToast()

  const weekly = (missions ?? []).filter((m) => m.period === 'hebdomadaire')
  const monthly = (missions ?? []).filter((m) => m.period === 'mensuel')

  const renderMission = (mission: Mission) => {
    const done = mission.progress >= mission.target
    const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100))

    return (
      <li key={mission.id} className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[20px]',
            mission.claimed || done ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary',
          )}
        >
          {mission.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[16.5px] font-bold text-fg">{mission.title}</h3>
            {mission.claimed && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Réclamée
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-fg-muted">{mission.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <Progress value={percent} className="h-1.5 max-w-[280px]" tone={done ? 'success' : 'primary'} />
            <span className="shrink-0 text-[12px] font-semibold tabular-nums text-fg-subtle">
              {mission.progress}/{mission.target}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11.5px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-accent">
              <Zap className="h-3.5 w-3.5" /> +{formatNumber(mission.xpReward)} XP
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-fg">
              <Coins className="h-3.5 w-3.5" /> +{mission.germsReward} germes
            </span>
            <span className="text-fg-subtle">Expire le {formatDate(mission.expiresAt)}</span>
          </div>
        </div>

        <Button
          variant={mission.claimed ? 'ghost' : done ? 'primary' : 'outline'}
          disabled={mission.claimed || !done}
          className="shrink-0"
          loading={claim.isPending}
          onClick={() =>
            claim.mutate(mission.id, {
              onSuccess: () => toast('Mission réclamée', { description: `+${mission.xpReward} XP et +${mission.germsReward} germes ajoutés.` }),
            })
          }
        >
          {mission.claimed ? 'Réclamée' : done ? <><Gift className="h-4 w-4" /> Réclamer</> : 'En cours'}
        </Button>
      </li>
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Objectifs"
        title="Missions"
        description="Des objectifs courts, hebdomadaires ou mensuels, pour installer un rythme durable. Récompense unique par mission."
        actions={<Badge variant="primary">{(missions ?? []).filter((m) => !m.claimed).length} à réclamer</Badge>}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-display text-[17px] font-bold text-fg">Hebdomadaires</h2>
              <span className="text-[12px] text-fg-subtle">renewées chaque lundi</span>
            </div>
            <ul className="space-y-3">{weekly.map(renderMission)}</ul>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <h2 className="font-display text-[17px] font-bold text-fg">Mensuelles</h2>
              <span className="text-[12px] text-fg-subtle">objectifs de durée</span>
            </div>
            <ul className="space-y-3">{monthly.map(renderMission)}</ul>
          </section>
        </div>
      )}
    </div>
  )
}
