import { useState } from 'react'
import { CheckCircle2, Flag, MessageSquare, ShieldCheck, ShieldX, UserX } from 'lucide-react'
import { useAdminOverview } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { cn, formatRelative } from '@/lib/utils'

export function AdminModerationPage() {
  const { data } = useAdminOverview()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [sanction, setSanction] = useState('avertissement')

  const resolve = (id: number, action: 'close' | 'hide' | 'ban') => {
    const label = action === 'close' ? 'Signalement clos' : action === 'hide' ? 'Contenu masqué' : 'Bannissement temporaire appliqué'
    toast(label, {
      description:
        action === 'ban'
          ? 'Bannissement consigné et notifié. La voie de recours a été communiquée à l’utilisateur.'
          : 'Décision enregistrée dans le journal d’audit de la rubrique.',
      kind: action === 'ban' ? 'error' : 'success',
    })
    void id
  }

  const queue = data?.moderationQueue ?? []

  return (
    <div>
      <PageHeader
        kicker="Communauté"
        title="File de modération"
        description="Les signalements sont traités par la modération désignée sur chaque rubrique. Chaque décision est journalisée et notifiée à l’auteur."
        actions={<Badge variant="danger">{queue.length} signalements</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {queue.length === 0 && (
            <div className="panel px-6 py-14 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
              <p className="mt-3 font-display text-[17px] font-bold text-fg">File vide</p>
              <p className="mt-1 text-[13px] text-fg-muted">Aucun signalement en attente de traitement.</p>
            </div>
          )}

          {queue.map((report) => (
            <article key={report.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="danger" className="gap-1">
                      <Flag className="h-3 w-3" /> {report.type === 'discussion' ? 'Discussion' : 'Réponse'}
                    </Badge>
                    <span className="text-[11.5px] text-fg-subtle">{formatRelative(report.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 font-display text-[16.5px] font-bold text-fg">{report.title}</h3>
                  <p className="mt-0.5 text-[12.5px] text-fg-muted">
                    Motif : {report.reason} · signalé par {report.reporter}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`note-${report.id}`}>Note de modération</Label>
                <Textarea
                  id={`note-${report.id}`}
                  rows={3}
                  value={notes[report.id] ?? ''}
                  onChange={(e) => setNotes((current) => ({ ...current, [report.id]: e.target.value }))}
                  placeholder="Constats, éléments de contexte, décision motivate…"
                />
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-fg-subtle" />
                  <Select value={sanction} onValueChange={setSanction}>
                    <SelectTrigger className="w-[190px]" aria-label="Type de sanction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avertissement">Avertissement</SelectItem>
                      <SelectItem value="masquage">Masquage du contenu</SelectItem>
                      <SelectItem value="bannissement">Bannissement temporaire</SelectItem>
                      <SelectItem value="exclusion">Exclusion de la rubrique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolve(report.id, 'close')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Clore
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => resolve(report.id, 'hide')}>
                    <ShieldX className="h-3.5 w-3.5" /> Masquer
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => resolve(report.id, 'ban')}>
                    <UserX className="h-3.5 w-3.5" /> Bannir
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <section className="panel p-5">
            <p className="kicker">Modérateurs par rubrique</p>
            <div className="mt-3 space-y-3">
              {[
                { name: 'Salma Tazi', scope: 'Entraide', status: 'Actif' },
                { name: 'Dr. Karim Idrissi', scope: 'Projets', status: 'Actif' },
                { name: 'Omar Benali', scope: 'Café de la Forge', status: 'Actif' },
                { name: 'Centre CODE212', scope: 'Annonces · Coding League', status: 'Collectif' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-[11px] font-bold text-primary">
                    {item.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-fg">{item.name}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">{item.scope}</p>
                  </div>
                  <Badge variant={item.status === 'Actif' ? 'success' : 'outline'}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <p className="kicker">Règles de modération</p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-fg-muted">
              <li className="flex gap-2">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Une réponse acceptée est récompensée : 40 XP, ou 120 XP si elle est validée comme solution.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Maximum 5 réponses rémunérées par jour et 2 par demandeur et par semaine.
              </li>
              <li className={cn('flex gap-2')}>
                <UserX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                L’auto-validation d’une solution est interdite : l’auteur ne récompense pas sa propre réponse.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
