import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  icon,
  label,
  value,
  note,
  tone = 'primary',
  className,
}: {
  icon: ReactNode
  label: string
  value: string
  note?: string
  tone?: 'primary' | 'accent' | 'cyan' | 'warning'
  className?: string
}) {
  const tones = {
    primary: 'bg-primary-soft text-primary',
    accent: 'bg-accent-soft text-accent',
    cyan: 'bg-cyan-soft text-cyan-fg',
    warning: 'bg-warning-soft text-warning',
  }
  return (
    <div className={cn('panel p-4 transition-transform duration-300 hover:-translate-y-0.5', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}>{icon}</span>
      </div>
      <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{label}</p>
      <p className="mt-0.5 font-display text-[26px] font-bold leading-none tracking-tight text-fg">{value}</p>
      {note && <p className="mt-1.5 text-[11.5px] leading-snug text-fg-muted">{note}</p>}
    </div>
  )
}
