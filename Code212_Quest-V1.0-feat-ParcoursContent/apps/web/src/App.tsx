import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/app-shell'
import { RequireAuth } from './components/auth/require-auth'
import { LoginModal } from './components/auth/login-modal'
import { useAuth } from './lib/auth'

/* ---- Espace apprenant ---- */
import { DashboardPage } from './pages/student/dashboard-page'
import { QuestsPage } from './pages/student/quests-page'
import { QuestDetailPage } from './pages/student/quest-detail-page'
import { PathsPage } from './pages/student/paths-page'
import { MissionsPage } from './pages/student/missions-page'
import { BadgesPage } from './pages/student/badges-page'
import { ArenaPage } from './pages/student/arena-page'
import { LeaderboardPage } from './pages/student/leaderboard-page'
import { ForgePage } from './pages/student/forge-page'
import { ForgeThreadPage } from './pages/student/forge-thread-page'
import { ShopPage } from './pages/student/shop-page'
import { CertificationsPage } from './pages/student/certifications-page'
import { ProfilePage } from './pages/student/profile-page'

/* ---- Espace administration (legacy) ---- */
import { AdminOverviewPage } from './pages/admin/admin-overview-page'
import { AdminQuestsPage } from './pages/admin/admin-quests-page'
import { AdminValidationPage } from './pages/admin/admin-validation-page'
import { AdminRulesPage } from './pages/admin/admin-rules-page'
import { AdminModerationPage } from './pages/admin/admin-moderation-page'
import { AdminStudentsPage } from './pages/admin/admin-students-page'
import { AdminAnalyticsPage } from './pages/admin/admin-analytics-page'

/* ---- Espace directeur (Super Admin) ---- */
import { DirectorIdentityPage } from './pages/director/director-identity-page'
import { DirectorForgePage } from './pages/director/director-forge-page'
import { DirectorOverviewPage } from './pages/director/director-overview-page'

/* ---- Espace administrateur ---- */
import { AdministratorOverviewPage } from './pages/administrator/administrator-overview-page'

/* ---- Espace équipe Code212 ---- */
import { TeamOverviewPage } from './pages/team/team-overview-page'

/* ---- Espace modérateur ---- */
import { ModeratorOverviewPage } from './pages/moderator/moderator-overview-page'

/* ------------------------------------------------------------------ utils */

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/** Redirige l'utilisateur authentifié depuis /login vers son espace par défaut. */
function LoginRoute() {
  const { status, defaultPath } = useAuth()
  if (status === 'authenticated') return <Navigate to={defaultPath} replace />
  return <LoginModal />
}

