import { useState } from 'react'
import { Coins, PackageX, ShoppingBag, Sparkles } from 'lucide-react'
import { useMe, usePurchaseReward, useRewards } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { cn, formatNumber } from '@/lib/utils'
import type { Reward } from '@/types'

const gradients: Record<string, string> = {
  violet: 'from-[#6701e6] to-[#c5027f]',
  magenta: 'from-[#c5027f] to-[#6701e6]',
  cyan: 'from-[#00b8d4] to-[#0f8fbf]',
  orange: 'from-[#f59e0b] to-[#c5027f]',
}

const categoryLabels: Record<string, string> = {
  cosmetique: 'Cosmétique',
  avantage: 'Avantages',
  materiel: 'Matériel',
  mentorat: 'Mentorat',
}

export function ShopPage() {
  const { data: rewards, isLoading } = useRewards()
  const { data: me } = useMe()
  const purchase = usePurchaseReward()
  const { toast } = useToast()
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<Reward | null>(null)

  const list = (rewards ?? []).filter((r) => category === 'all' || r.category === category)

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Boutique"
        title="Échanger vos germes"
        description="Les germes sont gagnés en validant des quêtes et des contributions. Ils se dépensent ici : la boutique n’influe jamais sur les niveaux."
        actions={
          <div className="flex items-center gap-2 rounded-2xl border border-cyan/25 bg-cyan-soft px-4 py-2.5">
            <Coins className="h-5 w-5 text-cyan-fg" />
            <span className="font-display text-[19px] font-bold leading-none text-cyan-fg tabular-nums">
              {formatNumber(me?.germs ?? 0)}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-fg/80">germes</span>
          </div>
        }
      />

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {['all', 'cosmetique', 'avantage', 'mentorat', 'materiel'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
              category === cat ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted hover:text-fg',
            )}
          >
            {cat === 'all' ? 'Tout' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((reward) => {
            const affordable = (me?.germs ?? 0) >= reward.cost
            const inStock = reward.stock > 0
            return (
              <article key={reward.id} className="panel group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className={cn('relative grid h-28 place-items-center bg-gradient-to-br', gradients[reward.gradient] ?? gradients.violet)}>
                  <div className="art-grid absolute inset-0 opacity-30 mix-blend-overlay" />
                  <span className="relative text-[34px] font-bold text-white drop-shadow-lg">{reward.icon}</span>
                  {reward.limited && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                      Édition limitée
                    </span>
                  )}
                  {reward.owned ? (
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6701e6]">
                      ×{reward.owned}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <Badge variant="outline" className="w-fit">
                    {categoryLabels[reward.category]}
                  </Badge>
                  <h3 className="mt-2 font-display text-[16px] font-bold leading-tight text-fg">{reward.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-fg-muted">{reward.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[11.5px]">
                    <span className={cn('font-semibold', inStock ? 'text-fg-subtle' : 'text-danger')}>
                      {inStock ? `${reward.stock} en stock` : 'Rupture de stock'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-display text-[16px] font-bold text-cyan-fg">
                      <Coins className="h-4 w-4" /> {formatNumber(reward.cost)}
                    </span>
                  </div>

                  <Button
                    className="mt-3.5 w-full"
                    variant={affordable && inStock ? 'primary' : 'outline'}
                    disabled={!affordable || !inStock}
                    onClick={() => setSelected(reward)}
                  >
                    {inStock ? (affordable ? 'Échanger' : 'Solde insuffisant') : 'Indisponible'}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l’échange</DialogTitle>
            <DialogDescription>
              L’achat est débité de votre solde de germes et placed en attente de validation par l’administration.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-4">
              <span className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-[24px] font-bold text-white', gradients[selected.gradient] ?? gradients.violet)}>
                {selected.icon}
              </span>
              <div className="min-w-0">
                <p className="font-display text-[16px] font-bold text-fg">{selected.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] text-fg-muted">{selected.description}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 font-display text-[16px] font-bold text-cyan-fg">
                  <Coins className="h-4 w-4" /> {formatNumber(selected.cost)} germes
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-primary-soft px-3.5 py-3 text-[12px] leading-relaxed text-primary">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            Solde actuel : {formatNumber(me?.germs ?? 0)} germes. Après l’échange : {formatNumber((me?.germs ?? 0) - (selected?.cost ?? 0))} germes.
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!selected) return
                purchase.mutate(selected.id, {
                  onSuccess: (result) => {
                    setSelected(null)
                    toast('Commande enregistrée', {
                      description: `Commande #${result.order.id} en attente de validation. Nouveau solde : ${result.balance} germes.`,
                    })
                  },
                  onError: (error) => toast('Achat impossible', { description: (error as Error).message, kind: 'error' }),
                })
              }}
              loading={purchase.isPending}
            >
              <ShoppingBag className="h-4 w-4" /> Confirmer l’échange
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="panel flex flex-col items-center gap-3 px-6 py-8 text-center">
        <PackageX className="h-6 w-6 text-fg-subtle" />
        <p className="font-display text-[16px] font-bold text-fg">Un article n’est plus disponible ?</p>
        <p className="max-w-lg text-[13px] text-fg-muted">
          Les stocks sont mis à jour par l’administration du centre. Une demande de réapprovisionnement peut être adressée
          à l’équipe CODE212.
        </p>
      </section>
    </div>
  )
}
