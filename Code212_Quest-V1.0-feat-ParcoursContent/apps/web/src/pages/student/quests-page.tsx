import { useMemo, useState } from 'react'
import { Compass, Search, SlidersHorizontal } from 'lucide-react'
import { useQuests, useTracks } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { QuestCard } from '@/components/shared/quest-card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TRACK_LABEL, cn, formatNumber } from '@/lib/utils'

export function QuestsPage() {
  const [track, setTrack] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [search, setSearch] = useState('')

  const { data: quests, isLoading } = useQuests({ track, difficulty, search })
  const { data: tracks } = useTracks()

  const totalXp = useMemo(() => (quests ?? []).reduce((sum, q) => sum + q.xpReward, 0), [quests])

  return (
    <div>
      <PageHeader
        kicker="Catalogue pédagogique"
        title="Toutes les quêtes"
        description="12 quêtes corrigées par les formateurs du centre, de l’introduction à la projet fil rouge. Chaque quête validée rapporte de l’XP, des points de voie et des germes."
        actions={
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="primary">{formatNumber(quests?.length ?? 0)} quêtes</Badge>
            <Badge variant="accent">+{formatNumber(totalXp)} XP cumulés</Badge>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          <button
            onClick={() => setTrack('all')}
            className={cn(
              'shrink-0 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
              track === 'all' ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg',
            )}
          >
            Toutes les voies
          </button>
          {(tracks ?? []).map((t) => (
            <button
              key={t.code}
              onClick={() => setTrack(t.code)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                track === t.code ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg',
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              {TRACK_LABEL[t.code]}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2 lg:justify-end">
          <div className="relative flex-1 lg:max-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une quête…"
              className="pl-9"
              aria-label="Rechercher une quête"
            />
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[178px] shrink-0" aria-label="Filtrer par difficulté">
              <SlidersHorizontal className="h-4 w-4 text-fg-subtle" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes difficultés</SelectItem>
              <SelectItem value="debutant">Débutant</SelectItem>
              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
              <SelectItem value="avance">Avancé</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[330px]" />
          ))}
        </div>
      ) : quests && quests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-3 text-fg-subtle">
            <Compass className="h-6 w-6" />
          </span>
          <p className="font-display text-[17px] font-bold text-fg">Aucune quête ne correspond</p>
          <p className="max-w-sm text-[13px] text-fg-muted">
            Ajustez vos filtres ou 投稿ez une nouvelle demande au centre pour élargir le catalogue.
          </p>
        </div>
      )}
    </div>
  )
}
