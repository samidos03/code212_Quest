import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Medal, ShieldCheck, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react'
import { useLeaderboard } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatNumber } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

const periods = [
  { key: 'semaine', label: 'Cette semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'semestre', label: 'Ce semestre' },
  { key: 'all_time', label: 'Depuis toujours' },
] as const

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top = entries.slice(0, 3)
  const order = [top[1], top[0], top[2]]
  const heights = ['h-28', 'h-36', 'h-24']

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-surface/60 p-6 backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 bg-arena-grid opacity-50" />
      <div className="absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-cyan">
          <Trophy className="h-3.5 w-3.5" /> Hall of fame
        </span>
        <h2 className="mt-3 font-display text-[26px] font-bold leading-tight text-fg sm:text-[32px]">
          Les esprits qui font <span className="text-gradient">bouger les lignes.</span>
        </h2>
        <p className="mt-1.5 text-[13.5px] text-fg-muted">Le talent se construit. La constance fait la différence.</p>

        <div className="mt-8 flex items-end justify-center gap-3 sm:gap-6">
          {order.map((entry, index) => {
            if (!entry) return null
            const place = index === 0 ? 2 : index === 1 ? 1 : 3
            return (
              <motion.div
                key={entry.userId + entry.rank}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex w-24 flex-col items-center sm:w-28"
              >
                {place === 1 && (
                  <motion.span
                    className="mb-1 text-[26px] text-[#ffd166]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Crown className="h-6 w-6" />
                  </motion.span>
                )}
                <div
                  className={cn(
                    'grid h-14 w-14 place-items-center rounded-2xl font-display text-[17px] font-bold text-white shadow-lg sm:h-16 sm:w-16',
                    place === 1 && 'bg-gradient-to-br from-[#f59e0b] to-[#f97316]',
                    place === 2 && 'bg-gradient-to-br from-[#94a3b8] to-[#cbd5e1]',
                    place === 3 && 'bg-gradient-to-br from-[#b45309] to-[#d97706]',
                  )}
                >
                  {entry.pseudonym.slice(0, 2).toUpperCase()}
                </div>
                <p className="mt-2 w-full truncate text-center text-[12.5px] font-semibold text-fg">{entry.pseudonym}</p>
                <p className="text-[11px] text-fg-subtle">{formatNumber(entry.xp)} XP</p>
                <div
                  className={cn(
                    'mt-2 grid w-full place-items-center rounded-t-2xl border border-b-0 border-border bg-surface-2/80 font-display text-[22px] font-bold text-fg/70',
                    heights[index],
                  )}
                >
                  <span className="mt-4">{place}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11.5px] text-fg-subtle">
          <Medal className="h-3.5 w-3.5" />
          Classement sur la période sélectionnée · identités pseudonymisées
        </div>
      </div>
    </div>
  )
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]['key']>('mois')
  const { data: entries, isLoading } = useLeaderboard(period)

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Compétition"
        title="Classement"
        description="Le classement valorise la régularité et la progression. Vous pouvez choisir de ne pas y figurer : votre score reste compté, votre nom ne l’est pas."
        actions={
          <Badge variant="cyan" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Opt-in respecté
          </Badge>
        }
      />

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {periods.map((item) => (
          <button
            key={item.key}
            onClick={() => setPeriod(item.key)}
            className={cn(
              'shrink-0 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
              period === item.key
                ? 'border-cyan/40 bg-cyan/10 text-cyan'
                : 'border-border bg-surface/60 text-fg-muted hover:text-fg',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <Podium entries={entries ?? []} />

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="kicker">Classement général</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-fg">
                  {periods.find((p) => p.key === period)?.label}
                </h3>
              </div>
              <span className="text-[12px] text-fg-subtle">{entries?.length ?? 0} participants</span>
            </div>

            <div className="divide-y divide-border">
              {(entries ?? []).map((entry) => (
                <div
                  key={entry.userId + entry.rank}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors sm:gap-4 sm:px-5',
                    entry.isCurrentUser ? 'bg-primary-soft/60' : 'hover:bg-surface-2',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-[14px] font-bold tabular-nums',
                      entry.rank === 1 && 'bg-[#f59e0b]/15 text-[#b45309]',
                      entry.rank === 2 && 'bg-[#94a3b8]/20 text-slate-500',
                      entry.rank === 3 && 'bg-[#b45309]/15 text-[#92400e]',
                      entry.rank > 3 && 'bg-surface-3 text-fg-subtle',
                    )}
                  >
                    {entry.rank}
                  </span>

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-[13px] font-bold text-white">
                    {entry.pseudonym.slice(0, 2).toUpperCase()}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display text-[15px] font-bold text-fg">{entry.pseudonym}</span>
                      {entry.isCurrentUser && <Badge variant="accent" className="shrink-0">Vous</Badge>}
                      {entry.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 shrink-0 text-success" />}
                      {entry.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 shrink-0 text-danger" />}
                    </span>
                    <span className="mt-0.5 flex items-center gap-3 text-[11.5px] text-fg-subtle">
                      <span className="truncate">{entry.program}</span>
                      <span className="hidden sm:inline">Niveau {entry.level}</span>
                      <span className="hidden items-center gap-1 sm:inline-flex">
                        <Zap className="h-3 w-3" /> {formatNumber(entry.weeklyXp)} / sem.
                      </span>
                    </span>
                  </span>

                  <span className="hidden w-32 shrink-0 sm:block">
                    <span className="mb-1 flex items-center justify-between text-[10.5px] font-semibold text-fg-subtle">
                      <span>{entry.questsCompleted} quêtes</span>
                      <span>{entry.streakDays} j</span>
                    </span>
                    <Progress value={Math.min(100, entry.questsCompleted * 8)} className="h-1.5" />
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block font-display text-[16px] font-bold tabular-nums text-primary">{formatNumber(entry.xp)}</span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">XP</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
