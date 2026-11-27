import { BarChart3, BookOpenCheck, ScrollText, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

const cards = [
  { label: 'Quêtes', desc: 'Créer et publier du contenu', icon: ScrollText, to: '/team/quests', color: 'text-primary bg-primary-soft' },
  { label: 'Parcours', desc: 'Séquencer les apprentissages', icon: BookOpenCheck, to: '/team/paths', color: 'text-cyan-fg bg-cyan-soft' },
  { label: 'Validation', desc: 'Livrables en attente de relecture', icon: ShieldCheck, to: '/team/validation', color: 'text-warning bg-warning-soft', badge: '3' },
  { label: 'Étudiants', desc: 'Annuaire et suivi individuel', icon: Users, to: '/team/students', color: 'text-success bg-success-soft' },
  { label: 'Analytics', desc: 'Engagement et progression', icon: BarChart3, to: '/team/analytics', color: 'text-accent bg-accent-soft' },
]

export function TeamOverviewPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker mb-1">Équipe Code212</p>
        <h1 className="font-display text-[26px] font-bold text-fg">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Espace formateurs, mentors et équipe pédagogique.
        </p>
      </div>

      {/* Quick access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-bold text-warning">
                    {card.badge} en attente
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
        <p className="font-display text-lg font-bold text-fg">Tableau de bord équipe</p>
        <p className="mt-2 text-sm text-fg-muted">
          Statistiques de classe, activité récente et livrables à valider apparaîtront ici.
        </p>
      </div>
    </div>
  )
}
