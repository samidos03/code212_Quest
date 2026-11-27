import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass, LayoutDashboard, Swords, Trophy, User } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarProfile } from './sidebar'
import { Topbar } from './topbar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const mobileTabs = [
  { label: 'Accueil', to: '/', icon: LayoutDashboard },
  { label: 'Quêtes', to: '/quests', icon: Compass },
  { label: 'Arène', to: '/arena', icon: Swords, tone: 'dark' as const },
  { label: 'Classement', to: '/leaderboard', icon: Trophy, tone: 'dark' as const },
  { label: 'Profil', to: '/profile', icon: User },
]

function MobileTabBar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-2 pb-1 pt-1.5 backdrop-blur-xl lg:hidden"
      aria-label="Navigation rapide"
    >
      <div className="flex items-stretch justify-around">
        {mobileTabs.map((tab) => {
          const active = tab.to === '/' ? pathname === '/' : pathname.startsWith(tab.to)
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-fg-subtle',
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-tab"
                  className="absolute inset-x-2 -top-1.5 h-1 rounded-full bg-brand-gradient"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="h-[19px] w-[19px]" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenNav={() => setNavOpen(true)} />

        <main key={pathname} className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="hidden items-center justify-between gap-4 border-t border-border px-4 py-4 text-[11px] text-fg-subtle sm:px-6 lg:flex lg:px-8">
          <span>© 2026 Centre CODE212 · Université Cadi Ayyad, Marrakech</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Environnement de démonstration · v0.6
          </span>
        </footer>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-[86vw] max-w-[300px] p-0">
          <SidebarContent onNavigate={() => setNavOpen(false)} />
          <div className="px-4 pb-4">
            <SidebarProfile />
          </div>
        </SheetContent>
      </Sheet>

      <MobileTabBar />
    </div>
  )
}
