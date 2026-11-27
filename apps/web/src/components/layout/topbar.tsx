import { useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useDirectorIdentity } from '@/lib/director-identity'
import { useStudentIdentity } from '@/lib/student-identity'
import { Link, useLocation } from 'react-router-dom'
import { Bell, ChevronRight, Menu, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { adminNav, studentNav } from '@/lib/navigation'
import { useWorkspace } from '@/lib/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function usePageTitle() {
  const { pathname } = useLocation()
  const { space } = useWorkspace()
  const groups = space === 'admin' ? adminNav : studentNav
  return useMemo(() => {
    const all = groups.flatMap((g) => g.items)
    const match =
      all.find((item) => item.to !== '/' && pathname.startsWith(item.to)) ??
      all.find((item) => item.to === pathname) ??
      all.find((item) => item.to === '/' && pathname === '/')
    return match?.label ?? 'Code212 Quest'
  }, [pathname, groups])
}

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const { theme, toggle } = useTheme()
  const { space } = useWorkspace()
  const title = usePageTitle()
  const { user, isDirector } = useAuth()
  const { identity } = useDirectorIdentity()
  const { identity: studentIdentity } = useStudentIdentity()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenNav} aria-label="Ouvrir la navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Fil d'Ariane">
        <Link to={space === 'admin' ? '/admin' : '/'} className="hidden shrink-0 font-semibold text-fg-subtle transition-colors hover:text-fg sm:block">
          {space === 'admin' ? 'Administration' : 'Code212 Quest'}
        </Link>
        <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-fg-subtle sm:block" />
        <span className="truncate font-semibold text-fg">{title}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            placeholder="Rechercher une quête, un badge…"
            className="h-9 w-64 pl-9 pr-14 text-[13px]"
            aria-label="Recherche"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-fg-subtle">
            ⌘K
          </kbd>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === 'dark' ? 'Thème clair' : 'Thème sombre'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>3 notifications</TooltipContent>
        </Tooltip>

        <Link to={isDirector ? '/director/profile' : '/profile'} className="ml-1 inline-flex items-center gap-2 rounded-xl border border-border px-2 py-1 hover:border-primary/40" aria-label="Mon profil et préférences" title="Modifier mon profil">
          {isDirector ? (
            <img src={identity.avatar} alt="Avatar du Directeur" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <Avatar className="h-9 w-9 rounded-xl">
              {studentIdentity.avatar && <img src={studentIdentity.avatar} alt="Avatar" className="h-full w-full object-cover" />}
              <AvatarFallback>{initials(studentIdentity.nickname || user?.displayName || 'Utilisateur')}</AvatarFallback>
            </Avatar>
          )}
          <span className="hidden max-w-36 truncate text-xs font-semibold text-fg lg:block">{isDirector ? identity.nickname || user?.displayName : studentIdentity.nickname || user?.displayName}</span>
        </Link>
      </div>
    </header>
  )
}
