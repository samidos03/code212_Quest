import { useState } from 'react'
import { CheckCircle2, Coins, Clock3, PackageCheck, RotateCcw, XCircle } from 'lucide-react'
import { useAdminOrders, useAdminSubmissions, useReviewSubmission, useUpdateOrder } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { cn, formatDateTime, formatNumber, formatRelative } from '@/lib/utils'
import type { ReviewDecision, Submission } from '@/types'

export function AdminValidationPage() {
  const { data: submissions } = useAdminSubmissions()
  const { data: orders } = useAdminOrders()
  const review = useReviewSubmission()
  const updateOrder = useUpdateOrder()
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [missingFeedback, setMissingFeedback] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  // File d'attente : le plus ancien dépôt d'abord.
  const pending = (submissions ?? [])
    .filter((s) => s.status === 'en_attente')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
  const done = (submissions ?? []).filter((s) => s.status !== 'en_attente')

  const decide = (submission: Submission, decision: ReviewDecision) => {
    const comment = (feedback[submission.id] ?? '').trim()
    if (decision === 'a_revoir' && comment === '') {
      setMissingFeedback(submission.id)
      return
    }
    setMissingFeedback(null)
    setBusyId(submission.id)

    review.mutate(
      { id: submission.id, decision, feedback: comment },
      {
        onSuccess: () =>
          toast(
            decision === 'validee' ? 'Livrable approuvé' : 'Livrable renvoyé',
            {
              description:
                decision === 'validee'
                  ? 'Les XP et points de voie ont été attribués une seule fois. Le module suivant est débloqué.'
                  : 'L’apprenant voit votre commentaire et peut déposer une nouvelle tentative.',
              kind: decision === 'validee' ? 'success' : 'info',
            },
          ),
        onError: (error) =>
          toast('Décision non enregistrée', {
            description: error instanceof Error ? error.message : 'Réessayez dans un instant.',
            kind: 'error',
          }),
        onSettled: () => setBusyId(null),
      },
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Évaluation"
        title="Validations & commandes"
        description="Traitez les livrables déposés par les apprenants et les commandes de la boutique. Chaque décision est tracée dans le journal d’audit."
        actions={<Badge variant="warning">{pending.length} livrables en attente</Badge>}
      />

      <Tabs defaultValue="livrables">
        <TabsList>
          <TabsTrigger value="livrables">Livrables</TabsTrigger>
          <TabsTrigger value="commandes">Commandes boutique</TabsTrigger>
          <TabsTrigger value="traitees">Traités</TabsTrigger>
        </TabsList>

        <TabsContent value="livrables">
          <div className="space-y-3">
            {pending.length === 0 && (
              <div className="panel px-6 py-14 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                <p className="mt-3 font-display text-[17px] font-bold text-fg">Tout est traité</p>
                <p className="mt-1 text-[13px] text-fg-muted">Aucun livrable n’attend de validation.</p>
              </div>
            )}

            {pending.map((submission) => (
              <article key={submission.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="warning" className="gap-1">
                        <Clock3 className="h-3 w-3" /> En attente
                      </Badge>
                      <span className="text-[11.5px] text-fg-subtle">{formatRelative(submission.submittedAt)}</span>
                      {submission.attempt && submission.attempt > 1 && (
                        <Badge variant="outline" className="gap-1">
                          <RotateCcw className="h-3 w-3" /> Tentative {submission.attempt}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-[17px] font-bold text-fg">{submission.questTitle}</h3>
                    <p className="text-[12.5px] text-fg-muted">
                      Étape « {submission.stepTitle} » · {submission.studentName} ({submission.studentPseudonym})
                    </p>
                  </div>
                  <Badge variant="primary">+{formatNumber(submission.xpAwarded || 0)} XP en attente</Badge>
                </div>

                <div className="mt-3.5 rounded-xl border border-border bg-surface-2 p-3.5">
                  <p className="text-[12.5px] leading-relaxed text-fg-muted">{submission.content}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor={`feedback-${submission.id}`}>
                    Commentaire pour l’apprenant (obligatoire pour renvoyer)
                  </Label>
                  <Textarea
                    id={`feedback-${submission.id}`}
                    rows={3}
                    value={feedback[submission.id] ?? ''}
                    onChange={(e) => setFeedback((current) => ({ ...current, [submission.id]: e.target.value }))}
                    placeholder="Ce qui est acquis, ce qui doit être repris, une ressource utile…"
                    aria-invalid={missingFeedback === submission.id}
                    className={cn(missingFeedback === submission.id && 'border-danger')}
                  />
                  {missingFeedback === submission.id && (
                    <p className="text-[12px] text-danger">Expliquez ce qu’il faut reprendre avant de renvoyer le livrable.</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => decide(submission, 'a_revoir')}
                    loading={busyId === submission.id}
                    disabled={busyId !== null}
                  >
                    <RotateCcw className="h-4 w-4" /> Renvoyer avec commentaire
                  </Button>
                  <Button
                    onClick={() => decide(submission, 'validee')}
                    loading={busyId === submission.id}
                    disabled={busyId !== null}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approuver
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commandes">
          <div className="panel overflow-hidden">
            <div className="divide-y divide-border">
              {(orders ?? []).map((order) => (
                <div key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-soft text-cyan-fg">
                    <Coins className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-fg">{order.rewardName}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">
                      {order.userName} · commande #{order.id} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-[16px] font-bold text-cyan-fg">{formatNumber(order.total)}</span>
                  <Badge
                    variant={
                      order.status === 'en_attente'
                        ? 'warning'
                        : order.status === 'approuvee'
                          ? 'primary'
                          : order.status === 'livree'
                            ? 'success'
                            : 'outline'
                    }
                  >
                    {order.status === 'en_attente' ? 'En attente' : order.status === 'approuvee' ? 'Approuvée' : order.status === 'livree' ? 'Livrée' : 'Refusée'}
                  </Badge>
                  {order.status === 'en_attente' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder.mutate({ id: order.id, status: 'refusee' }, { onSuccess: () => toast('Commande refusée', { kind: 'info' }) })}
                      >
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateOrder.mutate({ id: order.id, status: 'approuvee' }, { onSuccess: () => toast('Commande approuvée', { description: 'Le stock et le solde ont été ajustés par l’API.' }) })}
                      >
                        <PackageCheck className="h-3.5 w-3.5" /> Approuver
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="traitees">
          <div className="panel overflow-hidden">
            <div className="divide-y divide-border">
              {done.map((submission) => (
                <div key={submission.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      submission.status === 'validee' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                    )}
                  >
                    {submission.status === 'validee' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-fg">{submission.questTitle}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">
                      {submission.studentPseudonym}
                      {submission.attempt ? ` · tentative ${submission.attempt}` : ''}
                      {submission.reviewerName ? ` · traité par ${submission.reviewerName}` : ''}
                    </p>
                    {submission.feedback && (
                      <p className="mt-1 text-[12px] text-fg-muted">« {submission.feedback} »</p>
                    )}
                  </div>
                  <Badge variant={submission.status === 'validee' ? 'success' : 'outline'}>
                    {submission.status === 'validee'
                      ? `Approuvé · +${submission.xpAwarded} XP`
                      : submission.status === 'a_revoir'
                        ? 'Renvoyé'
                        : 'Rejeté'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-5 panel p-5">
        <p className="kicker">Garde-fous</p>
        <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-fg-muted">
          <li>· Une validation ne peut créditer qu’une seule fois : la clé d’idempotence (utilisateur, événement, référence) est unique en base.</li>
          <li>· Une règle XP dispose d’un plafond journalier : un apprenant ne peut pas accumuler des gains illimités.</li>
          <li>· Chaque décision est écrite dans le journal d’audit avec l’auteur, la cible et la justification.</li>
          <li>· Un renvoi exige un commentaire : l’apprenant le voit sur son module et dépose une nouvelle tentative.</li>
        </ul>
      </section>
    </div>
  )
}
