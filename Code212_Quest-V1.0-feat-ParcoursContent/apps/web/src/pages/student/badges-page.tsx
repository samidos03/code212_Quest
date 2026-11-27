import { useMemo, useState } from 'react'
import { BadgeCheck, Lock, Trophy } from 'lucide-react'
import { useBadges, useLevels, useTracks } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RARITY_LABEL, RARITY_TONE, TRACK_LABEL, cn, formatDate, formatNumber } from '@/lib/utils'
import type { Badge as BadgeType, TrackCode } from '@/types'

const rarityGradient: Record<string, string> = {
  commun: 'from-[#9aa0ab] to-[#5c6270]',
  rare: 'from-[#00b8d4] to-[#0f8fbf]',
  epique: 'from-[#c5027f] to-[#6701e6]',
  legendaire: 'from-[#f59e0b] via-[#f97316] to-[#c5027f]',
}

function BadgeCard({ badge }: { badge: BadgeType }) {
  const percent = badge.target > 0 ? Math.min(100, Math.round((badge.progress / badge.target) * 100)) : 0
  return (
    <article
      className={cn(
        'panel group relative flex flex-col items-center gap-2 p-4 text-center transition-all duration-300 hover:-translate-y-1',
        !badge.earned && 'opacity-80',
      )}
    >
      {badge.earned && (
        <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-lg bg-success-soft text-success">
          <BadgeCheck className="h-3.5 w-3.5" />
        </span>
      )}
      <div
        className={cn(
          'grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-[26px] font-bold text-white shadow-[var(--shadow-card)] transition-transform group-hover:scale-105',
          badge.earned ? rarityGradient[badge.rarity] : 'from-surface-3 to-surface-3 text-fg-subtle',
        )}
      >
        {badge.imageUrl ? (
          <img
            src={badge.imageUrl}
            alt={`Badge ${badge.name}`}
            className="h-full w-full object-contain"
          />
        ) : badge.earned ? (
          badge.icon
        ) : (
          <Lock className="h-5 w-5" />
        )}
      </div>
      <p className="mt-1 font-display text-[15px] font-bold leading-tight text-fg">{badge.name}</p>
      <p className="line-clamp-2 text-[11.5px] leading-snug text-fg-muted">{badge.description}</p>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', RARITY_TONE[badge.rarity])}>
        {RARITY_LABEL[badge.rarity]}
      </span>

      {badge.earned ? (
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-subtle">
          Obtenu le {badge.earnedAt ? formatDate(badge.earnedAt) : '—'}
        </p>
      ) : (
        <div className="mt-1 w-full">
          <div className="mb-1 flex items-center justify-between text-[10.5px] font-semibold text-fg-subtle">
            <span>{badge.progress} / {badge.target}</span>
            <span>{percent} %</span>
          </div>
          <Progress value={percent} className="h-1" />
          <p className="mt-1.5 line-clamp-1 text-[10.5px] text-fg-subtle">{badge.rule}</p>
        </div>
      )}
    </article>
  )
}

