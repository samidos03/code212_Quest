import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Clock3,
  Coins,
  Flame,
  Medal,
  PackageCheck,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts'
import { useAdminOverview } from '@/hooks/use-api'
import { SuperAdminAvatar, SuperAdminRibbon } from '@/components/shared/super-admin-avatar'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCompact, formatNumber, formatRelative } from '@/lib/utils'

export function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const { kpis } = data

  const kpiCards = [
    { label: 'Étudiants inscrits', value: formatNumber(kpis.students), delta: `+${kpis.studentsDelta} %`, icon: Users, tone: 'bg-primary-soft text-primary' },
    { label: 'Quêtes publiées', value: String(kpis.activeQuests), delta: `+${kpis.questsDelta} ce mois`, icon: ScrollText, tone: 'bg-accent-soft text-accent' },
    { label: 'Taux de complétion', value: `${kpis.completionRate} %`, delta: `+${kpis.completionDelta} pts`, icon: Target, tone: 'bg-cyan-soft text-cyan-fg' },
    { label: 'XP distribués', value: formatCompact(kpis.xpDistributed), delta: `+${kpis.xpDelta} %`, icon: Zap, tone: 'bg-warning-soft text-warning' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Centre de pilotage"
        title="Vue d’ensemble"
        description="L’état de la plateforme : engagement, contenus, validations en attente et files de modération."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/analytics">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/quests">
                <Sparkles className="h-4 w-4" /> Gérer les quêtes
              </Link>
            </Button>
          </>
        }
      />

      {/* ------------------------------------------------------ direction */}
      <section className="relative overflow-hidden rounded-2xl border border-[#e8b84b]/30 bg-surface p-5 shadow-[var(--shadow-card)]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-45 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,184,75,.45) 0%, transparent 68%)' }}
        />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <SuperAdminAvatar size={76} className="drop-shadow-[0_10px_24px_rgba(232,184,75,.28)]" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-[20px] font-bold leading-tight text-fg">Walid Bouarifi</h2>
                <SuperAdminRibbon />
              </div>
              <p className="mt-1 text-[12.5px] text-fg-muted">Directeur · Super Admin — Centre CODE212, Université Cadi Ayyad</p>
              <p className="mt-0.5 text-[11.5px] text-fg-subtle">
                Compte de direction : accès complet aux contenus, aux gains et à la modération.
              </p>
            </div>
          </div>

          <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: ScrollText, label: 'Publication des quêtes' },
              { icon: ShieldCheck, label: 'Validation des livrables' },
              { icon: Flame, label: 'Règles XP et plafonds' },
              { icon: Medal, label: 'Modération de La Forge' },
              { icon: PackageCheck, label: 'Commandes et stocks' },
              { icon: BarChart3, label: 'Analytics et audit' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                <item.icon className="h-4 w-4 shrink-0 text-[#b98a20] dark:text-[#e8b84b]" />
                <span className="text-[12px] font-semibold leading-tight text-fg">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="panel p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={cnTone(kpi.tone)}>
                <kpi.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10.5px] font-bold text-success">
                <TrendingUp className="h-3 w-3" /> {kpi.delta}
              </span>
            </div>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{kpi.label}</p>
            <p className="mt-0.5 font-display text-[27px] font-bold leading-none text-fg">{kpi.value}</p>
          </motion.div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="panel p-5 lg:col-span-7">
          <div className="mb-4 flex flex-start items-center justify-between gap-4">
            <div>
              <p className="kicker">Engagement</p>
              <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Activité de la plateforme</h3>
            </div>
            <div className="hidden items-center gap-4 text-[11.5px] font-semibold text-fg-muted sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-primary" /> Étudiants actifs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-cyan" /> Quêtes terminées
              </span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.engagement} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6701e6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#6701e6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b8d4" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#00b8d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" className="text-border" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" dy={8} />
                <RechartsTooltip
                  contentStyle={{
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    background: 'hsl(var(--surface))',
                    fontSize: 12,
                    boxShadow: 'var(--shadow-card)',
                  }}
                />
                <Area type="monotone" dataKey="active" name="Étudiants actifs" stroke="#6701e6" strokeWidth={2.5} fill="url(#adminActive)" />
                <Area type="monotone" dataKey="completed" name="Quêtes terminées" stroke="#00b8d4" strokeWidth={2.5} fill="url(#adminDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Top performances</p>
              <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Quêtes les plus suivies</h3>
            </div>
            <Link to="/admin/quests" className="text-[12.5px] font-semibold text-primary hover:underline">
              Gérer
            </Link>
          </div>
          <div className="space-y-3">
            {data.topQuests.map((quest, index) => (
              <div key={quest.id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-3 font-display text-[12px] font-bold text-fg-subtle">
                  0{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">{quest.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={quest.completionRate} className="h-1 max-w-[140px]" />
                    <span className="text-[11px] font-semibold text-fg-subtle">{quest.completionRate} %</span>
                  </div>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-[13px] font-bold text-fg tabular-nums">{quest.participants}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-fg-subtle">inscrits</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="kicker mb-3">Répartition par voie</p>
            <div className="space-y-2.5">
              {data.trackDistribution.map((track) => (
                <div key={track.track}>
                  <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
                    <span className="flex items-center gap-1.5 text-fg">
                      <span className="h-2 w-2 rounded-full" style={{ background: track.color }} />
                      {track.name}
                    </span>
                    <span className="text-fg-subtle">{formatNumber(track.points)} pts · {track.students} étudiants</span>
                  </div>
                  <Progress
                    value={(track.points / data.trackDistribution[0].points) * 100}
                    className="h-1.5"
                    indicatorClassName={
                      track.track === 'codeur'
                        ? 'bg-primary'
                        : track.track === 'aidant'
                          ? 'bg-accent'
                          : track.track === 'batisseur'
                            ? 'bg-cyan'
                            : 'bg-warning'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Validations en attente</p>
              <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Livrables à traiter</h3>
            </div>
            <Badge variant="warning">{kpis.pendingSubmissions}</Badge>
          </div>
          <div className="space-y-2.5">
            {data.pendingSubmissions.slice(0, 4).map((submission) => (
              <div key={submission.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">{submission.questTitle}</p>
                  <p className="truncate text-[11.5px] text-fg-subtle">
                    {submission.studentPseudonym} · {submission.stepTitle}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-fg-subtle">{formatRelative(submission.submittedAt)}</span>
              </div>
            ))}
            {data.pendingSubmissions.length === 0 && (
              <p className="py-6 text-center text-[13px] text-fg-muted">Aucune validation en attente. Tout est à jour.</p>
            )}
          </div>
          <Button asChild variant="soft" className="mt-4 w-full">
            <Link to="/admin/validation">
              Traiter les livrables <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Modération</p>
              <h3 className="mt-1 font-display text-[18px] font-bold text-fg">File de signalements</h3>
            </div>
            <Badge variant="danger">{kpis.moderationQueue}</Badge>
          </div>
          <div className="space-y-2.5">
            {data.moderationQueue.slice(0, 4).map((report) => (
              <div key={report.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">{report.title}</p>
                  <p className="truncate text-[11.5px] text-fg-subtle">
                    {report.reason} · signalé par {report.reporter}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="soft" className="mt-4 w-full">
            <Link to="/admin/moderation">
              Ouvrir la modération <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>

      <section className="panel grid gap-4 p-5 sm:grid-cols-3">
        {[
          { icon: Activity, label: 'Temps moyen / semaine', value: `${Math.round(kpis.avgSessionMinutes / 60)} h ${kpis.avgSessionMinutes % 60} min`, hint: 'Par apprenant actif' },
          { icon: Coins, label: 'Germes en circulation', value: formatNumber(184600), hint: 'Solde boutique cumulé' },
          { icon: Flame, label: 'Taux de complétion', value: `${kpis.completionRate} %`, hint: 'Toutes voies confondues' },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-fg-muted">
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{item.label}</p>
              <p className="mt-0.5 font-display text-[20px] font-bold leading-none text-fg">{item.value}</p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">{item.hint}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white">
        <div className="art-grid absolute inset-0 opacity-15" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-display text-[18px] font-bold">Prêt à publier un nouveau défi ?</p>
              <p className="mt-1 text-[13px] text-white/80">
                Créez une quête avec ses étapes, ses barèmes XP et ses critères de validation.
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" className="bg-white text-[#6701e6] hover:bg-white/90">
            <Link to="/admin/quests">
              Créer une quête <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function cnTone(tone: string) {
  return `grid h-9 w-9 place-items-center rounded-xl ${tone}`
}
