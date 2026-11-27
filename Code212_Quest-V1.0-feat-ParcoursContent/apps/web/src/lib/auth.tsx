import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'

/* ------------------------------------------------------------------ types */

export interface AuthUser {
  id: number
  firstName: string
  lastName: string
  displayName: string
  email: string
  roles: UserRole[]
  /** true = compte Directeur / Super Admin (affichage emblème doré) */
  isDirector?: boolean
  level: number
  xp: number
  germs: number
  avatarUrl?: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  login: (credentials: { email: string; password: string }) => Promise<void>
  loginWithUca: () => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
  isDirector: boolean
  /** Route d'atterrissage selon le rôle principal */
  defaultPath: string
}

/* -------------------------------------------------------------- constants */

const STORAGE_KEY = 'code212.auth'
const TOKEN_KEY = 'code212.api_token'
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/** Résout la route d'atterrissage selon le premier rôle élevé de l'utilisateur. */
export function resolveDefaultPath(roles: UserRole[], isDirector?: boolean): string {
  if (isDirector) return '/director'
  if (roles.includes('admin')) return '/administrator'
  if (roles.includes('trainer')) return '/team'
  if (roles.includes('moderator')) return '/moderator'
  return '/'
}

/* --------------------------------------------------------------- mock auth */

/** Comptes de démonstration pour chaque espace. Mot de passe unique : `demo`. */
const DEMO_ACCOUNTS: Record<string, AuthUser & { password: string }> = {
  'apprenant@code212.ma': {
    id: 1,
    firstName: 'Youssef',
    lastName: 'Alami',
    displayName: 'Youssef Alami',
    email: 'apprenant@code212.ma',
    password: 'demo',
    roles: ['student'],
    level: 7,
    xp: 4820,
    germs: 310,
  },
  'directeur@code212.ma': {
    id: 2,
    firstName: 'Walid',
    lastName: 'Bouarifi',
    displayName: 'Walid Bouarifi',
    email: 'directeur@code212.ma',
    password: 'demo',
    roles: ['admin'],
    isDirector: true,
    level: 1,
    xp: 0,
    germs: 0,
  },
  'admin@code212.ma': {
    id: 5,
    firstName: 'Fatima',
    lastName: 'Zahra',
    displayName: 'Fatima Zahra',
    email: 'admin@code212.ma',
    password: 'demo',
    roles: ['admin'],
    isDirector: false,
    level: 1,
    xp: 0,
    germs: 0,
  },
  'equipe@code212.ma': {
    id: 3,
    firstName: 'Karim',
    lastName: 'Benali',
    displayName: 'Karim Benali',
    email: 'equipe@code212.ma',
    password: 'demo',
    roles: ['trainer'],
    level: 1,
    xp: 0,
    germs: 0,
  },
  'moderateur@code212.ma': {
    id: 4,
    firstName: 'Sara',
    lastName: 'El Idrissi',
    displayName: 'Sara El Idrissi',
    email: 'moderateur@code212.ma',
    password: 'demo',
    roles: ['moderator'],
    level: 1,
    xp: 0,
    germs: 0,
  },
}

/* --------------------------------------------------------------- context  */

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  /* Restore session from localStorage on mount */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && (USE_MOCK || window.sessionStorage.getItem(TOKEN_KEY))) {
        const parsed = JSON.parse(stored) as AuthUser
        setUser(parsed)
        setStatus('authenticated')
      } else {
        setStatus('unauthenticated')
      }
    } catch {
      setStatus('unauthenticated')
    }
  }, [])

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800))
      const account = DEMO_ACCOUNTS[credentials.email.toLowerCase()]
      if (!account || account.password !== credentials.password) {
        throw new Error('Identifiants incorrects. En mode démo, utilisez un compte de la liste.')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...authUser } = account
      setUser(authUser)
      setStatus('authenticated')
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
      return
    }

    // L'API Laravel attend des champs francais et retourne un jeton Sanctum.
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifiant: credentials.email, mot_de_passe: credentials.password }),
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.message ?? 'Erreur de connexion')
    }
    const payload = await res.json()
    const result = payload.data ?? payload
    if (!result.token || !result.utilisateur) throw new Error('Reponse de connexion Laravel incomplete.')
    const profile = result.utilisateur
    const fullName = String(profile.nom ?? '')
    const parts = fullName.trim().split(/\s+/)
    const roles = Array.isArray(profile.roles)
      ? profile.roles.map((role: { code?: string } | string) => typeof role === 'string' ? role : role.code).filter(Boolean) as UserRole[]
      : []
    const authUser: AuthUser = {
      id: Number(profile.id), firstName: parts[0] ?? '', lastName: parts.slice(1).join(' '),
      displayName: fullName, email: String(profile.email ?? credentials.email),
      roles, level: Number(profile.niveau ?? 1), xp: Number(profile.xp ?? 0),
      germs: Number(profile.germes ?? 0), avatarUrl: profile.avatar ?? undefined,
    }
    window.sessionStorage.setItem(TOKEN_KEY, String(result.token))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
    setStatus('authenticated')
  }, [])

  const loginWithUca = useCallback(() => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/uca`
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
    window.localStorage.removeItem(STORAGE_KEY)
    window.sessionStorage.removeItem(TOKEN_KEY)
  }, [])

  const hasRole = useCallback(
    (role: UserRole) => user?.roles.includes(role) ?? false,
    [user],
  )

  const isDirector = user?.isDirector === true

  const defaultPath = useMemo(
    () => resolveDefaultPath(user?.roles ?? [], user?.isDirector),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, loginWithUca, logout, hasRole, isDirector, defaultPath }),
    [user, status, login, loginWithUca, logout, hasRole, isDirector, defaultPath],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