export function BadgesPage() {
  const { data: badges, isLoading } = useBadges()
  const { data: tracks } = useTracks()
  const { data: levels } = useLevels()
  const [rarity, setRarity] = useState('all')
  const [trackFilter, setTrackFilter] = useState<TrackCode | 'all'>('all')

  const filtered = useMemo(
    () =>
      (badges ?? []).filter(
        (badge) => (rarity === 'all' || badge.rarity === rarity) && (trackFilter === 'all' || badge.track === trackFilter),
      ),
    [badges, rarity, trackFilter],
  )

  const earnedCount = (badges ?? []).filter((b) => b.earned).length

  return (
    <div>
      <PageHeader
        kicker="Progression & reconnaissance"
        title="Badges & voies"
        description="Les badges marquent vos acquis, les voies structurent votre progression. Chaque voie se parcourt par cinq rangs, du premier au rang expert."
        actions={
          <Badge variant="accent">
            {earnedCount}/{badges?.length ?? 0} badges
          </Badge>
        }
      />

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">Catalogue de badges</TabsTrigger>
          <TabsTrigger value="voies">Voies & rangs</TabsTrigger>
          <TabsTrigger value="niveaux">Niveaux globaux</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {['all', 'commun', 'rare', 'epique', 'legendaire'].map((r) => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  rarity === r ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted hover:text-fg',
                )}
              >
                {r === 'all' ? 'Toutes raretés' : RARITY_LABEL[r]}
              </button>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            {(['all', 'codeur', 'aidant', 'batisseur', 'explorateur'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  trackFilter === t ? 'border-accent/30 bg-accent-soft text-accent' : 'border-border bg-surface text-fg-muted hover:text-fg',
                )}
              >
                {t === 'all' ? 'Toutes voies' : TRACK_LABEL[t]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {filtered.map((badge) => (
                <BadgeCard key={badge.code} badge={badge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voies">
          <div className="grid gap-4 lg:grid-cols-2">
            {(tracks ?? []).map((track) => {
              const next = track.nextRank
              const percent = next ? Math.min(100, Math.round(((track.points - track.rank.threshold) / (next.threshold - track.rank.threshold)) * 100)) : 100
              return (
                <article key={track.code} className="panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[22px] font-bold text-white"
                        style={{ background: track.color }}
                      >
                        {track.icon}
                      </span>
                      <div>
                        <h3 className="font-display text-[18px] font-bold text-fg">{track.name}</h3>
                        <p className="text-[12px] text-fg-subtle">
                          Rang {track.rank.rank}/5 · {track.rank.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[20px] font-bold leading-none text-fg">{formatNumber(track.points)}</p>
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-subtle">points</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">{track.description}</p>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                      <span className="text-fg-muted">
                        {next ? `Vers ${next.label}` : 'Rang maximum atteint'}
                      </span>
                      <span className="text-fg-subtle">{next ? `${formatNumber(next.threshold - track.points)} pts restants` : '★'}</span>
                    </div>
                    <Progress value={percent} indicatorClassName={track.code === 'codeur' ? 'bg-primary' : track.code === 'aidant' ? 'bg-accent' : track.code === 'batisseur' ? 'bg-cyan' : 'bg-warning'} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5].map((rank) => {
                      const reached = track.points >= [0, 100, 400, 1000, 2000][rank - 1]
                      return (
                        <span
                          key={rank}
                          className={cn(
                            'rounded-lg px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide',
                            reached ? 'bg-brand-gradient text-white' : 'bg-surface-3 text-fg-subtle',
                          )}
                        >
                          R{rank}
                        </span>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="niveaux">
          <div className="panel overflow-hidden">
            {(levels ?? []).map((level, index) => {
              const current = level.level === 8
              return (
                <div
                  key={level.level}
                  className={cn(
                    'flex flex-col gap-3 border-b border-border px-5 py-4 last:border-0 sm:flex-row sm:items-center',
                    current && 'bg-primary-soft/50',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-[17px] font-bold',
                        current ? 'bg-brand-gradient text-white' : level.level <= 8 ? 'bg-primary-soft text-primary' : 'bg-surface-3 text-fg-subtle',
                      )}
                    >
                      {level.level}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[16px] font-bold text-fg">{level.title}</p>
                      <p className="mt-0.5 truncate text-[12px] text-fg-muted">
                        {level.requirements.join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    <div className="hidden max-w-[240px] lg:block">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-subtle">Avantages</p>
                      <p className="text-[12px] text-fg-muted">{level.benefits.join(' · ')}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-surface-3 px-3 py-1.5 text-[12.5px] font-bold text-fg">
                      <Trophy className="h-3.5 w-3.5 text-primary" /> {formatNumber(level.xpThreshold)} XP
                    </span>
                    {current && <Badge variant="accent">Niveau actuel</Badge>}
                    {index === 0 && !current && <Badge variant="outline">Départ</Badge>}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
