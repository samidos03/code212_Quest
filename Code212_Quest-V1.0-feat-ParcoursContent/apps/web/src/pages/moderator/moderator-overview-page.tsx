import { MessageSquareText, Medal, ScrollText, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

const cards = [
  { label: 'File de modération', desc: 'Contenus signalés à traiter', icon: ShieldAlert, to: '/moderator/queue', color: 'text-danger bg-danger-soft', badge: '4' },
  { label: 'Rapports', desc: 'Historique des signalements', icon: Medal, to: '/moderator/reports', color: 'text-warning bg-warning-soft' },
  { label: 'Journal d\u2019audit', desc: 'Toutes les actions effectuées', icon: ScrollText, to: '/moderator/audit', color: 'text-fg-muted bg-surface-3' },
  { label: 'Discussions Forge', desc: 'Superviser les échanges', icon: MessageSquareText, to: '/moderator/forge', color: 'text-primary bg-primary-soft' },
]

export function ModeratorOverviewPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker mb-1">Modération</p>
        <h1 className="font-display text-[26px] font-bold text-fg">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Supervision de la communauté Code212 Quest.
        </p>
      </div>

      {/* Alert banner si file non vide */}
      <div className="flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-[13px] font-semibold text-danger">4 éléments en attente de modération</p>
          <p className="text-[12px] text-fg-muted">Traitez la file dès que possible pour maintenir la qualité des échanges.</p>
        </div>
        <Link
          to="/moderator/queue"
          className="ml-auto shrink-0 rounded-lg bg-danger px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110"
        >
          Voir la file
        </Link>
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
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {card.badge && (
                  <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger">
                    {card.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="font-display text-[15px] font-bold text-fg">{card.label}</p>
                <p className="mt-0.5 text-[13px] text-fg-muted">{card.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Placeholder */}
      <div className="panel p-8 text-center">
        <p className="font-display text-lg font-bold text-fg">Tableau de bord modérateur</p>
        <p className="mt-2 text-sm text-fg-muted">
          Métriques de modération, tendances et historique détaillé apparaîtront ici.
        </p>
      </div>
    </div>
  )
}
