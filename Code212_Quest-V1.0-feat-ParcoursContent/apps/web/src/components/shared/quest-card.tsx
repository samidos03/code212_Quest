import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock3, Users } from 'lucide-react'
import type { Quest } from '@/types'
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, cn, formatDuration, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export const questArtGradients: Record<string, string> = {
  violet: 'from-[#6701e6] via-[#7b2ff2] to-[#c5027f]',
  magenta: 'from-[#c5027f] via-[#a31ac4] to-[#6701e6]',
  cyan: 'from-[#00b8d4] via-[#00dfff] to-[#0f9bd8]',
  orange: 'from-[#f59e0b] via-[#f97316] to-[#c5027f]',
}

export function QuestArt({ quest, className }: { quest: Quest; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br', questArtGradients[quest.coverGradient] ?? questArtGradients.violet, className)}>
      <div className="art-grid absolute inset-0 opacity-40 mix-blend-overlay" />
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
      <div className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-black/20 blur-xl" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="relative font-display text-[40px] font-bold text-white/95 drop-shadow-lg">{quest.icon}</span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
        {DIFFICULTY_LABEL[quest.difficulty]}
      </span>
      {quest.enrolled && (
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#6701e6]">
          En cours
        </span>
      )}
    </div>
  )
}

export function QuestCard({ quest }: { quest: Quest }) {
  return (
    <Link
      to={`/quests/${quest.id}`}
      className="group panel flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <QuestArt quest={quest} className="h-32 shrink-0" />
      <div className="flex flex-1 flex-col p-4">
        <p className="kicker">{quest.category}</p>
        <h3 className="mt-1.5 font-display text-[18px] font-bold leading-tight text-fg transition-colors group-hover:text-primary">
          {quest.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-fg-muted">{quest.subtitle}</p>

        <div className="mt-3 flex items-center gap-4 text-[11.5px] text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {formatNumber(quest.participants)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" /> {formatDuration(quest.durationMinutes)}
          </span>
        </div>

        {quest.enrolled && quest.progress > 0 && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
              <span className="text-fg-muted">Progression</span>
              <span className="text-primary">{quest.progress} %</span>
            </div>
            <Progress value={quest.progress} className="h-1.5" />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Badge variant="accent" className="gap-1">
            +{formatNumber(quest.xpReward)} XP
          </Badge>
          <span className={cn('inline-flex items-center gap-1 text-[12px] font-semibold text-primary')}>
            {quest.enrolled ? 'Continuer' : 'Découvrir'}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function QuestRow({ quest }: { quest: Quest }) {
  return (
    <Link
      to={`/quests/${quest.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-display text-lg font-bold text-white', questArtGradients[quest.coverGradient] ?? questArtGradients.violet)}>
        {quest.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', DIFFICULTY_TONE[quest.difficulty])}>
            {DIFFICULTY_LABEL[quest.difficulty]}
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">{quest.category}</span>
        </div>
        <p className="mt-1 truncate font-display text-[16px] font-bold text-fg transition-colors group-hover:text-primary">{quest.title}</p>
        <div className="mt-1 flex items-center gap-3 text-[11.5px] text-fg-subtle">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" /> {formatDuration(quest.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {formatNumber(quest.participants)}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-[17px] font-bold text-accent">+{formatNumber(quest.xpReward)}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">XP</p>
      </div>
    </Link>
  )
}
