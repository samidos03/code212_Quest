import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Flag, Send } from 'lucide-react'
import { useAcceptSolution, useForgeThread, useMe, useReplyToThread } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn, formatRelative } from '@/lib/utils'
import { ForgeAuthorCard } from '@/components/forge/forge-author-card'
import { ForgeReportDialog } from '@/components/forge/report-dialog'

export function ForgeThreadPage() {
  const { id } = useParams()
  const threadId = Number(id)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data, isLoading, isError, error } = useForgeThread(threadId)
  const { data: me } = useMe()
  const reply = useReplyToThread(threadId)
  const accept = useAcceptSolution(threadId)
  const [body, setBody] = useState('')
  const [reportTarget, setReportTarget] = useState<{ solutionId?: number; label: string } | null>(null)

  if (isError) {
    return (
      <div className="panel p-8 text-center">
        <p className="font-display text-[17px] font-bold text-fg">Discussion indisponible</p>
        <p className="mt-1 text-[13px] text-fg-muted">{error instanceof Error ? error.message : 'Erreur inconnue.'}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/forge')}>Retour à La Forge</Button>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  const { thread, solutions } = data
  // Seul le demandeur (ou un formateur/modérateur) choisit la solution ; l'API le vérifie aussi.
  const isStaff = Boolean(me?.roles?.some((role) => role === 'trainer' || role === 'moderator' || role === 'admin'))
  const canAccept = !thread.solved && (isStaff || (me !== undefined && Number(me.id) === thread.authorId))

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Retour à La Forge
      </button>

      <article className="panel overflow-hidden p-0">
        <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {thread.solved && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Résolu
            </Badge>
          )}
          {thread.tags.map((tag) => (
            <span key={tag} className="chip">
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="mt-3 [overflow-wrap:anywhere] font-display text-[24px] font-bold leading-tight text-fg sm:text-[28px]">{thread.title}</h1>

        </div>
        <div className="grid items-start gap-4 border-t border-border p-3 sm:p-4 md:grid-cols-[272px_minmax(0,1fr)]">
          <ForgeAuthorCard author={thread.author ?? { pseudonym: thread.authorPseudonym, role: thread.authorRole }} />
          <div className="min-w-0 py-1">
            <p className="mb-3 text-[11px] text-fg-subtle">Publié {formatRelative(thread.createdAt)} · {thread.replies} réponse(s)</p>
        <p className="mt-4 whitespace-pre-line [overflow-wrap:anywhere] text-[14px] leading-relaxed text-fg-muted">{thread.body}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={() => setReportTarget({ label: 'la discussion' })}>
            <Flag className="h-3.5 w-3.5" /> Signaler
          </Button>
        </div>
          </div>
        </div>
      </article>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-[17px] font-bold text-fg">{solutions.length} réponse(s)</h2>
        </div>

        <div className="space-y-3">
          {solutions.map((solution) => (
            <article
              key={solution.id}
              className={cn(
                'panel p-5',
                solution.accepted && 'border-success/40 bg-success-soft/30',
              )}
            >
              <div className="grid items-start gap-4 md:grid-cols-[272px_minmax(0,1fr)]">
                <ForgeAuthorCard author={solution.author ?? { pseudonym: solution.authorPseudonym, role: solution.authorRole }} />
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11.5px] text-fg-subtle">{formatRelative(solution.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {solution.accepted && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Solution acceptée
                        </Badge>
                      )}
                      {!solution.accepted && canAccept && solution.authorId !== Number(me?.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            accept.mutate(solution.id, {
                              onSuccess: () => toast('Solution acceptée', { description: 'La réponse est marquée comme solution officielle.' }),
                              onError: (error) => toast('Action impossible', { description: (error as Error).message, kind: 'error' }),
                            })
                          }
                          loading={accept.isPending}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accepter
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line [overflow-wrap:anywhere] text-[13.5px] leading-relaxed text-fg-muted">{solution.body}</p>

                  <div className="mt-3.5 flex items-center gap-4 text-[11.5px] text-fg-subtle">
                    {solution.acceptedAt && <span>Acceptée {formatRelative(solution.acceptedAt)}</span>}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-primary"
                      onClick={() => setReportTarget({ solutionId: solution.id, label: 'cette réponse' })}
                    >
                      <Flag className="h-3.5 w-3.5" /> Signaler
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-[17px] font-bold text-fg">Répondre</h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">
          L’entraide reste communautaire : seule une réponse acceptée par l’auteur de la question est récompensée, dans la limite des quotas. Elle ne remplace pas la validation d’une quête par un formateur.
        </p>
        <Textarea
          className="mt-3"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Expliquez la cause, proposez le correctif (avec un extrait de code) et comment vérifier que ça marche."
          disabled={thread.closed}
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => {
              if (body.trim().length < 20) {
                toast('Réponse trop courte', { description: '20 caractères minimum pour une réponse utile.', kind: 'error' })
                return
              }
              reply.mutate(body.trim(), {
                onSuccess: () => {
                  setBody('')
                  toast('Réponse publiée', { description: 'Vérifiez son affichage dans la discussion.' })
                },
                onError: (error) => {
                  console.error('Publication Forge refusée :', error)
                  toast('Publication impossible', {
                    description: error instanceof Error ? error.message : 'Erreur inconnue lors de la publication.',
                    kind: 'error',
                  })
                },
              })
            }}
            loading={reply.isPending}
            disabled={thread.closed}
          >
            <Send className="h-4 w-4" /> Publier ma réponse
          </Button>
        </div>
      </section>
      {reportTarget && (
        <ForgeReportDialog
          threadId={thread.id}
          solutionId={reportTarget.solutionId}
          label={reportTarget.label}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}
