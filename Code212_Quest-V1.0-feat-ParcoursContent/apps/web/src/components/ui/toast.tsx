import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  title: string
  description?: string
  kind: ToastKind
}

interface ToastContextValue {
  toast: (title: string, options?: { description?: string; kind?: ToastKind; duration?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback<ToastContextValue['toast']>((title, options) => {
    counter.current += 1
    const id = counter.current
    setItems((current) => [...current, { id, title, description: options?.description, kind: options?.kind ?? 'success' }])
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id))
    }, options?.duration ?? 4200)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-[var(--shadow-lift)]',
                item.kind === 'success' && 'border-success/30',
                item.kind === 'error' && 'border-danger/30',
                item.kind === 'info' && 'border-primary/30',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                  item.kind === 'success' && 'bg-success-soft text-success',
                  item.kind === 'error' && 'bg-danger-soft text-danger',
                  item.kind === 'info' && 'bg-primary-soft text-primary',
                )}
              >
                {item.kind === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {item.kind === 'error' && <TriangleAlert className="h-4 w-4" />}
                {item.kind === 'info' && <Info className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-snug text-fg">{item.title}</p>
                {item.description && <p className="mt-0.5 text-[12px] leading-snug text-fg-muted">{item.description}</p>}
              </div>
              <button
                onClick={() => setItems((current) => current.filter((i) => i.id !== item.id))}
                className="rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                aria-label="Fermer la notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>')
  return ctx
}
