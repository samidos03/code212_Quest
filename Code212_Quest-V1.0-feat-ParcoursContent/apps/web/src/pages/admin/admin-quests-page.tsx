import { useMemo, useState } from 'react'
import { BookOpen, CheckCircle2, Clock3, MoreHorizontal, Plus, Search, Users } from 'lucide-react'
import { useQuests } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast'
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, TRACK_LABEL, cn, formatNumber } from '@/lib/utils'

export function AdminQuestsPage() {
  const { data: quests } = useQuests()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [track, setTrack] = useState('codeur')
  const [difficulty, setDifficulty] = useState('debutant')
  const [xp, setXp] = useState('450')

  const list = useMemo(
    () => (quests ?? []).filter((quest) => `${quest.title} ${quest.category}`.toLowerCase().includes(search.toLowerCase())),
    [quests, search],
  )

  return (
    <div>
      <PageHeader
        kicker="Contenus pédagogiques"
        title="Gestion des quêtes"
        description="Créez, publiez et ajustez les quêtes du centre. Les étapes, les barèmes XP et les critères de validation sont attachments à chaque quête."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle quête
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une quête…" className="pl-9" />
        </div>
        <Badge variant="primary">{list.length} quêtes</Badge>
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle lg:grid">
          <span>Quête</span>
          <span>Voie</span>
          <span>Diffculté</span>
          <span>Engagement</span>
          <span className="w-10" />
        </div>
        <div className="divide-y divide-border">
          {list.map((quest) => (
            <div key={quest.id} className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-3 font-display text-[15px] font-bold text-fg">
                    {quest.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[15px] font-bold text-fg">{quest.title}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">
                      {quest.category} · {quest.steps.length} étapes · {formatNumber(quest.xpReward)} XP
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-fg-subtle lg:hidden">Voie</span>
                <Badge variant="primary">{TRACK_LABEL[quest.track]}</Badge>
              </div>

              <div className="flex items-center gap-2 lg:block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-fg-subtle lg:hidden">Difficulté</span>
                <span className={cn('rounded-lg px-2 py-1 text-[11px] font-bold', DIFFICULTY_TONE[quest.difficulty])}>
                  {DIFFICULTY_LABEL[quest.difficulty]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-fg-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {quest.participants}
                    </span>
                    <span>{quest.completionRate} %</span>
                  </div>
                  <Progress value={quest.completionRate} className="h-1.5" />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-self-end">
                <Badge variant={quest.status === 'publiee' ? 'success' : 'warning'}>
                  {quest.status === 'publiee' ? 'Publiée' : 'Brouillon'}
                </Badge>
                <Button variant="ghost" size="icon-sm" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une quête</DialogTitle>
            <DialogDescription>
              Une quête publiée devient visible par tous les apprenants. Les étapes et le barème XP se configurent ensuite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-title">Titre</Label>
              <Input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Concevoir une API GraphQL" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="q-track">Voie</Label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger id="q-track">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRACK_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-diff">Difficulté</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="q-diff">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-xp">Récompense XP</Label>
              <Input id="q-xp" type="number" min={0} step={10} value={xp} onChange={(e) => setXp(e.target.value)} />
              <p className="text-[11.5px] text-fg-subtle">
                Le barème est versionné : toute modification future du barème n’affecte pas les gains déjà attribués.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-desc">Description</Label>
              <Textarea id="q-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objectifs, prérequis, modalités d’évaluation…" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (title.trim().length < 5) {
                  toast('Titre trop court', { description: 'Le titre doit faire au moins 5 caractères.', kind: 'error' })
                  return
                }
                setOpen(false)
                setTitle('')
                setDescription('')
                toast('Quête enregistrée', { description: 'Elle est publiée et visible par les apprenants.' })
              }}
            >
              <BookOpen className="h-4 w-4" /> Publier la quête
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { icon: CheckCircle2, label: 'Quêtes publiées', value: '18', hint: 'sur 24 rédigées' },
          { icon: Clock3, label: 'En relecture', value: '3', hint: 'modifications demandées' },
          { icon: Users, label: 'Inscriptions cumulées', value: '1 284', hint: 'sur les 12 quêtes' },
        ].map((item) => (
          <div key={item.label} className="panel flex items-start gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-fg-muted">
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{item.label}</p>
              <p className="mt-0.5 font-display text-[20px] font-bold leading-none text-fg">{item.value}</p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">{item.hint}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
