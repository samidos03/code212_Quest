import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  HelpCircle,
  Lock,
  Send,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { useEnrollPath, useModuleDetail, usePath, usePaths, useSubmitExercise, useSubmitStep } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { DIFFICULTY_LABEL, TRACK_LABEL, cn, formatNumber } from '@/lib/utils'
import type { LearningPath, LessonExercise, ModuleLesson, ModuleStatus, PathModuleSummary } from '@/types'

const gradients: Record<string, string> = {
  violet: 'from-[#6701e6] to-[#c5027f]',
  magenta: 'from-[#c5027f] to-[#6701e6]',
  cyan: 'from-[#00b8d4] to-[#6701e6]',
  orange: 'from-[#f59e0b] to-[#c5027f]',
}

const statusBadgeConfig: Record<ModuleStatus, { label: string; variant: 'outline' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  non_inscrit: { label: 'Non inscrit', variant: 'outline' },
  verrouille: { label: 'Verrouillé', variant: 'outline' },
  disponible: { label: 'Disponible', variant: 'primary' },
  en_cours: { label: 'En cours', variant: 'primary' },
  quete_debloquee: { label: 'Quête débloquée', variant: 'primary' },
  en_attente: { label: 'En attente de correction', variant: 'warning' },
  a_revoir: { label: 'À reprendre', variant: 'danger' },
  termine: { label: 'Validé', variant: 'success' },
}

