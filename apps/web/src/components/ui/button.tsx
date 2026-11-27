import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-55 active:scale-[.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-gradient text-white shadow-[0_6px_18px_-8px_rgba(197,2,127,.65)] hover:shadow-[0_10px_26px_-10px_rgba(103,1,230,.75)] hover:brightness-110',
        accent:
          'bg-accent text-accent-fg shadow-[0_6px_18px_-8px_rgba(197,2,127,.6)] hover:brightness-110',
        cyan: 'bg-cyan text-[#04222b] font-bold hover:brightness-105',
        outline: 'border border-border-strong bg-surface text-fg hover:border-primary/50 hover:bg-primary-soft hover:text-primary',
        ghost: 'text-fg-muted hover:bg-surface-3 hover:text-fg',
        soft: 'bg-primary-soft text-primary hover:bg-primary/15',
        danger: 'bg-danger text-white hover:brightness-105',
        dark: 'bg-fg text-bg hover:opacity-90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
