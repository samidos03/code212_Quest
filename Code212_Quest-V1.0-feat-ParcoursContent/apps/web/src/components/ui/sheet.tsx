import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Panneau latéral (navigation mobile, filtres). */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' }
>(({ className, children, side = 'left', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0b0716]/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col bg-surface shadow-[var(--shadow-lift)] transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
        side === 'left' ? 'inset-y-0 left-0 h-full w-[86vw] max-w-[300px] border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left' : 'inset-y-0 right-0 h-full w-[90vw] max-w-[380px] border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg">
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1 p-5 pr-12', className)} {...props} />
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('font-display text-lg font-bold', className)} {...props} />
))
SheetTitle.displayName = 'SheetTitle'
