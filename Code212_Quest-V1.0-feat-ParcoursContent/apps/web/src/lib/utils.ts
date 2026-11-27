import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Équivalent `Intl.NumberFormat` fr-FR compact pour les KPI. */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('fr-FR', options).format(value)
}

export function formatXp(value: number) {
  return `${formatNumber(value)} XP`
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits).replace('.', ',')} %`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

export function formatDate(iso: string, withYear = true) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(d)
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 30) return `il y a ${days} j`
  return formatDate(iso)
}

export function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
}

export const DIFFICULTY_TONE: Record<string, string> = {
  debutant: 'text-cyan-fg bg-cyan-soft',
  intermediaire: 'text-primary bg-primary-soft',
  avance: 'text-accent bg-accent-soft',
  expert: 'text-warning bg-warning-soft',
}

export const RARITY_LABEL: Record<string, string> = {
  commun: 'Commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire',
}

export const RARITY_TONE: Record<string, string> = {
  commun: 'text-fg-muted bg-surface-3',
  rare: 'text-cyan-fg bg-cyan-soft',
  epique: 'text-accent bg-accent-soft',
  legendaire: 'text-warning bg-warning-soft',
}

export const TRACK_LABEL: Record<string, string> = {
  codeur: 'Codeur',
  aidant: 'Aidant',
  batisseur: 'Bâtisseur',
  explorateur: 'Explorateur',
}

export const TRACK_COLOR: Record<string, string> = {
  codeur: '#6701e6',
  aidant: '#c5027f',
  batisseur: '#00b8d4',
  explorateur: '#f59e0b',
}
