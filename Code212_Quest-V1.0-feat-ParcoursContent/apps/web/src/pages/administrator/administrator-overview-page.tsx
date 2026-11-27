import { BarChart3, Flame, Settings2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

const cards = [
  { label: 'Étudiants', desc: 'Gérer les comptes et les rôles', icon: Users, to: '/administrator/students', color: 'text-primary bg-primary-soft' },
  { label: 'Analytics', desc: 'KPIs et métriques de la plateforme', icon: BarChart3, to: '/administrator/analytics', color: 'text-cyan-fg bg-cyan-soft' },
  { label: 'Règles XP', desc: 'Barèmes et plafonds journaliers', icon: Flame, to: '/administrator/rules', color: 'text-warning bg-warning-soft' },
  { label: 'Configuration', desc: 'Paramètres globaux du centre', icon: Settings2, to: '/administrator/settings', color: 'text-accent bg-accent-soft' },
]

export function AdministratorOverviewPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker mb-1">Administrateur</p>
        <h1 className="font-display text-[26px] font-bold text-fg">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Gestion globale de la plateforme Code212 Quest.
        </p>
      </div>

      {/* Quick access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.to}
              to={card.to}
              className="panel flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-[15px] font-bold text-fg">{card.label}</p>
                <p className="mt-0.5 text-[13px] text-fg-muted">{card.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Placeholder content */}
      <div className="panel p-8 text-center">
        <p className="font-display text-lg font-bold text-fg">Vue d&rsquo;ensemble administrateur</p>
        <p className="mt-2 text-sm text-fg-muted">
          Les widgets Analytics, KPIs et actions rapides seront affichés ici.
        </p>
      </div>
    </div>
  )
}
