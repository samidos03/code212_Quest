import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock3, Crown, Flame, Radio, Shield, Swords, Timer, Users, Zap } from 'lucide-react'
import { useChallenges, useJoinChallenge } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn, formatDateTime, formatNumber } from '@/lib/utils'
import type { Challenge } from '@/types'

const modeLabel: Record<Challenge['mode'], string> = {
  solo: 'Individuel',
  equipe: 'Équipe',
  duel: 'Duel',
}

const statusMeta: Record<Challenge['status'], { label: string; tone: 'success' | 'warning' | 'default' }> = {
  en_cours: { label: 'En cours', tone: 'success' },
  a_venir: { label: 'À venir', tone: 'warning' },
  termine: { label: 'Terminé', tone: 'default' },
}

function ChallengeCard({ challenge, onJoin, joining }: { challenge: Challenge; onJoin: () => void; joining: boolean }) {
  const meta = statusMeta[challenge.status]
  const filled = Math.round((challenge.participants / challenge.maxParticipants) * 100)

  return (
    <motion.article
      layout
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50',
        challenge.status === 'en_cours' && 'border-primary/30',
      )}
    >
      {challenge.status === 'en_cours' && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-[18px] font-bold text-white shadow-[0_8px_24px_-10px_rgba(103,1,230,.9)]">
            {challenge.mode === 'duel' ? <Swords className="h-5 w-5" /> : challenge.mode === 'equipe' ? <Users className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{challenge.category}</p>
            <p className="font-display text-[16.5px] font-bold leading-tight text-fg">{challenge.title}</p>
          </div>
        </div>
        <Badge variant={meta.tone} className="shrink-0">
          {challenge.status === 'en_cours' && <Radio className="h-3 w-3 animate-pulse" />}
          {meta.label}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">{challenge.description}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[11.5px] text-fg-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Swords className="h-3.5 w-3.5" /> {modeLabel[challenge.mode]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" /> {formatDateTime(challenge.startsAt)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
          <Zap className="h-3.5 w-3.5" /> {formatNumber(challenge.xpReward)} XP
        </span>
      </div>

      {challenge.joined && challenge.progress > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-semibold">
            <span className="text-fg-muted">Avancement</span>
            <span className="text-cyan">{challenge.progress} %</span>
          </div>
          <Progress value={challenge.progress} className="h-1.5" tone="cyan" />
        </div>
      )}

      {challenge.prize && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-soft px-3 py-2">
          <Crown className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate text-[12.5px] font-semibold text-accent">{challenge.prize}</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10.5px] font-semibold text-fg-subtle">
            <span>{challenge.participants} inscrits</span>
            <span>{challenge.maxParticipants} max</span>
          </div>
          <Progress value={filled} className="h-1" />
        </div>
        <Button
          size="sm"
          variant={challenge.joined ? 'outline' : 'cyan'}
          className="shrink-0"
          onClick={onJoin}
          loading={joining}
          disabled={challenge.joined}
        >
          {challenge.joined ? 'Inscrit' : 'Rejoindre'}
        </Button>
      </div>
    </motion.article>
  )
}

export function ArenaPage() {
  const { data: challenges, isLoading } = useChallenges()
  const join = useJoinChallenge()
  const { toast } = useToast()
  const [filter, setFilter] = useState<'all' | Challenge['status']>('all')

  const list = useMemo(
    () => (challenges ?? []).filter((challenge) => filter === 'all' || challenge.status === filter),
    [challenges, filter],
  )

  const live = (challenges ?? []).find((c) => c.status === 'en_cours' && c.id === 1) ?? (challenges ?? []).find((c) => c.status === 'en_cours')

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Espace compétitif"
        title="L’Arène"
        description="Défis chronométrés, duels et hackathons. Classement pseudonymisé, récompenses en XP et en badges, et droit de retrait du classement à tout moment."
        actions={
          <Badge variant="cyan" className="gap-1.5">
            <Radio className="h-3 w-3 animate-pulse" /> {list.filter((c) => c.status === 'en_cours').length} défis en cours
          </Badge>
        }
      />

      {/* ------------------------------------------------------------- live */}
      {live && (
        <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-surface/60 p-6 backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-arena-grid opacity-60" />
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-cyan/15 blur-3xl" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-cyan">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> En cours · {live.mode === 'equipe' ? 'Équipe' : 'Individuel'}
              </span>
              <h2 className="mt-3 font-display text-[30px] font-bold leading-tight text-fg sm:text-[40px]">
                {live.title}
              </h2>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-fg-muted">{live.description}</p>

              <ul className="mt-4 space-y-1.5">
                {live.rules.map((rule) => (
                  <li key={rule} className="flex items-center gap-2 text-[12.5px] text-fg-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                    {rule}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="cyan"
                  onClick={() =>
                    join.mutate(live.id, {
                      onSuccess: () => toast('Inscription confirmée', { description: `Vous participez à « ${live.title} ».` }),
                    })
                  }
                  loading={join.isPending}
                  disabled={live.joined}
                >
                  <Flame className="h-4 w-4" /> {live.joined ? 'Vous participez' : 'Participer'}
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-2 text-[12.5px] font-semibold text-fg">
                  <Zap className="h-4 w-4 text-accent" /> {formatNumber(live.xpReward)} XP
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Temps restant</p>
                <p className="mt-1 font-display text-[30px] font-bold leading-none text-cyan tabular-nums">11:42:08</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] text-fg-muted">
                  <Timer className="h-3.5 w-3.5" /> clôture {formatDateTime(live.endsAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Participants</p>
                <p className="mt-1 font-display text-[30px] font-bold leading-none text-fg tabular-nums">{live.participants}</p>
                <Progress value={(live.participants / live.maxParticipants) * 100} className="mt-2.5 h-1.5" tone="cyan" />
                <p className="mt-1.5 text-[11.5px] text-fg-muted">{live.maxParticipants - live.participants} places restantes</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: 'all', label: 'Tous' },
          { key: 'en_cours', label: 'En cours' },
          { key: 'a_venir', label: 'À venir' },
          { key: 'termine', label: 'Terminés' },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
              filter === item.key
                ? 'border-primary/40 bg-primary-soft text-primary'
                : 'border-border bg-surface/60 text-fg-muted hover:text-fg',
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto hidden text-[12px] text-fg-subtle sm:block">
          Classement pseudonymisé · consentement respecté
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              joining={join.isPending}
              onJoin={() =>
                join.mutate(challenge.id, {
                  onSuccess: () => toast('Inscription confirmée', { description: `Vous participez à « ${challenge.title} ».` }),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
