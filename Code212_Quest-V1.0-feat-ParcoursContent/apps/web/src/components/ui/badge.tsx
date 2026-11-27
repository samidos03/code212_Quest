import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-fg-muted',
        primary: 'border-primary/25 bg-primary-soft text-primary',
        accent: 'border-accent/25 bg-accent-soft text-accent',
        cyan: 'border-cyan/30 bg-cyan-soft text-cyan-fg',
        success: 'border-success/25 bg-success-soft text-success',
        warning: 'border-warning/25 bg-warning-soft text-warning',
        danger: 'border-danger/25 bg-danger-soft text-danger',
        outline: 'border-border-strong bg-transparent text-fg-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
