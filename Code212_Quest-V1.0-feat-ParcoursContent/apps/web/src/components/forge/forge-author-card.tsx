import { useEffect, useState } from 'react'
import { Gem, Mail, MessageCircle, ShieldAlert, ShieldCheck, Zap } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import type { ForgeAuthorIdentity } from '@/types'

type Props = { author: ForgeAuthorIdentity; compact?: boolean }

// Badge artwork is copied from Code212_Quest_V09_Badges_Profil(1).zip.
// Images are only displayed for badges actually provided for this author by the API.
const badgeArt: Record<string, string> = {
  'premier commit': 'premier-commit', 'chasseur de bugs': 'chasseur-de-bugs',
  'code propre': 'code-propre', 'optimiseur': 'optimiseur',
  'champion coding league': 'champion-coding-league', 'main tendue': 'main-tendue',
  'esprit d’équipe': 'esprit-d-equipe', 'esprit d equipe': 'esprit-d-equipe',
  'explicateur': 'explicateur', 'mentor de la forge': 'mentor-de-la-forge',
  'pilier de la communauté': 'pilier-de-la-communaute',
  'chef de projet': 'chef-de-projet', 'maître du déploiement': 'maitre-du-deploiement',
  'contributeur open source': 'contributeur-open-source', 'architecte': 'architecte',
  'curieux': 'curieux', 'éclaireur': 'eclaireur', 'sécurité d’abord': 'securite-d-abord',
  'série de 30 jours': 'serie-30-jours', 'série de 100 jours': 'serie-100-jours',
}
const roleNames: Record<string, string> = {
  director: 'Directeur', admin: 'Administrateur', team: 'Équipe Code212',
  trainer: 'Équipe Code212', moderator: 'Modérateur', supervisor: 'Superviseur', mentor: 'Mentor',
}
const statusNames = { 'warned-1': 'Averti', 'warned-2': 'Averti · 2', banned: 'Banni' }
const badgeUrl = (name: string, supplied?: string) => supplied || (badgeArt[name.toLocaleLowerCase('fr-FR').trim()] ? `/v09-badges/${badgeArt[name.toLocaleLowerCase('fr-FR').trim()]}.png` : undefined)

