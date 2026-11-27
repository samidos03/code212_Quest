import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export type ThemeMode = 'light' | 'dark'
/** `null` = suivre l'espace courant (pédagogique = clair, compétitif = sombre). */
export type ThemePreference = ThemeMode | null

const STORAGE_KEY = 'code212.theme'

/**
 * Règles de thème par espace.
 * Clair  → espaces pédagogiques (tableau de bord, quêtes, parcours, badges, profil, admin).
 * Sombre → arène, compétitions et classements (mode « game »).
 */
const DARK_ROUTES = ['/arena', '/leaderboard', '/admin/arena']

export function resolveRouteTheme(pathname: string): ThemeMode {
  return DARK_ROUTES.some((route) => pathname.startsWith(route)) ? 'dark' : 'light'
}

interface ThemeContextValue {
  /** Thème réellement appliqué */
  theme: ThemeMode
  /** Préférence explicite de l'utilisateur (null = auto) */
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggle: () => void
  /** true si l'utilisateur a forcé un thème manuellement */
  isManual: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return null
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  })

  const routeTheme = resolveRouteTheme(pathname)
  const theme = preference ?? routeTheme

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    root.classList.add('theme-anim')
    const timer = window.setTimeout(() => root.classList.remove('theme-anim'), 320)
    return () => window.clearTimeout(timer)
  }, [theme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    if (next === null) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setPreferenceState((current) => {
      const active = current ?? routeTheme
      const next: ThemeMode = active === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [routeTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, toggle, isManual: preference !== null }),
    [theme, preference, setPreference, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>')
  return ctx
}
