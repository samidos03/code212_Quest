import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: {
  kicker?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {kicker && <p className="kicker mb-1.5">{kicker}</p>}
        <h1 className="text-[26px] font-bold leading-tight text-fg sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionHeading({
  kicker,
  title,
  action,
  className,
}: {
  kicker?: string
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-4', className)}>
      <div>
        {kicker && <p className="kicker mb-1">{kicker}</p>}
        <h2 className="text-[17px] font-bold text-fg sm:text-[19px]">{title}</h2>
      </div>
      {action}
    </div>
  )
}
