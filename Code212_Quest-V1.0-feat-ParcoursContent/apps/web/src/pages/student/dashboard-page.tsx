import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  ChevronRight,
  Clock3,
  Flame,
  Medal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useDashboard } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { LevelRing } from '@/components/shared/level-ring'
import { StatCard } from '@/components/shared/stat-card'
import { QuestRow } from '@/components/shared/quest-card'
import { PageHeader, SectionHeading } from '@/components/shared/page-header'
import { cn, formatNumber } from '@/lib/utils'

function HeroSkeleton() {
  return (
    <div className="panel h-56 animate-pulse bg-surface-2" />
  )
}

export function DashboardPage() {
  const { data, isLoading } = useDashboard()

  const hero = useMemo(() => {
    if (!data) return null
    const { profile, level, nextLevel } = data
    const span = nextLevel ? nextLevel.xpThreshold - level.xpThreshold : 1
    const progress = nextLevel ? Math.round(((profile.xp - level.xpThreshold) / span) * 100) : 100
    return { profile, level, nextLevel, progress }
  }, [data])

  if (isLoading || !hero) {
    return (
      <div className="space-y-5">
        <HeroSkeleton />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const { profile, level, nextLevel, progress } = hero
  const data2 = data!

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Ton espace personnel"
        title={`Bonjour, ${profile.firstName} 👋`}
        description="Reprends là où tu en étais : chaque quête validée te rapproche du prochain niveau."
        actions={
          <Button asChild variant="primary">
            <Link to="/quests">
              Explorer les quêtes <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-[0_24px_60px_-30px_rgba(103,1,230,.95)] sm:p-8">
        <div className="brand-aurora absolute inset-0 bg-hero-aurora opacity-70 mix-blend-screen" />
        <div className="art-grid absolute inset-0 opacity-[0.14]" />
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Ton parcours continue
          </span>
          <h2 className="mt-4 font-display text-[28px] font-bold leading-[1.08] sm:text-[38px]">
            Chaque défi te rapproche
            <br />
            de <span className="text-white/80">ton prochain niveau.</span>
          </h2>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/80">
            Tu es à {formatNumber(profile.xpToNextLevel)} XP du niveau {level.level + 1}. Tu as déjà validé{' '}
            {profile.questsCompleted} quêtes — continue sur cette lancée.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost" className="bg-white text-[#6701e6] hover:bg-white/90">
              <Link to="/quests">
                Continuer l’aventure <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/85">
              <Flame className="h-4 w-4" /> Série de {profile.streakDays} jours
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-2 top-4 hidden h-56 w-56 items-center justify-center lg:flex">
          <div className="absolute h-40 w-40 animate-float rounded-full bg-white/12 blur-2xl" />
          <div className="absolute h-52 w-52 rounded-full border border-white/20" />
          <div className="absolute h-36 w-36 rounded-full border border-dashed border-white/25" />
          <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-white/15 backdrop-blur-md">
            <Zap className="h-11 w-11 fill-white" />
          </div>
          <motion.span
            className="absolute left-0 top-3 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-[12px] font-bold backdrop-blur-md"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="h-3.5 w-3.5" /> +450 XP
          </motion.span>
          <motion.span
            className="absolute bottom-2 right-4 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-[12px] font-bold backdrop-blur-md"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <Trophy className="h-3.5 w-3.5" /> Niveau {level.level}
          </motion.span>
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Zap className="h-[18px] w-[18px]" />} label="XP total" value={formatNumber(profile.xp)} note={`+${formatNumber(profile.weeklyXp)} cette semaine`} tone="primary" />
        <StatCard icon={<Trophy className="h-[18px] w-[18px]" />} label="Niveau actuel" value={`${level.level}`} note={nextLevel ? `Encore ${formatNumber(profile.xpToNextLevel)} XP` : 'Niveau maximum'} tone="accent" />
        <StatCard icon={<Award className="h-[18px] w-[18px]" />} label="Badges obtenus" value={String(profile.badgesEarned).padStart(2, '0')} note={`${profile.questsCompleted} quêtes terminées`} tone="cyan" />
        <StatCard icon={<Flame className="h-[18px] w-[18px]" />} label="Série active" value={`${profile.streakDays} j`} note={`Record : ${profile.bestStreak} jours`} tone="warning" />
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ------------------------------------------------ colonne gauche */}
        <div className="space-y-5 lg:col-span-7">
          <section className="panel p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <LevelRing value={progress} size={124} label={level.level} caption={level.title} />
              <div className="min-w-0 flex-1">
                <p className="kicker">Ta progression</p>
                <h3 className="mt-1 font-display text-[20px] font-bold text-fg">
                  {nextLevel ? `En route vers le niveau ${nextLevel.level}` : 'Niveau maximum atteint'}
                </h3>
                <p className="mt-1 text-[13px] text-fg-muted">{nextLevel?.title ?? 'Tu as débloqué tous les avantages.'}</p>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-fg">{formatNumber(profile.xp)} XP</span>
                    <span className="text-fg-subtle">{nextLevel ? `${formatNumber(nextLevel.xpThreshold)} XP` : '∞'}</span>
                  </div>
                  <Progress value={progress} />
                  <p className="mt-2 text-[11.5px] text-fg-muted">
                    Encore <strong className="text-fg">{formatNumber(profile.xpToNextLevel)} XP</strong> pour débloquer :{' '}
                    {nextLevel?.benefits[0] ?? 'les avantages finaux'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Ton activité</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Une semaine productive</h3>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> +18,4 %
              </Badge>
            </div>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="font-display text-[26px] font-bold leading-none text-fg">{formatNumber(profile.weeklyXp)}</span>
              <span className="text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">XP sur 7 jours</span>
            </div>
            <div className="h-[168px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data2.weeklyActivity} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6701e6" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="#6701e6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" className="text-border" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" dy={8} />
                  <RechartsTooltip
                    cursor={{ stroke: '#6701e6', strokeOpacity: 0.25 }}
                    contentStyle={{
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      background: 'hsl(var(--surface))',
                      fontSize: 12,
                      boxShadow: 'var(--shadow-card)',
                    }}
                    formatter={(value: number) => [`${value} XP`, 'Gains']}
                    labelFormatter={(label) => `Jour : ${label}`}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#6701e6" strokeWidth={2.5} fill="url(#xpFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <SectionHeading
              kicker="À ne pas manquer"
              title="Reprends là où tu en es"
              action={
                <Link to="/quests" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline">
                  Tout explorer <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="space-y-2.5">
              {data2.activeQuests.length === 0 && (
                <p className="panel p-6 text-center text-[13px] text-fg-muted">
                  Aucune quête en cours. <Link to="/quests" className="font-semibold text-primary hover:underline">Démarrez-en une</Link>.
                </p>
              )}
              {data2.activeQuests.map((quest) => (
                <QuestRow key={quest.id} quest={quest} />
              ))}
            </div>
          </section>
        </div>

        {/* ------------------------------------------------ colonne droite */}
        <div className="space-y-5 lg:col-span-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Missions</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Objectifs de la semaine</h3>
              </div>
              <Link to="/missions" className="text-[12.5px] font-semibold text-primary hover:underline">
                Tout voir
              </Link>
            </div>
            <div className="space-y-3.5">
              {data2.nextMissions.slice(0, 3).map((mission) => (
                <div key={mission.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-fg">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary-soft text-[12px] text-primary">
                        {mission.icon}
                      </span>
                      <span className="truncate">{mission.title}</span>
                    </span>
                    <span className="shrink-0 text-[11.5px] font-semibold text-fg-subtle">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                  <Progress value={Math.round((mission.progress / mission.target) * 100)} className="h-1.5" tone="accent" />
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Tes récompenses</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Badges récents</h3>
              </div>
              <Link to="/badges" className="text-[12.5px] font-semibold text-primary hover:underline">
                Ma collection
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {data2.recentBadges.map((badge) => (
                <div key={badge.code} className="group text-center">
                  <div
                    className={cn(
                      'mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-[22px] font-bold text-white shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-1',
                      badge.rarity === 'legendaire' && 'from-[#f59e0b] via-[#f97316] to-[#c5027f]',
                      badge.rarity === 'epique' && 'from-[#c5027f] to-[#6701e6]',
                      badge.rarity === 'rare' && 'from-[#00b8d4] to-[#6701e6]',
                      badge.rarity === 'commun' && 'from-[#8b8b96] to-[#5b5b66]',
                    )}
                  >
                    {badge.icon}
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold text-fg">{badge.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-fg-subtle">{badge.track}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Hall of fame</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Top du mois</h3>
              </div>
              <Link to="/leaderboard" className="text-[12.5px] font-semibold text-primary hover:underline">
                Classement
              </Link>
            </div>
            <div className="space-y-2">
              {data2.leaderboardPreview.map((entry) => (
                <div
                  key={entry.userId + entry.rank}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors',
                    entry.isCurrentUser ? 'bg-primary-soft' : 'hover:bg-surface-2',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[12px] font-bold',
                      entry.rank === 1 ? 'bg-[#f59e0b]/15 text-[#b45309]' : entry.rank === 2 ? 'bg-[#94a3b8]/20 text-slate-600' : entry.rank === 3 ? 'bg-[#b45309]/15 text-[#92400e]' : 'text-fg-subtle',
                    )}
                  >
                    {entry.rank === 1 ? <Trophy className="h-3.5 w-3.5" /> : entry.rank}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-fg">{entry.pseudonym}</span>
                    <span className="block truncate text-[11px] text-fg-subtle">{entry.program}</span>
                  </span>
                  <span className="shrink-0 text-[12.5px] font-bold text-primary tabular-nums">{formatNumber(entry.xp)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-border bg-surface-2 p-5">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/10" />
            <div className="relative">
              <p className="kicker">Ta progression sur les voies</p>
              <div className="mt-3 space-y-3">
                {data2.trackSnapshot.map((track) => (
                  <div key={track.code}>
                    <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
                      <span className="flex items-center gap-1.5 text-fg">
                        <span className="h-2 w-2 rounded-full" style={{ background: track.color }} />
                        {track.name}
                      </span>
                      <span className="text-fg-subtle">{formatNumber(track.points)} pts</span>
                    </div>
                    <Progress
                      value={Math.min(100, Math.round((track.points / (track.nextRank?.threshold ?? 2000)) * 100))}
                      className="h-1.5"
                      indicatorClassName={track.code === 'codeur' ? 'bg-primary' : track.code === 'aidant' ? 'bg-accent' : track.code === 'batisseur' ? 'bg-cyan' : 'bg-warning'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
        <div className="absolute left-4 top-2 font-display text-[64px] leading-none text-primary/10">“</div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[17px] font-bold text-fg">Small steps. Big skills.</p>
            <p className="mt-1 text-[13px] text-fg-muted">
              La régularité est ton super-pouvoir. Reviens demain pour ta prochaine mission.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> 2 486 apprenants
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> 3 h 48 / semaine
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Medal className="h-3.5 w-3.5" /> 1 248 badges
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/paths" className="group panel flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <BadgeCheck className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[16px] font-bold text-fg">Poursuivre un parcours</span>
            <span className="mt-0.5 block truncate text-[12.5px] text-fg-muted">2 parcours en cours · 5 disponibles</span>
          </span>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-1" />
        </Link>
        <Link to="/arena" className="group panel flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Target className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[16px] font-bold text-fg">Relever un défi</span>
            <span className="mt-0.5 block truncate text-[12.5px] text-fg-muted">3 défis ouverts · jusqu’à 2 500 XP</span>
          </span>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  )
}
