import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg transition-colors placeholder:text-fg-subtle focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg-subtle focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-[13px] font-semibold text-fg', className)} {...props} />
  ),
)
Label.displayName = 'Label'
