import { useState } from 'react'
import { Flame, Info, Save, ShieldAlert, SlidersHorizontal, Zap } from 'lucide-react'
import { useAdminRules, useUpdateRule } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { TRACK_LABEL, cn, formatNumber } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  quetes: 'Quêtes',
  communaute: 'Communauté',
  presence: 'Présence',
  evenement: 'Événement',
  penalite: 'Pénalité',
}

export function AdminRulesPage() {
  const { data: rules, isLoading } = useAdminRules()
  const update = useUpdateRule()
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  const save = (id: number, patch: Parameters<typeof update.mutate>[0]['patch']) =>
    update.mutate({ id, patch }, { onSuccess: () => toast('Règle enregistrée', { description: 'La nouvelle version est appliquée aux prochains gains.', kind: 'success' }) })

  return (
    <div>
      <PageHeader
        kicker="Économie de la progression"
        title="Règles XP"
        description="Chaque barème est versionné et plafonné. Une modification n’affecte jamais les gains déjà attribués : la version de la règle est conservée dans le journal."
        actions={<Badge variant="primary">{rules?.length ?? 0} règles</Badge>}
      />

      <section className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning-soft p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-[13px] font-semibold text-fg">Aucune sanction automatique</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
            Les malus pour inactivité, échec ou profil incomplet restent désactivés par défaut. Les activer suppose une
            validation institutionnelle, une information préalable des étudiants et une procédure de recours.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(rules ?? []).map((rule) => {
            const isPenalty = rule.xp < 0
            return (
              <article
                key={rule.id}
                className={cn('panel p-5 transition-opacity', !rule.active && 'opacity-70')}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isPenalty ? 'danger' : 'primary'}>{categoryLabels[rule.category]}</Badge>
                      {rule.track && <Badge variant="accent">Voie {TRACK_LABEL[rule.track]}</Badge>}
                      <span className="text-[11px] font-semibold text-fg-subtle">v{rule.version}</span>
                    </div>
                    <h3 className="mt-2 font-display text-[16.5px] font-bold text-fg">{rule.label}</h3>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{rule.description}</p>
                    <p className="mt-1.5 text-[11px] text-fg-subtle">
                      code : <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono">{rule.code}</code>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
                        Valeur (XP)
                      </label>
                      <Input
                        type="number"
                        step={10}
                        className="w-24"
                        defaultValue={drafts[rule.id] ?? String(rule.xp)}
                        onChange={(e) => setDrafts((current) => ({ ...current, [rule.id]: e.target.value }))}
                        onBlur={() => {
                          const value = Number(drafts[rule.id])
                          if (!Number.isNaN(value) && value !== rule.xp) save(rule.id, { xp: value })
                        }}
                        aria-label={`Valeur XP de ${rule.label}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
                        Plafond / jour
                      </label>
                      <Input type="number" step={50} className="w-24" defaultValue={rule.dailyCap} aria-label={`Plafond de ${rule.label}`} />
                    </div>

                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">Actif</span>
                      <Switch checked={rule.active} onCheckedChange={(checked) => save(rule.id, { active: checked })} aria-label={`Activer ${rule.label}`} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {rule.dailyCap > 0 ? `Plafond de ${formatNumber(rule.dailyCap)} XP par jour et par utilisateur` : 'Aucun plafond'}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => save(rule.id, {})} loading={update.isPending}>
                    <Save className="h-3.5 w-3.5" /> Enregistrer
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <p className="kicker">Principes appliqués</p>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-fg-muted">
            <li className="flex gap-2">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              Un gain n’est écrit qu’une seule fois par (utilisateur, événement, référence).
            </li>
            <li className="flex gap-2">
              <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              Chaque règle possède un plafond journalier paramétrable.
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-fg" />
              Le barème appliqué est conservé dans le journal avec sa version.
            </li>
          </ul>
        </div>
        <div className="panel p-5">
          <p className="kicker">Simulation d’un barème</p>
          <div className="mt-3 space-y-2.5 text-[12.5px] text-fg-muted">
            <div className="flex justify-between">
              <span>Compléter une quête difficile</span>
              <span className="font-semibold text-fg">+{formatNumber(450 * 1.5)} XP</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus de série (7 jours)</span>
              <span className="font-semibold text-fg">+150 XP</span>
            </div>
            <div className="flex justify-between">
              <span>Réponse acceptée (Forge)</span>
              <span className="font-semibold text-fg">+40 XP</span>
            </div>
            <div className="flex justify-between">
              <span>Solution acceptée (Forge)</span>
              <span className="font-semibold text-fg">+120 XP</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold text-fg">Total maximal théorique / jour</span>
              <span className="font-display text-[16px] font-bold text-primary">+1 500 XP</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
