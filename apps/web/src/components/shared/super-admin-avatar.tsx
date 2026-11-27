import { cn } from '@/lib/utils'

/**
 * Emblème « Directeur · Super Admin » de Code212 Quest.
 *
 * Blason vectoriel (couronne de direction, laurier, monogramme 212 sur la
 * tuile de la charte, anneau magenta → violet → cyan). Il remplace l'avatar
 * à initiales du compte de direction : il se distingue immédiatement des
 * profils apprenants et rend le statut visible d'un coup d'œil.
 *
 * Source : `public/avatars/super-admin.svg` (généré par
 * `scripts/generate-avatar-assets.mjs`, avec exports PNG 512/256/128/64).
 */
export function SuperAdminAvatar({
  size = 36,
  className,
  title = 'Directeur · Super Admin Code212',
}: {
  size?: number
  className?: string
  title?: string
}) {
  return (
    <span
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
      title={title}
    >
      <img
        src="/avatars/super-admin.svg"
        alt={title}
        width={size}
        height={size}
        className="h-full w-full select-none"
        draggable={false}
      />
    </span>
  )
}

/** Ruban doré « Super Admin » posé sous l'emblème. */
export function SuperAdminRibbon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[#e8b84b]/45 bg-[#e8b84b]/12 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#b98a20] dark:text-[#e8b84b]',
        className,
      )}
    >
      ◆ Super Admin
    </span>
  )
}
