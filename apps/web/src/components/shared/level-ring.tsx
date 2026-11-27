import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Anneau de progression du niveau — repère visuel central du tableau de bord.
 *
 * Le dégradé de marque est calé sur le sens de parcours du cercle
 * (12 h → 3 h à l'écran) : magenta au départ, cyan à l'arrivée.
 */
export function LevelRing({
  value,
  size = 132,
  stroke = 10,
  label,
  caption,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  label: ReactNode
  caption?: string
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const center = size / 2

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient
              id="ringGradient"
              gradientUnits="userSpaceOnUse"
              x1={center + radius}
              y1={center}
              x2={center}
              y2={center + radius}
            >
              <stop offset="0%" stopColor="#c5027f" />
              <stop offset="55%" stopColor="#6701e6" />
              <stop offset="100%" stopColor="#00dfff" />
            </linearGradient>
          </defs>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-surface-3" />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (clamped / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="font-display text-[34px] font-bold leading-none text-fg">{label}</div>
        </div>
      </div>
      {caption && (
        <div className="mt-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">{caption}</div>
      )}
    </div>
  )
}
