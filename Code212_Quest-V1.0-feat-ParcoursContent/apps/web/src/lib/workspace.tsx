import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Les six espaces de la plateforme. */
export type Space = 'student' | 'director' | 'administrator' | 'team' | 'moderator' | 'admin'

const STORAGE_KEY = 'code212.space'

interface WorkspaceContextValue {
  space: Space
  setSpace: (space: Space) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

/** Déduit l'espace courant depuis le pathname. */
function resolveSpace(pathname: string, preference: Space): Space {
  if (pathname.startsWith('/director')) return 'director'
  if (pathname.startsWith('/administrator')) return 'administrator'
  if (pathname.startsWith('/team')) return 'team'
  if (pathname.startsWith('/moderator')) return 'moderator'
  if (pathname.startsWith('/admin')) return 'admin'
  if (
    pathname === '/' ||
    pathname.startsWith('/quests') ||
    pathname.startsWith('/paths') ||
    pathname.startsWith('/missions') ||
    pathname.startsWith('/badges') ||
    pathname.startsWith('/forge') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/certifications') ||
    pathname.startsWith('/arena') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/profile')
  ) {
    return 'student'
  }
  const valid: Space[] = ['student', 'director', 'administrator', 'team', 'moderator', 'admin']
  return valid.includes(preference) ? preference : 'student'
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [preference, setPreference] = useState<Space>(() => {
    if (typeof window === 'undefined') return 'student'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const valid: Space[] = ['student', 'director', 'administrator', 'team', 'moderator', 'admin']
    return valid.includes(stored as Space) ? (stored as Space) : 'student'
  })

  const space: Space = resolveSpace(pathname, preference)

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      space,
      setSpace: (next) => {
        window.localStorage.setItem(STORAGE_KEY, next)
        setPreference(next)
      },
    }),
    [space],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace doit être utilisé dans <WorkspaceProvider>')
  return ctx
}