/** Only display identity details and awards actually supplied by the API. */
export function ForgeAuthorCard({ author }: Props) {
  const roles = [...new Set([
    ...(author.isDirector ? ['director'] : []),
    ...(author.communityRoles ?? []),
    ...(author.role && roleNames[author.role] ? [author.role === 'trainer' ? 'team' : author.role] : []),
  ])]
  const director = roles.includes('director')
  const moderator = roles.includes('moderator')
  const institutional = author.pseudonym === 'Équipe CODE212' || (author.role === 'admin' && author.communityRoles?.includes('team'))
  // An administrator is a platform operator, distinct from the institutional
  // Code212 account. Their identity deliberately carries no gamification data.
  const administrator = author.role === 'admin' && !institutional
  const lastLoginAt = (author as ForgeAuthorIdentity & { lastLoginAt?: string | null }).lastLoginAt
  const lastLoginDate = lastLoginAt && !Number.isNaN(Date.parse(lastLoginAt)) ? new Date(lastLoginAt) : null
  const displayRoles = (administrator ? roles.filter((role) => role !== 'admin') : roles)
    .filter((role) => role !== 'moderator')
  const pct = typeof author.levelProgress === 'number' && Number.isFinite(author.levelProgress)
    ? Math.max(0, Math.min(100, author.levelProgress)) : null
  const level = typeof author.level === 'number' && Number.isFinite(author.level) ? Math.max(0, Math.floor(author.level)) : null
  const starCount = typeof author.starCount === 'number' && Number.isFinite(author.starCount)
    ? Math.max(0, Math.min(24, Math.floor(author.starCount))) : level
  const badges = author.badges ?? []
  const status = author.moderationStatus
  const moderationLabel = status && status !== 'normal' ? statusNames[status] : null
  const reported = (author.reportCount ?? 0) > 0
  const isSanctioned = status === 'banned' || status === 'warned-1' || status === 'warned-2'
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    if (!isSanctioned || !author.moderationEndsAt) { setRemaining(''); return }
    const update = () => {
      const ms = new Date(author.moderationEndsAt as string).getTime() - Date.now()
      if (ms <= 0) { setRemaining('Sanction terminée'); return }
      const days = Math.floor(ms / 86400000)
      const hours = Math.floor((ms % 86400000) / 3600000)
      const minutes = Math.floor((ms % 3600000) / 60000)
      setRemaining(`${days}j ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m restantes`)
    }
    update()
    const timer = window.setInterval(update, 60000)
    return () => window.clearInterval(timer)
  }, [author.moderationEndsAt, isSanctioned, status])
  const stats = [
    { value: author.xp, label: 'XP', Icon: Zap, color: 'text-[#ffd05a]' },
    { value: author.germs, label: 'Germs', Icon: Gem, color: 'text-[#32dff4]' },
    { value: author.messageCount, label: 'Messages dans la Forge', Icon: MessageCircle, color: 'text-[#c5a8ff]' },
  ].filter(stat => typeof stat.value === 'number' && Number.isFinite(stat.value))

  return (
    <aside aria-label={`Identité de ${author.pseudonym}`} className={cn(
      'relative h-fit w-[272px] max-w-full min-w-0 shrink-0 self-start overflow-hidden rounded-2xl border border-[#344666] bg-[#17223a] text-[#eaf1ff] shadow-[0_14px_32px_rgba(0,0,0,.18)]',
      director && 'border-[#b99555]/60 bg-[#11182b]',
      status === 'banned' && 'border-rose-500/70',
      status === 'banned' && 'bg-[#2a111d] shadow-[0_16px_34px_rgba(190,24,93,.22)]',
      isSanctioned && status !== 'banned' && 'border-orange-400/70 bg-[#2b2016] shadow-[0_16px_34px_rgba(234,88,12,.18)]',
      institutional && 'border-[#d946ef]/60 bg-[#17132e] shadow-[0_16px_38px_rgba(168,85,247,.22)]',
      moderator && 'border-emerald-400/60 bg-[#102b25] shadow-[0_16px_38px_rgba(16,185,129,.22)]',
      administrator && 'border-cyan-300/70 bg-[#102b36] shadow-[0_16px_38px_rgba(0,223,255,.16)]',
    )}>
      {administrator && <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(103,232,249,.26) 1px, transparent 1.2px), linear-gradient(135deg, transparent 46%, rgba(34,211,238,.08) 47%, rgba(34,211,238,.08) 53%, transparent 54%)',
          backgroundSize: '14px 14px, 38px 38px',
        }}
      />}
      <div className={cn('h-[3px] bg-gradient-to-r from-[#c5027f] via-[#8d55fa] to-[#00dfff]', director && 'from-[#d3a958] via-[#faf0cf] to-[#8f6a3d]', status === 'banned' && 'from-[#fb7185] via-[#e11d48] to-[#7f1d1d]', isSanctioned && status !== 'banned' && 'from-[#fbbf24] via-[#f97316] to-[#c2410c]', institutional && 'from-[#d946ef] via-[#8b5cf6] to-[#84cc16]', moderator && 'from-[#34d399] via-[#10b981] to-[#06b6d4]', administrator && 'from-[#00dfff] via-[#54e9f8] to-[#00b8d4]')} />
      <header className="relative flex items-center gap-3 px-3.5 pb-2.5 pt-3.5">
        <div className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-[#27d4e6] via-[#7d6cff] to-[#e96bd0] p-[2px] [clip-path:polygon(0_0,84%_0,100%_16%,100%_84%,84%_100%,16%_100%,0_84%,0_16%)]', director && 'from-[#d3a958] via-[#faf0cf] to-[#8f6a3d]', institutional && 'from-[#d946ef] via-[#8b5cf6] to-[#84cc16]', moderator && 'from-[#34d399] via-[#10b981] to-[#06b6d4]', administrator && 'from-[#00dfff] via-[#54e9f8] to-[#00b8d4]')}>
          <div className="grid h-full w-full place-items-center overflow-hidden rounded-[15px] bg-[#0c1930] text-sm font-extrabold text-white [clip-path:polygon(0_0,84%_0,100%_16%,100%_84%,84%_100%,16%_100%,0_84%,0_16%)]">
            {author.avatarUrl ? <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : initials(author.pseudonym)}
          </div>
        </div>
        {administrator && <span aria-hidden="true" className="absolute left-[52px] top-[48px] grid h-7 w-7 place-items-center bg-[#043447] p-[2px] shadow-[0_4px_0_#04212d,0_8px_13px_rgba(0,0,0,.38)] [clip-path:polygon(50%_0,92%_16%,92%_57%,50%_100%,8%_57%,8%_16%)]">
          <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#d7fbff] via-[#25dff3] to-[#087fa6] shadow-[inset_0_1px_2px_rgba(255,255,255,.95),inset_0_-3px_5px_rgba(1,56,77,.65)] [clip-path:polygon(50%_0,92%_16%,92%_57%,50%_100%,8%_57%,8%_16%)]">
            <ShieldCheck className="h-3.5 w-3.5 translate-y-[-1px] text-[#07344d] drop-shadow-[0_1px_0_rgba(255,255,255,.75)]" strokeWidth={3} />
          </span>
        </span>}
        {moderator && !institutional && <span aria-hidden="true" className="absolute left-[52px] top-[48px] grid h-7 w-7 place-items-center bg-[#063d38] p-[2px] shadow-[0_4px_0_#032823,0_8px_13px_rgba(0,0,0,.38)] [clip-path:polygon(50%_0,92%_16%,92%_57%,50%_100%,8%_57%,8%_16%)]">
          <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#c4fff2] via-[#34d399] to-[#078c91] shadow-[inset_0_1px_2px_rgba(255,255,255,.95),inset_0_-3px_5px_rgba(2,78,71,.7)] [clip-path:polygon(50%_0,92%_16%,92%_57%,50%_100%,8%_57%,8%_16%)]">
            <ShieldCheck className="h-3.5 w-3.5 translate-y-[-1px] text-[#064a46] drop-shadow-[0_1px_0_rgba(255,255,255,.75)]" strokeWidth={3} />
          </span>
        </span>}
        {institutional && <span aria-hidden="true" className="absolute left-[52px] top-[48px] grid h-7 w-7 place-items-center bg-[#281452] p-[2px] shadow-[0_4px_0_#150a31,0_8px_13px_rgba(0,0,0,.38)] [clip-path:polygon(25%_0,75%_0,100%_25%,100%_75%,75%_100%,25%_100%,0_75%,0_25%)]">
          <span className="relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-[#fde7ff] via-[#c084fc] to-[#22d3ee] shadow-[inset_0_1px_2px_rgba(255,255,255,.95),inset_0_-3px_5px_rgba(76,29,149,.68)] [clip-path:polygon(25%_0,75%_0,100%_25%,100%_75%,75%_100%,25%_100%,0_75%,0_25%)]">
            <span className="absolute inset-[5px] border border-fuchsia-100/80 [clip-path:inherit]" />
            <span className="relative font-mono text-[8px] font-black tracking-[-.12em] text-violet-950 drop-shadow-[0_1px_0_rgba(255,255,255,.8)]">C2</span>
          </span>
        </span>}
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-extrabold text-[#f4f7ff]', institutional && 'bg-gradient-to-r from-fuchsia-300 via-violet-200 to-lime-300 bg-clip-text text-base tracking-wide text-transparent')} title={author.pseudonym}>{author.pseudonym}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {administrator && <span className="rounded border border-cyan-200/40 bg-cyan-300/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-100">Administrateur</span>}
            {(administrator || institutional) && <span className="rounded border border-white/20 bg-[#0b1e2a]/80 px-1.5 py-0.5 text-[10px] font-extrabold tracking-[.08em] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"><span className="text-white">CODE</span><span className="ml-1 text-fuchsia-300">212</span></span>}
            {!institutional && roles.includes('mentor') && <span className="rounded bg-[#8e66e9]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#d0b8ff]">Mentor</span>}
            {!institutional && author.type && <span className="rounded bg-[#00dfff]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#58e6fa]">{author.type}</span>}
          </div>
        </div>
      </header>
      {isSanctioned && <div className={cn('mx-3.5 mt-1 flex flex-col items-center rounded-xl border px-3 py-3 text-center', status === 'banned' ? 'border-rose-400/35 bg-gradient-to-b from-rose-500/20 to-rose-950/20' : 'border-orange-300/40 bg-gradient-to-b from-orange-500/20 to-orange-950/20')}>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.14em]', status === 'banned' ? 'border-rose-300/50 bg-rose-500/25 text-rose-100' : 'border-orange-200/60 bg-orange-500/25 text-orange-100')}><ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />{status === 'banned' ? 'Compte banni' : 'Compte averti'}</span>
        {author.moderationReason && <p className={cn('mt-2 text-[10px] leading-relaxed', status === 'banned' ? 'text-rose-100/80' : 'text-orange-100/85')}>{author.moderationReason}</p>}
        {author.moderationEndsAt ? <p className={cn('mt-2 font-mono text-[11px] font-bold tabular-nums', status === 'banned' ? 'text-rose-200' : 'text-orange-200')} aria-live="polite">{remaining}</p> : <p className={cn('mt-2 text-[10px] font-semibold', status === 'banned' ? 'text-rose-200' : 'text-orange-200')}>Durée indéterminée</p>}
      </div>}
      {(institutional || administrator) && <section aria-label={institutional ? 'Présentation de l’Équipe CODE212' : 'Présentation de l’Administrateur'} className="relative mx-3.5 mb-3.5 mt-1 rounded-xl border border-white/15 bg-white/[.045] px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_18px_rgba(34,211,238,.06)] backdrop-blur-sm">
        <p className="text-[11px] leading-relaxed text-[#e4eaf6]">{institutional
          ? 'L’équipe officielle CODE212 vous accompagne dans vos apprentissages, vos projets et la vie du centre.'
          : 'L’administration veille au bon fonctionnement de la plateforme et vous oriente en cas de difficulté technique ou de compte.'}</p>
        <div className="mt-3 border-t border-white/10 pt-2.5">
          <p className="text-[10px] text-[#aebed6]">Dernière connexion</p>
          <p className="mt-0.5 text-[11px] font-semibold text-[#eaf1ff]" title={lastLoginDate?.toLocaleString('fr-FR')}>{lastLoginDate ? lastLoginDate.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Non disponible'}</p>
        </div>
        <button type="button" disabled title="La messagerie privée sera disponible prochainement" aria-label={`Contacter ${author.pseudonym} : messagerie bientôt disponible`} className="mt-3 inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#d5e2f5] opacity-70">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Contacter · bientôt
        </button>
        <p className="mt-2 text-[10px] text-[#aebed6]">{institutional ? 'Compte institutionnel · CODE212' : 'Compte d’administration · CODE212'}</p>
      </section>}
      {moderator && !institutional && <div className="relative mx-3.5 mt-1 flex items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-emerald-300/45 bg-gradient-to-r from-[#07564c]/60 via-emerald-400/20 to-cyan-400/15 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-emerald-100 shadow-[inset_0_1px_0_rgba(209,250,229,.2),0_0_20px_rgba(16,185,129,.14)]">
        <span aria-hidden="true" className="absolute inset-0 opacity-45" style={{ backgroundImage: 'linear-gradient(90deg, rgba(110,231,183,.15) 1px, transparent 1px), linear-gradient(rgba(34,211,238,.12) 1px, transparent 1px)', backgroundSize: '7px 7px' }} />
        <span aria-hidden="true" className="absolute inset-y-1.5 left-1.5 w-1 rounded-sm bg-gradient-to-b from-cyan-300 via-emerald-300 to-transparent" />
        <ShieldCheck className="relative h-3.5 w-3.5 shrink-0 text-cyan-100" aria-hidden="true" /><span className="relative">Modération</span>
      </div>}
      {!institutional && !administrator && <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-3.5 pb-3.5 pt-1">
        {level !== null && <p className="col-span-2 text-[11px] font-extrabold uppercase tracking-wide">Niveau {level}</p>}
        {(level !== null || pct !== null) && <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap text-sm tracking-[1px] text-[#ffcc4f]" aria-label={level !== null ? `Niveau ${level}` : undefined}>{starCount !== null ? '★'.repeat(Math.min(10, starCount)) : ''}</span>
            {pct !== null && <span className="text-xs font-bold tabular-nums text-[#d3dff1]">{Math.round(pct)}%</span>}
          </div>
          {pct !== null && <div className="h-1.5 overflow-hidden rounded-full bg-[#33435e]" role="progressbar" aria-label="Progression de niveau" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-gradient-to-r from-[#21cce8] to-[#38d5a2]" style={{ width: `${pct}%` }} /></div>}
        </div>}
        {stats.length > 0 && <div className="col-span-2 flex flex-wrap items-center justify-start gap-x-4 gap-y-1 text-xs font-extrabold tabular-nums">
          {stats.map(({ value, label, Icon, color }) => <span key={label} title={label} aria-label={`${value?.toLocaleString('fr-FR')} ${label}`} className={cn('inline-flex items-center gap-1 [overflow-wrap:anywhere]', color)}><Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{value?.toLocaleString('fr-FR')}</span>)}
        </div>}
        {author.levelTitle && <span className="col-span-2 inline-flex w-fit max-w-full items-center rounded-md border border-[#8d69c8]/40 bg-[#8e66e9]/10 px-2 py-1 text-[10px] font-bold text-[#d0b8ff] [overflow-wrap:anywhere]">{author.levelTitle}</span>}
        {displayRoles.length > 0 && <div className="col-span-2 flex flex-wrap items-center gap-1.5" aria-label="Rôles du membre">
          {director && <img src="/director-insignia/uca-directeur.png" alt="Insigne Directeur UCA" className="h-10 w-10 object-contain" loading="lazy" />}
          {displayRoles.map(role => <span key={role} className={cn('rounded border border-[#8d69c8]/40 bg-[#8e66e9]/10 px-2 py-1 text-[10px] font-bold text-[#d0b8ff]', role === 'director' && 'border-[#b99555]/50 bg-[#b99555]/10 text-[#ebc987]', role === 'moderator' && 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200')}>{roleNames[role]}</span>)}
        </div>}
        {(moderationLabel && !isSanctioned || reported) && <div className="col-span-2 flex flex-wrap gap-1.5" aria-label="Statut de modération">
          {moderationLabel && !isSanctioned && <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-1 text-[10px] font-bold text-amber-300"><ShieldAlert className="h-3 w-3" aria-hidden="true" />{moderationLabel}</span>}
          {reported && <span className="inline-flex items-center gap-1 rounded bg-orange-500/15 px-2 py-1 text-[10px] font-bold text-orange-300"><ShieldAlert className="h-3 w-3" aria-hidden="true" />Signalé</span>}
        </div>}
        <section className="col-span-2 pt-1" aria-label="Badges obtenus">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#aabbd6]">Badges {badges.length ? `· ${badges.length}` : ''}</p>
          {badges.length ? <>
            <div className="grid grid-cols-6 grid-flow-row gap-0">{badges.slice(0, 18).map((badge, i) => {
              const src = badgeUrl(badge.name, badge.imageUrl)
              return <span key={`${badge.id}-${i}`} title={badge.name} className="grid aspect-square place-items-center">{src ? <img src={src} alt={badge.name} className="h-[82%] w-[82%] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,.45)]" loading="lazy" /> : <span role="img" aria-label={badge.name} className="text-lg">🏅</span>}</span>
            })}</div>
            {badges.length > 18 && <p className="mt-2 text-[10px] text-[#b5c5df]">+{badges.length - 18} autre{badges.length > 19 ? 's' : ''} badge{badges.length > 19 ? 's' : ''}</p>}
          </> : <p className="text-[11px] text-[#aabbd6]">Aucun badge attribué</p>}
        </section>
      </div>}
    </aside>
  )
}
