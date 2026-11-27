import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'
import { useAuth } from '@/lib/auth'

interface RequireAuthProps {
  children: ReactNode
  /** Si fourni, l'utilisateur doit avoir au moins un de ces rôles. */
  roles?: UserRole[]
}

/**
 * Protège une route :
 * - Non authentifié → `/login`
 * - Authentifié sans le bon rôle → `/` (espace par défaut)
 */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { status, hasRole } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
