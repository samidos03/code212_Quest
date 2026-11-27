import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { brandMarks } from '@/lib/navigation'

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-3', className)} aria-label="Code212 Quest — accueil">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-[0_8px_20px_-8px_rgba(197,2,127,.7)]">
        <span className="font-display text-[17px] font-bold leading-none tracking-tight">212</span>
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block font-display text-[21px] font-bold leading-none tracking-[0.12em] text-fg">
            CODE<span className="text-accent">212</span>
          </span>
          <span className="mt-1 block truncate text-[8px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
            {brandMarks.caption}
          </span>
        </span>
      )}
    </Link>
  )
}
