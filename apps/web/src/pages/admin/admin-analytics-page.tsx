import { Activity, BarChart3, CheckCircle2, Clock3, Users, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminOverview, useBadges, useLevels } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TRACK_LABEL, cn, formatCompact, formatNumber } from '@/lib/utils'

const tooltipStyle = {
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  background: 'hsl(var(--surface))',
  fontSize: 12,
  boxShadow: 'var(--shadow-card)',
}

export function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminOverview()
  const { data: badges } = useBadges()
  const { data: levels } = useLevels()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const earnedByRarity = ['commun', 'rare', 'epique', 'legendaire'].map((rarity) => ({
    name: rarity,
    count: (badges ?? []).filter((b) => b.rarity === rarity && b.earned).length,
    total: (badges ?? []).filter((b) => b.rarity === rarity).length,
  }))

  const trackPie = data.trackDistribution.map((track) => ({
    name: track.name,
    value: track.points,
    color: track.color,
  }))

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Mesure"
        title="Analytics & insights"
        description="Engagement, progression et répartition des compétences. Les cohortes sont agrégées : aucune donnée nominative n’est exposée dans ces vues."
        actions={<Badge variant="primary">Données simulées</Badge>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: 'Utilisateurs actifs / mois', value: '1 894', delta: '+9,2 %' },
          { icon: CheckCircle2, label: 'Taux de complétion', value: `${data.kpis.completionRate} %`, delta: '+4,1 pts' },
          { icon: Zap, label: 'XP distribués', value: formatCompact(data.kpis.xpDistributed), delta: '+16,3 %' },
          { icon: Clock3, label: 'Temps moyen / semaine', value: `${Math.floor(data.kpis.avgSessionMinutes / 60)} h ${data.kpis.avgSessionMinutes % 60}`, delta: '+0,6 h' },
        ].map((item) => (
          <div key={item.label} className="panel p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10.5px] font-bold text-success">↗ {item.delta}</span>
            </div>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{item.label}</p>
            <p className="mt-0.5 font-display text-[26px] font-bold leading-none text-fg">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="kicker">Tendance</p>
            <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Engagement hebdomadaire</h3>
          </div>
          <Badge variant="outline">7 derniers jours</Badge>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.engagement} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="anaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6701e6" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="#6701e6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="currentColor" className="text-border" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="active" name="Étudiants actifs" stroke="#6701e6" strokeWidth={2.5} fill="url(#anaFill)" />
              <Area type="monotone" dataKey="completed" name="Quêtes terminées" stroke="#00b8d4" strokeWidth={2.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <p className="kicker">Compétences</p>
          <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Répartition des points par voie</h3>
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trackPie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="none">
                  {trackPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${formatNumber(value)} pts`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {data.trackDistribution.map((track) => (
              <div key={track.track} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 font-semibold text-fg">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: track.color }} />
                  {TRACK_LABEL[track.track]}
                </span>
                <span className="text-fg-muted">{formatNumber(track.points)} pts · {track.students} étudiants</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <p className="kicker">Badges</p>
          <h3 className="mt-1 font-display text-[18px] font-bold text-fg">Obtenus par rareté</h3>
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={earnedByRarity} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" className="text-border" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-fg-subtle" />
                <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--surface-3))' }} />
                <Bar dataKey="total" name="Catalogue" fill="hsl(var(--surface-3))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="count" name="Obtenus" fill="#6701e6" radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {earnedByRarity.map((rarity) => (
              <div key={rarity.name}>
                <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
                  <span className="capitalize text-fg">{rarity.name}</span>
                  <span className="text-fg-subtle">
                    {rarity.count}/{rarity.total}
                  </span>
                </div>
                <Progress value={rarity.total ? (rarity.count / rarity.total) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="kicker">Paliers</p>
          <h3 className="mt-1 font-display text-[17px] font-bold text-fg">Distribution des apprenants par niveau</h3>
        </div>
        <div className="divide-y divide-border">
          {(levels ?? []).map((level, index) => {
            const share = [4, 9, 14, 18, 16, 13, 10, 7, 5, 4][index] ?? 3
            return (
              <div key={level.level} className="flex items-center gap-4 px-5 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-3 font-display text-[14px] font-bold text-fg-muted">
                  {level.level}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-fg">{level.title}</span>
                  <span className="block text-[11.5px] text-fg-subtle">à partir de {formatNumber(level.xpThreshold)} XP</span>
                </span>
                <span className="hidden w-40 sm:block">
                  <Progress value={share * 4} className="h-1.5" />
                </span>
                <span className="w-16 shrink-0 text-right font-display text-[15px] font-bold text-fg tabular-nums">{share} %</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className={cn('panel flex items-start gap-3 p-5')}>
        <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-[13px] font-semibold text-fg">Cadre d’analyse</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
            Les vues cohortes s’appuient sur des sources autorisées, avec agrégation et contrôle de confidentialité.
            L’analyste de plateforme ne dispose d’aucun accès aux données de session individuelles hors des agrégats
            affichés ici.
          </p>
        </div>
      </section>

      <section className="panel flex items-start gap-3 p-5">
        <Activity className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="text-[13px] font-semibold text-fg">Prochaine étape</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
            Brancher ces indicateurs sur les tables de fait (missions, quêtes, présence) une fois le moteur de ledger
            en production, et ajouter l’export de rapports pour le conseil pédagogique de l’université.
          </p>
        </div>
      </section>
    </div>
  )
}