/* =================================================================== App */

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ---- Page de connexion (publique) ---- */}
        <Route path="/login" element={<LoginRoute />} />

        {/* ---- Routes protégées ---- */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          {/* -- Espace apprenant (student) -- */}
          <Route
            path="/"
            element={
              <RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route path="/quests" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><QuestsPage /></RequireAuth>} />
          <Route path="/quests/:id" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><QuestDetailPage /></RequireAuth>} />
          <Route path="/paths" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><PathsPage /></RequireAuth>} />
          <Route path="/missions" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><MissionsPage /></RequireAuth>} />
          <Route path="/badges" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><BadgesPage /></RequireAuth>} />
          <Route path="/forge" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><ForgePage /></RequireAuth>} />
          <Route path="/forge/:id" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><ForgeThreadPage /></RequireAuth>} />
          <Route path="/shop" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><ShopPage /></RequireAuth>} />
          <Route path="/certifications" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><CertificationsPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/arena" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><ArenaPage /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth roles={['student', 'trainer', 'moderator', 'admin']}><LeaderboardPage /></RequireAuth>} />

          {/* -- Espace administration legacy -- */}
          <Route path="/admin" element={<RequireAuth roles={['admin', 'moderator', 'trainer']}><AdminOverviewPage /></RequireAuth>} />
          <Route path="/admin/quests" element={<RequireAuth roles={['admin', 'trainer']}><AdminQuestsPage /></RequireAuth>} />
          <Route path="/admin/validation" element={<RequireAuth roles={['admin', 'trainer']}><AdminValidationPage /></RequireAuth>} />
          <Route path="/admin/rules" element={<RequireAuth roles={['admin']}><AdminRulesPage /></RequireAuth>} />
          <Route path="/admin/moderation" element={<RequireAuth roles={['admin', 'moderator']}><AdminModerationPage /></RequireAuth>} />
          <Route path="/admin/students" element={<RequireAuth roles={['admin', 'trainer']}><AdminStudentsPage /></RequireAuth>} />
          <Route path="/admin/analytics" element={<RequireAuth roles={['admin', 'trainer']}><AdminAnalyticsPage /></RequireAuth>} />

          {/* -- Espace directeur (Super Admin) -- */}
          <Route path="/director" element={<RequireAuth roles={['admin']}><DirectorOverviewPage /></RequireAuth>} />
          <Route path="/director/profile" element={<RequireAuth roles={['admin']}><DirectorIdentityPage /></RequireAuth>} />
          <Route path="/director/forge" element={<RequireAuth roles={['admin']}><DirectorForgePage /></RequireAuth>} />
          <Route path="/director/analytics" element={<RequireAuth roles={['admin']}><AdminAnalyticsPage /></RequireAuth>} />
          <Route path="/director/students" element={<RequireAuth roles={['admin']}><AdminStudentsPage /></RequireAuth>} />
          <Route path="/director/quests" element={<RequireAuth roles={['admin']}><AdminQuestsPage /></RequireAuth>} />
          <Route path="/director/validation" element={<RequireAuth roles={['admin']}><AdminValidationPage /></RequireAuth>} />
          <Route path="/director/rules" element={<RequireAuth roles={['admin']}><AdminRulesPage /></RequireAuth>} />
          <Route path="/director/moderation" element={<RequireAuth roles={['admin']}><AdminModerationPage /></RequireAuth>} />
          <Route path="/director/orders" element={<RequireAuth roles={['admin']}><AdminOverviewPage /></RequireAuth>} />

          {/* -- Espace administrateur -- */}
          <Route path="/administrator" element={<RequireAuth roles={['admin']}><AdministratorOverviewPage /></RequireAuth>} />
          <Route path="/administrator/analytics" element={<RequireAuth roles={['admin']}><AdminAnalyticsPage /></RequireAuth>} />
          <Route path="/administrator/students" element={<RequireAuth roles={['admin']}><AdminStudentsPage /></RequireAuth>} />
          <Route path="/administrator/rules" element={<RequireAuth roles={['admin']}><AdminRulesPage /></RequireAuth>} />

          {/* -- Espace équipe Code212 -- */}
          <Route path="/team" element={<RequireAuth roles={['trainer', 'admin']}><TeamOverviewPage /></RequireAuth>} />
          <Route path="/team/quests" element={<RequireAuth roles={['trainer', 'admin']}><AdminQuestsPage /></RequireAuth>} />
          <Route path="/team/paths" element={<RequireAuth roles={['trainer', 'admin']}><PathsPage /></RequireAuth>} />
          <Route path="/team/validation" element={<RequireAuth roles={['trainer', 'admin']}><AdminValidationPage /></RequireAuth>} />
          <Route path="/team/students" element={<RequireAuth roles={['trainer', 'admin']}><AdminStudentsPage /></RequireAuth>} />
          <Route path="/team/analytics" element={<RequireAuth roles={['trainer', 'admin']}><AdminAnalyticsPage /></RequireAuth>} />

          {/* -- Espace modérateur -- */}
          <Route path="/moderator" element={<RequireAuth roles={['moderator', 'admin']}><ModeratorOverviewPage /></RequireAuth>} />
          <Route path="/moderator/queue" element={<RequireAuth roles={['moderator', 'admin']}><AdminModerationPage /></RequireAuth>} />
          <Route path="/moderator/reports" element={<RequireAuth roles={['moderator', 'admin']}><AdminModerationPage /></RequireAuth>} />
          <Route path="/moderator/audit" element={<RequireAuth roles={['moderator', 'admin']}><AdminModerationPage /></RequireAuth>} />
          <Route path="/moderator/forge" element={<RequireAuth roles={['moderator', 'admin']}><ForgePage /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