export function PathsPage() {
  const { data: paths, isLoading } = usePaths()
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)

  const activePath = paths?.find((p) => p.id === selectedPathId)

  if (selectedPathId && selectedModuleId && activePath) {
    return (
      <ModuleViewer
        path={activePath}
        moduleId={selectedModuleId}
        onBack={() => setSelectedModuleId(null)}
      />
    )
  }

  if (selectedPathId && activePath) {
    return (
      <PathDetailView
        path={activePath}
        onSelectModule={(modId) => setSelectedModuleId(modId)}
        onBack={() => setSelectedPathId(null)}
      />
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Apprentissage guidé"
        title="Parcours de compétences"
        description="Des séquences de modules ordonnés pour construire une compétence complète, du premier cours jusqu’à la quête finale validée par un formateur."
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
            <article
              key={path.id}
              className="panel group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
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
                    <BookOpenCheck className="h-3.5 w-3.5" /> {path.modules?.length ?? 0} modules
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
                  <Button
                    size="sm"
                    onClick={() => setSelectedPathId(path.id)}
                    className="gap-1.5 text-[12.5px]"
                  >
                    Voir les modules →
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function PathDetailView({
  path,
  onSelectModule,
  onBack,
}: {
  path: LearningPath
  onSelectModule: (moduleId: number) => void
  onBack: () => void
}) {
  const { data: detailedPath, isLoading, isError, refetch } = usePath(path.id)
  const enroll = useEnrollPath()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (isError || !detailedPath) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-danger">Impossible de charger les modules de ce parcours.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Retour aux parcours
          </Button>
        </div>
      </div>
    )
  }

  const currentPath = detailedPath

  const handleEnroll = () => {
    enroll.mutate(currentPath.id, {
      onSuccess: () => {
        toast('Inscription validée', {
          description: `Vous êtes maintenant inscrit au ${currentPath.title}.`,
          kind: 'success',
        })
      },
    })
  }

  const modules: PathModuleSummary[] = currentPath.modules ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-fg-muted">
          <ArrowLeft className="h-4 w-4" /> Retour aux parcours
        </Button>
      </div>

      <div className="panel overflow-hidden">
        <div className={cn('p-6 text-white bg-gradient-to-br', gradients[currentPath.gradient] ?? gradients.violet)}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> {TRACK_LABEL[currentPath.track]}
          </span>
          <h1 className="mt-3 font-display text-[26px] font-bold leading-tight">{currentPath.title}</h1>
          <p className="mt-2 text-[14px] text-white/85 max-w-2xl">{currentPath.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] font-medium text-white/90">
            <span>{modules.length} modules ordonnés</span>
            <span>·</span>
            <span>+{formatNumber(currentPath.xpReward)} XP</span>
            <span>·</span>
            <span>{DIFFICULTY_LABEL[currentPath.level]}</span>
          </div>
        </div>

        <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-2/30">
          <div>
            <div className="text-[12px] font-semibold text-fg-muted">Progression globale</div>
            <div className="text-[18px] font-bold text-fg">{currentPath.progress} %</div>
          </div>
          {!currentPath.enrolled && (
            <Button onClick={handleEnroll} disabled={enroll.isPending} className="gap-2">
              <Sparkles className="h-4 w-4" /> S'inscrire à ce parcours
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-[19px] font-bold text-fg">Modules du parcours</h2>

        {modules.length === 0 ? (
          <div className="panel p-8 text-center text-fg-muted">
            Aucun module configuré pour ce parcours.
          </div>
        ) : (
          <div className="grid gap-3">
            {modules.map((mod) => {
              const cfg = statusBadgeConfig[mod.status] ?? statusBadgeConfig.non_inscrit
              const isLocked = mod.status === 'verrouille' || mod.status === 'non_inscrit'

              return (
                <div
                  key={mod.id}
                  className={cn(
                    'panel p-5 transition-all flex flex-wrap items-center justify-between gap-4',
                    isLocked ? 'opacity-70 bg-surface-2/40' : 'hover:border-primary/50'
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-[14px] font-bold',
                        mod.status === 'termine' && 'border-success/30 bg-success-soft text-success',
                        mod.status === 'en_attente' && 'border-warning/30 bg-warning-soft text-warning',
                        mod.status === 'a_revoir' && 'border-danger/30 bg-danger-soft text-danger',
                        (mod.status === 'en_cours' || mod.status === 'quete_debloquee') && 'border-primary/30 bg-primary-soft text-primary',
                        isLocked && 'border-border bg-surface-2 text-fg-subtle'
                      )}
                    >
                      {mod.status === 'termine' ? (
                        <Check className="h-5 w-5" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        mod.order
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider">
                          Module {mod.order}
                        </span>
                        <Badge variant={cfg.variant} className="text-[11px]">
                          {cfg.label}
                        </Badge>
                      </div>
                      <h3 className="mt-1 font-display text-[16.5px] font-bold text-fg">{mod.title}</h3>
                      {mod.description && (
                        <p className="mt-1 text-[13px] text-fg-muted leading-relaxed">{mod.description}</p>
                      )}
                      {mod.exercisesTotal > 0 && (
                        <div className="mt-2 text-[12px] text-fg-subtle flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-primary" />
                          Exercices réussis : {mod.exercisesPassed} / {mod.exercisesTotal}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <span className="text-[12px] text-fg-subtle italic flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Module verrouillé
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => onSelectModule(mod.id)} className="gap-1.5">
                        {mod.status === 'termine' ? 'Revoir le module' : 'Continuer le module'} →
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ModuleViewer({
  path,
  moduleId,
  onBack,
}: {
  path: LearningPath
  moduleId: number
  onBack: () => void
}) {
  const { data: moduleDetail, isLoading, error } = useModuleDetail(path.id, moduleId)
  const [selectedView, setSelectedView] = useState<'chapter' | 'quest'>('chapter')
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !moduleDetail) {
    return (
      <div className="panel p-8 text-center text-danger">
        Impossible de charger le contenu de ce module.
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
          Retour au parcours
        </Button>
      </div>
    )
  }

  const currentLesson: ModuleLesson | undefined = moduleDetail.lessons[activeLessonIndex]
  const finalQuest = moduleDetail.finalQuest
  const isFinalQuestApproved = finalQuest?.submission?.status === 'validee' || finalQuest?.submission?.status === 'approuvee' || moduleDetail.status === 'termine'

  const handleNext = () => {
    if (activeLessonIndex < moduleDetail.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setSelectedView('quest')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête de navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-fg-muted">
          <ArrowLeft className="h-4 w-4" /> Retour au parcours {path.title}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeConfig[moduleDetail.status]?.variant ?? 'outline'}>
            {statusBadgeConfig[moduleDetail.status]?.label ?? moduleDetail.status}
          </Badge>
        </div>
      </div>

      {/* Titre et description du module */}
      <div className="panel p-6">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-primary">
          <Sparkles className="h-4 w-4" /> Module {moduleDetail.order} · {path.title}
        </div>
        <h1 className="mt-2 font-display text-[24px] font-bold text-fg">{moduleDetail.title}</h1>
        {moduleDetail.description && (
          <p className="mt-1 text-[13.5px] text-fg-muted leading-relaxed">{moduleDetail.description}</p>
        )}

        {/* Bannière clarifiant le caractère optionnel des cours et obligatoire de la quête */}
        <div className="mt-4 p-3.5 rounded-xl bg-surface-2 border border-border flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-2 text-fg-muted">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong className="text-fg">Apprentissage flexible :</strong> Les chapitres et quiz QCM sont <em>optionnels</em>. Seule la <strong>quête finale</strong> est requise pour valider le module.
            </span>
          </div>
          {selectedView !== 'quest' && finalQuest && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedView('quest')}
              className="gap-1.5 text-[12px] text-accent border-accent/40 hover:bg-accent/10 shrink-0"
            >
              <Trophy className="h-3.5 w-3.5" /> Passer à la quête finale
            </Button>
          )}
        </div>
      </div>

      {/* Disposition apprentissage : Sidebar Chapitres + Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation latérale style W3Schools */}
        <aside className="space-y-4 lg:col-span-1">
          <div className="panel p-3 space-y-3">
            <div className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-fg-subtle">
              Sommaire du module
            </div>

            {/* Liste ordonnée des chapitres */}
            <div className="space-y-1">
              {moduleDetail.lessons.map((lesson, idx) => {
                const isActive = selectedView === 'chapter' && idx === activeLessonIndex
                const allPassed = lesson.exercises.length > 0 && lesson.exercises.every((ex) => ex.passed)

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedView('chapter')
                      setActiveLessonIndex(idx)
                    }}
                    className={cn(
                      'w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-between gap-2 border-l-4',
                      isActive
                        ? 'border-primary bg-primary-soft text-primary font-bold shadow-sm'
                        : 'border-transparent text-fg-muted hover:bg-surface-2 hover:text-fg'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-fg-subtle font-mono">{idx + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {allPassed && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-border pt-3">
              <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                Étape requise
              </div>

              {/* Bouton quête finale obligatoire */}
              {finalQuest && (
                <button
                  onClick={() => setSelectedView('quest')}
                  className={cn(
                    'w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-between gap-2 border-l-4',
                    selectedView === 'quest'
                      ? 'border-accent bg-accent-soft text-accent font-bold shadow-sm'
                      : 'border-transparent text-fg hover:bg-surface-2'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy className="h-4 w-4 text-accent shrink-0" />
                    <span className="truncate font-semibold">{finalQuest.title}</span>
                  </div>
                  {isFinalQuestApproved ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <Badge variant="warning" className="text-[10px] px-1.5 py-0">Obligatoire</Badge>
                  )}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Contenu principal : Chapitre ou Quête finale */}
        <main className="lg:col-span-3 space-y-6">
          {selectedView === 'chapter' && currentLesson && (
            <div className="space-y-6">
              {/* Carte principale de cours */}
              <article className="panel p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="kicker">Chapitre {activeLessonIndex + 1} sur {moduleDetail.lessons.length}</span>
                    <Badge variant="outline" className="text-[11px]">Optionnel</Badge>
                  </div>
                  <span className="text-[12px] text-fg-subtle flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" /> ~{currentLesson.durationMinutes} min de lecture
                  </span>
                </div>

                <h2 className="font-display text-[22px] font-bold text-fg">
                  {currentLesson.title}
                </h2>

                {currentLesson.summary && (
                  <p className="text-[14px] text-fg-muted leading-relaxed">
                    {currentLesson.summary}
                  </p>
                )}

                {/* Points clés à retenir */}
                {currentLesson.keyPoints && currentLesson.keyPoints.length > 0 && (
                  <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-2.5">
                    <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Points clés à retenir
                    </h4>
                    <ul className="space-y-1.5 text-[13.5px] text-fg">
                      {currentLesson.keyPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bloc Exemple inspiré de la capture W3Schools */}
                {currentLesson.exampleCode && (
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-border bg-[#161a23] overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1b202c] border-b border-border/40 text-[12.5px] font-bold text-fg">
                        <span className="flex items-center gap-2 font-display">
                          <Code2 className="h-4 w-4 text-primary" /> Exemple
                        </span>
                        <span className="text-[11px] text-fg-subtle font-mono">Original Code212</span>
                      </div>
                      <pre className="p-4 text-[13px] font-mono text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre">
                        {currentLesson.exampleCode}
                      </pre>
                    </div>

                    {currentLesson.exampleExplanation && (
                      <p className="text-[13px] text-fg-muted italic px-1 leading-relaxed">
                        <strong className="text-fg not-italic font-semibold">Explication :</strong> {currentLesson.exampleExplanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Contenu textuel complémentaire */}
                {currentLesson.content && (
                  <div className="text-[13.5px] text-fg-muted leading-relaxed pt-2 border-t border-border">
                    {currentLesson.content}
                  </div>
                )}
              </article>

              {/* Quiz QCM interactif à validation serveur */}
              {currentLesson.exercises.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <h3 className="font-display text-[17px] font-bold text-fg flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Auto-évaluation QCM (Optionnel)
                    </h3>
                    <span className="text-[12px] text-fg-subtle">
                      Vérification serveur sans divulgation de réponse
                    </span>
                  </div>

                  {currentLesson.exercises.map((exercise) => (
                    <QcmExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      pathId={path.id}
                      moduleId={moduleId}
                    />
                  ))}
                </div>
              )}

              {/* Contrôles de navigation Précédent / Suivant */}
              <nav aria-label="Navigation entre chapitres" className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={activeLessonIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Chapitre précédent
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="gap-2"
                >
                  {activeLessonIndex < moduleDetail.lessons.length - 1 ? (
                    <>
                      Chapitre suivant <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" /> Accéder à la quête finale (Obligatoire)
                    </>
                  )}
                </Button>
              </nav>
            </div>
          )}

          {selectedView === 'quest' && finalQuest && (
            <FinalQuestCard
              quest={finalQuest}
              moduleStatus={moduleDetail.status}
              onBackToChapters={() => {
                setSelectedView('chapter')
                setActiveLessonIndex(0)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function QcmExerciseCard({
  exercise,
  pathId,
  moduleId,
}: {
  exercise: LessonExercise
  pathId: number
  moduleId: number
}) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [feedback, setFeedback] = useState<{ reussi: boolean; message: string } | null>(
    exercise.passed ? { reussi: true, message: 'Quiz déjà réussi avec succès !' } : null
  )
  // La question affichée reste figée pendant que l'apprenant répond, même si
  // le module est rechargé (et donc retiré au sort) après une tentative.
  const [question, setQuestion] = useState(() => ({
    id: exercise.questionId,
    instructions: exercise.instructions,
    options: exercise.options,
  }))
  const [wantsNewQuestion, setWantsNewQuestion] = useState(false)
  const submit = useSubmitExercise()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!wantsNewQuestion) return
    setQuestion({ id: exercise.questionId, instructions: exercise.instructions, options: exercise.options })
    setSelectedOption('')
    setFeedback(null)
    setWantsNewQuestion(false)
    // Se déclenche quand le module rechargé apporte un nouveau tirage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise])

  const drawAnotherQuestion = () => {
    setWantsNewQuestion(true)
    queryClient.invalidateQueries({ queryKey: ['path', pathId, 'module', moduleId] })
  }

  const handleValidate = () => {
    if (!selectedOption) return

    submit.mutate(
      {
        exerciseId: exercise.id,
        answer: selectedOption,
        questionId: question.id,
        pathId,
        stepId: moduleId,
      },
      {
        onSuccess: (res) => {
          setFeedback(res)
        },
      }
    )
  }

  const isQcm = question.options && question.options.length > 0

  return (
    <div className="panel p-5 space-y-4 border-2 border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-display text-[15px] font-bold text-fg flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> {exercise.title}
        </h4>
        {exercise.passed || feedback?.reussi ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Validé
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-[11px]">
            Tentatives : {exercise.attempts}
          </Badge>
        )}
      </div>

      <p className="text-[13.5px] text-fg font-medium leading-relaxed">
        {question.instructions}
      </p>

      {/* Choix multiples mélangés */}
      {isQcm ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options!.map((opt) => {
            const isSelected = selectedOption === opt.id

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={cn(
                  'w-full text-start p-3 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-3',
                  isSelected
                    ? 'border-primary bg-primary-soft text-primary font-bold shadow-sm'
                    : 'border-border bg-surface hover:bg-surface-2 text-fg'
                )}
              >
                <span className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold uppercase',
                  isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-fg-subtle'
                )}>
                  {opt.id}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-[12px] font-semibold text-fg">Votre réponse :</Label>
          <Textarea
            rows={3}
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="font-mono text-[12.5px] bg-surface-2"
            placeholder="Saisissez votre réponse..."
          />
        </div>
      )}

      {/* Retour serveur sécurisé */}
      {feedback && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-[13px] flex items-start gap-2.5',
            feedback.reussi
              ? 'bg-success-soft text-success border border-success/30'
              : 'bg-danger-soft text-danger border border-danger/30'
          )}
        >
          {feedback.reussi ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <div className="leading-snug">{feedback.message}</div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {exercise.poolSize > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={drawAnotherQuestion}
            disabled={submit.isPending || wantsNewQuestion}
          >
            {wantsNewQuestion ? 'Tirage...' : 'Tirer une autre question'}
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleValidate}
          disabled={submit.isPending || !selectedOption}
          className="gap-2"
        >
          {submit.isPending ? 'Vérification...' : 'Valider ma réponse'}
        </Button>
      </div>
    </div>
  )
}

function FinalQuestCard({
  quest,
  moduleStatus,
  onBackToChapters,
}: {
  quest: import('@/types').ModuleFinalQuest
  moduleStatus: ModuleStatus
  onBackToChapters?: () => void
}) {
  const [deliverable, setDeliverable] = useState('')
  const [notes, setNotes] = useState('')
  const submitStep = useSubmitStep(quest.id)
  const { toast } = useToast()

  const submission = quest.submission
  const isPending = moduleStatus === 'en_attente' || submission?.status === 'en_attente'
  const isRejected = moduleStatus === 'a_revoir' || submission?.status === 'rejetee' || submission?.status === 'a_revoir'
  const isApproved = moduleStatus === 'termine' || submission?.status === 'validee' || submission?.status === 'approuvee'

  const handleSubmitDeliverable = () => {
    if (!quest.stepId) return

    submitStep.mutate(
      {
        stepId: quest.stepId,
        content: deliverable.trim(),
      },
      {
        onSuccess: () => {
          toast('Livrable envoyé', {
            description: 'Votre livrable a été déposé et attend la correction d’un formateur.',
            kind: 'success',
          })
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerte quête requise */}
      <div className="panel p-6 space-y-4 border-2 border-accent/40 bg-gradient-to-br from-surface to-surface-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-accent">
            <Trophy className="h-4 w-4" /> Quête finale obligatoire du module
          </span>
          <div className="flex items-center gap-2">
            <span className="chip text-[11px] font-semibold text-accent">+{quest.xp} XP</span>
            <span className="chip text-[11px] font-semibold text-primary">+{quest.germs} Germes</span>
          </div>
        </div>

        <h2 className="font-display text-[22px] font-bold text-fg">{quest.title}</h2>
        <p className="text-[14px] text-fg-muted leading-relaxed">{quest.description}</p>

        <div className="p-3.5 rounded-xl bg-surface border border-accent/20 text-[13px] text-fg leading-relaxed">
          <strong>Règle de progression :</strong> Cette quête finale est la seule exigence pour valider le module. Après votre dépôt, un formateur examine votre livrable. L’approbation attribue les points une seule fois et débloque le module suivant.
        </div>

        {/* État : En attente de validation */}
        {isPending && (
          <div className="p-4 rounded-xl bg-warning-soft border border-warning/30 text-warning flex items-start gap-3">
            <Clock3 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold">Livrable en attente de correction</p>
              <p className="text-[13px] text-fg-muted mt-0.5">
                Votre production est transmise aux formateurs CODE212. Le module suivant reste verrouillé jusqu’à validation.
              </p>
              {submission?.submittedAt && (
                <p className="text-[11.5px] text-fg-subtle mt-1.5">
                  Déposé le {new Date(submission.submittedAt).toLocaleString('fr-FR')} (tentative {submission.attempt})
                </p>
              )}
            </div>
          </div>
        )}

        {/* État : Rejeté / À retravailler */}
        {isRejected && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold">Livrable à retravailler</p>
                <p className="text-[13px] text-fg-muted mt-0.5">
                  Le formateur a retourné votre production. Prenez en compte son retour ci-dessous puis soumettez une nouvelle tentative.
                </p>
                {submission?.trainerFeedback && (
                  <div className="mt-2.5 p-3 rounded-lg bg-surface border border-danger/20 text-[13px] text-fg font-medium italic">
                    « {submission.trainerFeedback} »
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* État : Validé */}
        {isApproved && (
          <div className="p-4 rounded-xl bg-success-soft border border-success/30 text-success flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold">Module validé avec succès !</p>
              <p className="text-[13px] text-fg-muted mt-0.5">
                Félicitations, votre livrable a été validé. Les récompenses (+{quest.xp} XP, +{quest.germs} Germes) sont créditées et le module suivant est maintenant accessible.
              </p>
              {submission?.trainerFeedback && (
                <div className="mt-2.5 p-3 rounded-lg bg-surface border border-success/20 text-[13px] text-fg font-medium italic">
                  Commentaire du formateur : « {submission.trainerFeedback} »
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulaire de dépôt de livrable */}
        {(!isPending && !isApproved) && (
          <div className="panel p-5 space-y-4 bg-surface mt-4">
            <h3 className="font-display text-[16px] font-bold text-fg flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              {isRejected ? 'Déposer une nouvelle tentative' : 'Déposer mon livrable'}
            </h3>

            <div className="space-y-2">
              <Label className="text-[12.5px] font-semibold text-fg">
                Lien ou extrait de code du livrable (GitHub, CodeSandbox ou code source) :
              </Label>
              <Textarea
                rows={4}
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                placeholder="https://github.com/mon-compte/mon-projet-fullstack ou collez votre code ici..."
                className="text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[12.5px] font-semibold text-fg">Notes ou explications pour le formateur (facultatif) :</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Précisions sur vos choix techniques, difficultés rencontrées..."
                className="text-[13px]"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {onBackToChapters && (
                <Button variant="ghost" size="sm" onClick={onBackToChapters} className="gap-1.5 text-fg-muted">
                  <ArrowLeft className="h-4 w-4" /> Revoir les chapitres
                </Button>
              )}
              <Button
                onClick={handleSubmitDeliverable}
                disabled={submitStep.isPending || !deliverable.trim()}
                className="gap-2 ms-auto"
              >
                {submitStep.isPending ? 'Envoi en cours...' : 'Soumettre au formateur pour correction'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
