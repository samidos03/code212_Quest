import { useState } from 'react'
import { Camera, CheckCircle2, Save, ShieldCheck } from 'lucide-react'
import { IdentityCard } from '@/components/shared/identity-card'
import { useDirectorIdentity } from '@/lib/director-identity'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

/* Tous les avatars disponibles : officiels + insignes institutionnels */
const AVATAR_OPTIONS = [
  {
    group: 'Emblèmes officiels',
    items: [
      { src: '/avatars/super-admin.svg',       label: 'Emblème Super Admin' },
      { src: '/avatars/super-admin-128.png',   label: 'Emblème 128px' },
      { src: '/avatars/super-admin-256.png',   label: 'Emblème 256px' },
    ],
  },
  {
    group: 'Insignes institutionnels',
    items: [
      { src: '/director-insignia/uca-directeur.png', label: 'Blason Directeur UCA' },
      { src: '/director-insignia/gouvernance.svg',   label: 'Grand Sceau de Gouvernance' },
      { src: '/director-insignia/vision.svg',        label: 'Visionnaire Code212' },
      { src: '/director-insignia/gardien.svg',       label: 'Gardien de l\u2019Écosystème' },
    ],
  },
]

export function DirectorIdentityPage() {
  const { identity, setIdentity } = useDirectorIdentity()
  const [form, setForm] = useState(identity)
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIdentity(form)
    toast('Profil personnalisé enregistré', {
      kind: 'success',
      description: 'Enregistré dans ce navigateur (mode prototype).',
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* En-tête */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Direction · Identité</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-fg">Mon profil Code212</h1>
        <p className="text-sm text-fg-muted">
          Avatar, biographie et citation. Préférences sauvegardées localement dans cette version.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* ---- Formulaire ---- */}
        <form className="panel space-y-5 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 font-semibold text-fg">
            <Camera className="h-4 w-4 text-primary" /> Identité publique
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              maxLength={32}
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="Votre pseudo public"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Votre parcours, vos domaines d'expertise…"
            />
          </div>

          {/* Citation */}
          <div className="space-y-1.5">
            <Label htmlFor="quote">Citation personnelle</Label>
            <Textarea
              id="quote"
              rows={2}
              maxLength={160}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Une phrase qui vous représente…"
            />
          </div>

          {/* Sélection avatar */}
          <div className="space-y-3">
            <Label>Choisir un avatar</Label>
            {AVATAR_OPTIONS.map((group) => (
              <div key={group.group}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-fg-subtle">
                  {group.group}
                </p>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((option) => {
                    const isSelected = form.avatar === option.src
                    return (
                      <button
                        key={option.src}
                        type="button"
                        title={option.label}
                        onClick={() => setForm({ ...form, avatar: option.src })}
                        className={cn(
                          'relative rounded-2xl border-2 p-1 transition-all duration-150',
                          isSelected
                            ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]'
                            : 'border-border hover:border-primary/40',
                        )}
                        aria-pressed={isSelected}
                        aria-label={`Choisir : ${option.label}`}
                      >
                        {isSelected && (
                          <span className="absolute -right-1.5 -top-1.5 z-10 rounded-full bg-primary p-px shadow">
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </span>
                        )}
                        <img
                          src={option.src}
                          alt={option.label}
                          className={cn(
                            'h-16 w-16 rounded-xl object-cover transition-transform duration-150',
                            isSelected ? 'scale-105' : 'hover:scale-105',
                          )}
                        />
                        <span className="mt-1 block max-w-[66px] text-center text-[9px] leading-tight text-fg-subtle">
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Note sécurité */}
          <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs text-fg-muted">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            Les rôles et sanctions ne sont pas modifiables depuis ce formulaire. L&rsquo;avatar officiel
            pourra être remplacé par un upload sécurisé côté backend.
          </div>

          <Button type="submit">
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </form>

        {/* ---- Aperçu ---- */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-fg">Aperçu de la carte</h2>
          {/* Aperçu en temps réel : on force l'identité locale dans le context via un wrapper */}
          <IdentityCardPreview avatar={form.avatar} nickname={form.nickname} quote={form.quote} />
          <p className="text-xs text-fg-subtle">
            L&rsquo;aperçu de gauche reflète les changements <em>après enregistrement</em>.
            Enregistrez pour voir la carte se mettre à jour.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---- Aperçu en temps réel sans toucher au contexte global ---- */
function IdentityCardPreview({
  avatar,
  nickname,
  quote,
}: {
  avatar: string
  nickname: string
  quote: string
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#d5b878]/50 bg-[#0c1226] text-[#f4f0ff] shadow-[0_18px_60px_rgba(0,0,0,.3)] w-full max-w-[440px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#c5027f] via-[#e9bc68] to-[#00dfff]" />
      <div className="relative bg-[radial-gradient(ellipse_at_top,rgba(103,1,230,.23),transparent_72%)] px-5 pb-5 pt-7 text-center">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center overflow-hidden rounded-[20px] border-2 border-[#d5b878]/70 bg-[#1d2545] shadow-lg [clip-path:polygon(0_0,84%_0,100%_16%,100%_100%,0_100%)]">
          <img src={avatar || '/avatars/super-admin.svg'} alt="Aperçu avatar" className="h-full w-full object-cover" />
        </div>
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e9bc68]">
          Direction · UCA
        </div>
        <h2 className="truncate text-xl font-extrabold tracking-tight">
          {nickname || 'Walid Bouarifi'}
        </h2>
        <p className="mt-1 text-xs text-[#abb8d6]">Directeur du Centre Code212</p>
        {quote && (
          <p className="mx-auto mt-4 max-w-[300px] text-xs italic leading-relaxed text-[#c5cde2]">
            « {quote} »
          </p>
        )}
      </div>
      <div className="border-t border-white/10 px-4 pb-3 pt-3 text-center text-[10px] text-[#8391b3]">
        Aperçu en temps réel · enregistrez pour confirmer
      </div>
    </section>
  )
}
