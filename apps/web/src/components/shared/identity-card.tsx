import { Link } from 'react-router-dom'
import { Gem, MessageCircle, Zap, Crown, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useDirectorIdentity } from '@/lib/director-identity'
import { useStudentIdentity } from '@/lib/student-identity'
import { cn } from '@/lib/utils'

const INSTITUTIONAL_INSIGNIA = [
  { src: '/director-insignia/uca-directeur.png',  label: 'Blason Directeur UCA' },
  { src: '/director-insignia/gouvernance.svg',     label: 'Grand Sceau de Gouvernance' },
  { src: '/director-insignia/vision.svg',          label: 'Visionnaire Code212' },
  { src: '/director-insignia/gardien.svg',         label: 'Gardien de l\u2019Écosystème' },
]

export function IdentityCard({ compact = false }: { compact?: boolean }) {
  const { user, isDirector } = useAuth()
  const { identity, setIdentity } = useDirectorIdentity()
  const { identity: studentIdentity } = useStudentIdentity()
  if (!user) return null

  /* -------------------------------------------------- carte Directeur */
  if (isDirector) {
    const currentAvatar = identity.avatar || user.avatarUrl || '/avatars/super-admin.svg'

    function selectInsignia(src: string) {
      setIdentity({ ...identity, avatar: src })
    }

    return (
      <section
        className={cn(
          'relative overflow-hidden rounded-[26px] border border-[#d5b878]/50 bg-[#0c1226] text-[#f4f0ff] shadow-[0_18px_60px_rgba(0,0,0,.3)]',
          compact ? 'w-[286px]' : 'w-full max-w-[440px]',
        )}
      >
        {/* bande tricolore */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#c5027f] via-[#e9bc68] to-[#00dfff]" />

        {/* en-tête */}
        <div className="relative bg-[radial-gradient(ellipse_at_top,rgba(103,1,230,.23),transparent_72%)] px-5 pb-5 pt-7 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center overflow-hidden rounded-[20px] border-2 border-[#d5b878]/70 bg-[#1d2545] shadow-lg [clip-path:polygon(0_0,84%_0,100%_16%,100%_100%,0_100%)]">
            <img
              src={currentAvatar}
              alt="Avatar du Directeur"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e9bc68]">
            <Crown className="h-3.5 w-3.5" /> Direction · UCA
          </div>
          <h2 className="truncate text-xl font-extrabold tracking-tight">
            {identity.nickname || user.displayName}
          </h2>
          <p className="mt-1 text-xs text-[#abb8d6]">Directeur du Centre Code212</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full border border-[#d5b878]/40 bg-[#d5b878]/10 px-3 py-1 text-[10px] font-bold text-[#f5d992]">
              Direction Code212
            </span>
            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] text-cyan-200">
              Gouvernance
            </span>
          </div>
          {identity.quote && (
            <p className="mx-auto mt-4 max-w-[320px] text-xs italic leading-relaxed text-[#c5cde2]">
              « {identity.quote} »
            </p>
          )}
        </div>

        {/* insignes institutionnels */}
        <div className="border-t border-white/10 px-4 pb-4 pt-4">
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#c8b58a]">
            <ShieldCheck className="h-4 w-4" /> Insignes institutionnels
          </div>

          <div className="grid grid-cols-4 items-start gap-2">
            {INSTITUTIONAL_INSIGNIA.map((insigne) => {
              const isSelected = currentAvatar === insigne.src
              return (
                <button
                  key={insigne.src}
                  type="button"
                  title={`Utiliser comme avatar : ${insigne.label}`}
                  onClick={() => selectInsignia(insigne.src)}
                  className={cn(
                    'group relative min-w-0 rounded-xl text-center transition-all duration-150',
                    isSelected
                      ? 'ring-2 ring-[#e9bc68] ring-offset-2 ring-offset-[#0c1226]'
                      : 'hover:ring-1 hover:ring-[#e9bc68]/50 hover:ring-offset-1 hover:ring-offset-[#0c1226]',
                  )}
                  aria-pressed={isSelected}
                >
                  {/* coche de sélection */}
                  {isSelected && (
                    <span className="absolute -right-1 -top-1 z-10 rounded-full bg-[#e9bc68] p-px shadow">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0c1226]" />
                    </span>
                  )}
                  <img
                    src={insigne.src}
                    alt={insigne.label}
                    loading="lazy"
                    className={cn(
                      'mx-auto aspect-square w-full max-w-[88px] object-contain drop-shadow-[0_3px_9px_rgba(0,0,0,.5)] transition-transform duration-200',
                      isSelected ? 'scale-105' : 'group-hover:scale-110',
                    )}
                  />
                  <span className="mt-1 block text-[9px] leading-tight text-[#b6c3de]">
                    {insigne.label}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-center text-[10px] text-[#8391b3]">
            Cliquez sur un insigne pour l&rsquo;utiliser comme avatar
          </p>
          <Link
            to="/director/profile"
            className="mt-3 block text-center text-xs font-semibold text-[#71e6f9] hover:underline"
          >
            Personnaliser mon profil →
          </Link>
        </div>
      </section>
    )
  }

  /* -------------------------------------------------- carte Apprenant */
  const level = Math.max(1, user.level)
  const pct = Math.min(100, Math.max(0, Math.round((user.xp % 1000) / 10)))
  const { status } = identity
  const learnerName = studentIdentity.nickname || user.displayName
  const badgeColor =
    status === 'banni'
      ? 'border-red-500/60'
      : status === 'averti'
      ? 'border-amber-500/60'
      : status === 'signale'
      ? 'border-orange-500/60'
      : 'border-border'

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border bg-surface shadow-sm',
        badgeColor,
        compact ? 'w-[286px]' : 'w-full max-w-[440px]',
      )}
    >
      <div className="flex items-center gap-3 border-b border-border p-3.5">
        <img
          src={studentIdentity.avatar || user.avatarUrl || '/avatars/super-admin.svg'}
          alt="Avatar"
          className="h-12 w-12 shrink-0 rounded-[15px] border border-primary/30 bg-surface-2 object-cover [clip-path:polygon(0_0,88%_0,100%_12%,100%_100%,0_100%)]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-fg">
            {learnerName}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Étudiant
            </span>
            <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-fg">
              Codeur
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2 text-[12px]">
          <strong className="text-fg">NIVEAU {level}</strong>
          <span className="inline-flex items-center gap-1 text-amber-500">
            <Zap className="h-3.5 w-3.5" /> {user.xp}
          </span>
          <span className="inline-flex items-center gap-1 text-cyan-fg">
            <Gem className="h-3.5 w-3.5" /> {user.germs}
          </span>
          <span className="inline-flex items-center gap-1 text-fg-muted">
            <MessageCircle className="h-3.5 w-3.5" /> {identity.messages}
          </span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="tracking-wider text-amber-500">{'★'.repeat(Math.min(level, 6))}</span>
          <span className="font-semibold text-fg">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-bold text-violet-400">
            Étudiant
          </span>
          <span className="rounded-md bg-surface-3 px-2 py-1 text-[10px] text-fg-muted">
            Communauté
          </span>
          {status !== 'normal' && (
            <span className="rounded-md bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-400">
              {status.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-[11px] text-fg-subtle">{studentIdentity.bio || 'Membre Code212'}</p>
        {studentIdentity.quote && <p className="text-[11px] italic text-fg-muted">« {studentIdentity.quote} »</p>}
        <div className="border-t border-border pt-2">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-fg-subtle">Badges</p>
          <div className="flex flex-wrap gap-2">
            {identity.badges.map((b, i) => (
              <span
                key={b}
                title={b}
                className="grid h-9 w-9 place-items-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-400/20 to-violet-500/20 text-lg"
              >
                {['🏅', '🛡️', '💠', '🏆', '⭐'][i % 5]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
