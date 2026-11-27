import { Link } from 'react-router-dom'
import { BookOpenCheck, Clock3, Sparkles, Target, Zap } from 'lucide-react'
import { usePaths } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { DIFFICULTY_LABEL, TRACK_LABEL, cn, formatNumber } from '@/lib/utils'

const gradients: Record<string, string> = {
  violet: 'from-[#6701e6] to-[#c5027f]',
  magenta: 'from-[#c5027f] to-[#6701e6]',
  cyan: 'from-[#00b8d4] to-[#6701e6]',
  orange: 'from-[#f59e0b] to-[#c5027f]',
}

export function PathsPage() {
  const { data: paths, isLoading } = usePaths()

  return (
    <div>
      <PageHeader
        kicker="Apprentissage guidé"
        title="Parcours de compétences"
        description="Des séquences de quêtes ordonnées pour construire une compétence complète, du premier pas jusqu’à la certification."
        actions={<Badge variant="primary">{paths?.length ?? 0} parcours</Badge>}
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(paths ?? []).map((path) => (
            <article key={path.id} className="panel group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <div className={cn('relative bg-gradient-to-br p-5 text-white', gradients[path.gradient] ?? gradients.violet)}>
                <div className="art-grid absolute inset-0 opacity-20 mix-blend-overlay" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
                      <Sparkles className="h-3 w-3" /> {TRACK_LABEL[path.track]}
                    </span>
                    <h2 className="mt-2.5 font-display text-[21px] font-bold leading-tight">{path.title}</h2>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-[22px] font-bold backdrop-blur-sm">
                    {path.icon}
                  </span>
                </div>
                <div className="relative mt-3 flex flex-wrap items-center gap-4 text-[12px] font-medium text-white/85">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenCheck className="h-3.5 w-3.5" /> {path.quests.length} quêtes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" /> {path.estimatedHours} h
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> {DIFFICULTY_LABEL[path.level]}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> {formatNumber(path.xpReward)} XP
                  </span>
                </div>
              </div>

              <div className="p-5">
                <p className="text-[13px] leading-relaxed text-fg-muted">{path.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {path.skills.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-fg-muted">Progression du parcours</span>
                    <span className="text-primary">{path.progress} %</span>
                  </div>
                  <Progress value={path.progress} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  {path.enrolled ? (
                    <Badge variant="success">Inscrit · en cours</Badge>
                  ) : (
                    <Badge variant="outline">Non inscrit</Badge>
                  )}
                  <Link
                    to="/quests"
                    className="text-[12.5px] font-semibold text-primary transition-transform hover:translate-x-0.5"
                  >
                    Voir les quêtes →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
