import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
  tone?: 'primary' | 'accent' | 'cyan' | 'success'
}

export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, indicatorClassName, tone = 'primary', ...props }, ref) => {
    const tones = {
      primary: 'bg-brand-gradient',
      accent: 'bg-accent',
      cyan: 'bg-cyan',
      success: 'bg-success',
    }
    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tones[tone], indicatorClassName)}
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
        />
      </ProgressPrimitive.Root>
    )
  },
)
Progress.displayName = 'Progress'
