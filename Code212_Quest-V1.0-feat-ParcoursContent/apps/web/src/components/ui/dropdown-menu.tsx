import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[190px] overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-lift)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-fg-muted outline-none transition-colors hover:bg-surface-2 hover:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
