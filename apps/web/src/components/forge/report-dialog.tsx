import { useState } from 'react'
import { useReportThread } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

const REASONS = ['Contenu inapproprié', 'Harcèlement', 'Spam ou publicité', 'Hors sujet', 'Solution dangereuse ou trompeuse', 'Autre']

/**
 * Signalement d'un fil ou d'une réponse de la Forge. Le motif part tel quel
 * à l'API ; la confirmation et les erreurs (doublon, motif trop court)
 * viennent de la réponse serveur.
 */
export function ForgeReportDialog({
  threadId,
  solutionId,
  label,
  onClose,
}: {
  threadId: number
  solutionId?: number
  label: string
  onClose: () => void
}) {
  const report = useReportThread()
  const { toast } = useToast()
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const needsDetails = reason === 'Autre'
  const canSend = !needsDetails || details.trim().length >= 10

  const send = () =>
    report.mutate(
      { id: threadId, solutionId, reason: `${reason} — ${details.trim() || 'sans précision'}` },
      {
        onSuccess: () => {
          toast('Signalement transmis', { description: 'La modération de la rubrique va examiner ce contenu.', kind: 'info' })
          onClose()
        },
        onError: (error) =>
          toast('Signalement non enregistré', {
            description: error instanceof Error ? error.message : 'Réessayez dans un instant.',
            kind: 'error',
          }),
      },
    )

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler {label}</DialogTitle>
          <DialogDescription>Le signalement est envoyé à la modération de la rubrique. Un seul signalement par contenu.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Motif</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REASONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <Label htmlFor="forge-report-details">Précisions {needsDetails ? '(10 caractères minimum)' : '(facultatif)'}</Label>
          <Textarea id="forge-report-details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Ce qui pose problème, et où." />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button loading={report.isPending} disabled={!canSend} onClick={send}>Envoyer le signalement</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
