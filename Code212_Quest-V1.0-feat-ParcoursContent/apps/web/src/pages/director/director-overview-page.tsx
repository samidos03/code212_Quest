import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ChevronRight,
  Clock3,
  Flame,
  PackageCheck,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts'
import { SuperAdminAvatar, SuperAdminRibbon } from '@/components/shared/super-admin-avatar'
import { useAdminOverview } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { formatCompact, formatNumber, formatRelative } from '@/lib/utils'

export function DirectorOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useAdminOverview()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const { kpis } = data

  const kpiCards = [
    { label: 'Étudiants inscrits', value: formatNumber(kpis.students), delta: `+${kpis.studentsDelta} %`, icon: Users, tone: 'bg-primary-soft text-primary' },
    { label: 'Quêtes publiées', value: String(kpis.activeQuests), delta: `+${kpis.questsDelta} ce mois`, icon: ScrollText, tone: 'bg-accent-soft text-accent' },
    { label: 'Taux de complétion', value: `${kpis.completionRate} %`, delta: `+${kpis.completionDelta} pts`, icon: Zap, tone: 'bg-cyan-soft text-cyan-fg' },
    { label: 'XP distribués', value: formatCompact(kpis.xpDistributed), delta: `+${kpis.xpDelta} %`, icon: Flame, tone: 'bg-warning-soft text-warning' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Direction · Super Admin"
        title="Tableau de bord"
        description="Vue complète de la plateforme Code212 Quest — engagement, contenus, modération et validations."
        actions={
          <Button asChild variant="outline">
            <Link to="/director/analytics">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
          </Button>
        }
      />

      {/* ===================================================== BLOC DIRECTEUR */}
      <section className="relative overflow-hidden rounded-2xl border border-[#e8b84b]/35 bg-surface p-5 shadow-card">
        {/* Halo doré */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,184,75,.38) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(197,2,127,.12) 0%, transparent 70%)' }}
        />

        {/* Art-grid subtile */}
        <div aria-hidden className="art-grid absolute inset-0 opacity-20" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* Avatar + identité */}
          <div className="flex items-center gap-4">
            <SuperAdminAvatar
              size={80}
              className="drop-shadow-[0_12px_28px_rgba(232,184,75,.32)]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-[22px] font-bold leading-tight text-fg">
                  {user?.displayName ?? 'Walid Bouarifi'}
                </h2>
                <SuperAdminRibbon />
              </div>
              <p className="mt-1 text-[13px] text-fg-muted">
                Directeur · Super Admin — Centre CODE212, Université Cadi Ayyad
              </p>
              <p className="mt-0.5 text-[12px] text-fg-subtle">
                Accès complet : contenus, gains, modération, analytics et configuration.
              </p>
            </div>
          </div>

          {/* Accès rapides */}
          <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: ScrollText,   label: 'Publication des quêtes' },
              { icon: ShieldCheck,  label: 'Validation des livrables' },
              { icon: Flame,        label: 'Règles XP et plafonds' },
              { icon: ShieldAlert,  label: 'Modération de La Forge' },
              { icon: PackageCheck, label: 'Commandes et stocks' },
              { icon: BarChart3,    label: 'Analytics et audit' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-xl border border-[#e8b84b]/25 bg-surface-2 px-3 py-2.5"
              >
                <item.icon className="h-4 w-4 shrink-0 text-[#b98a20] dark:text-[#e8b84b]" />
                <span className="text-[12px] font-semibold leading-tight text-fg">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= KPIs */}
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
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${kpi.tone}`}>
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

      {/* ======================================================= Graphique + Top quêtes */}
      <div className="grid gap-5 lg:grid-cols-12">
        <section className="panel p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-4">
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
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.engagement} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="dirActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6701e6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#6701e6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dirDone" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="active" name="Étudiants actifs" stroke="#6701e6" strokeWidth={2.5} fill="url(#dirActive)" />
                <Area type="monotone" dataKey="completed" name="Quêtes terminées" stroke="#00b8d4" strokeWidth={2.5} fill="url(#dirDone)" />
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
            <Link to="/director/quests" className="text-[12.5px] font-semibold text-primary hover:underline">
              Gérer
            </Link>
          </div>
          <div className="space-y-3">
            {data.topQuests.slice(0, 4).map((quest, index) => (
              <div key={quest.id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-3 font-display text-[12px] font-bold text-fg-subtle">
                  0{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">{quest.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={quest.completionRate} className="h-1 max-w-[120px]" />
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
        </section>
      </div>

      {/* ======================================================= Validations + Modération */}
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
            {data.pendingSubmissions.slice(0, 3).map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">{sub.questTitle}</p>
                  <p className="truncate text-[11.5px] text-fg-subtle">
                    {sub.studentPseudonym} · {sub.stepTitle}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-fg-subtle">{formatRelative(sub.submittedAt)}</span>
              </div>
            ))}
          </div>
          <Button asChild variant="soft" className="mt-4 w-full">
            <Link to="/director/validation">
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
            {data.moderationQueue.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
                  <ShieldAlert className="h-4 w-4" />
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
            <Link to="/director/moderation">
              Ouvrir la modération <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
