import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { PublicOnlyRoute } from './auth/PublicOnlyRoute'
import { AppLayout } from './components/layout/AppLayout'
import { BugsPage } from './pages/BugsPage'
import { BugDetailsPage } from './pages/BugDetailsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailsPage } from './pages/ProjectDetailsPage'
import { ReleaseDetailsPage } from './pages/ReleaseDetailsPage'
import { ReleasesPage } from './pages/ReleasesPage'
import { ReportsPage } from './pages/ReportsPage'
import { TestCasesPage } from './pages/TestCasesPage'
import { TestCaseDetailsPage } from './pages/TestCaseDetailsPage'
import { TestRunDetailsPage } from './pages/TestRunDetailsPage'
import { TestRunsPage } from './pages/TestRunsPage'
import { TestSuitesPage } from './pages/TestSuitesPage'
import { TestSuiteDetailsPage } from './pages/TestSuiteDetailsPage'
import { UserDetailsPage } from './pages/UserDetailsPage'
import { UsersPage } from './pages/UsersPage'
import { ROUTE_PATHS } from './utils/routes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTE_PATHS.login}
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
              <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
              <Route path={ROUTE_PATHS.projects} element={<ProjectsPage />} />
              <Route path={`${ROUTE_PATHS.projects}/:id`} element={<ProjectDetailsPage />} />
              <Route path={ROUTE_PATHS.bugs} element={<BugsPage />} />
              <Route path={`${ROUTE_PATHS.bugs}/:id`} element={<BugDetailsPage />} />
              <Route path={ROUTE_PATHS.testCases} element={<TestCasesPage />} />
              <Route path={`${ROUTE_PATHS.testCases}/:id`} element={<TestCaseDetailsPage />} />
              <Route path={ROUTE_PATHS.testSuites} element={<TestSuitesPage />} />
              <Route path={`${ROUTE_PATHS.testSuites}/:id`} element={<TestSuiteDetailsPage />} />
              <Route path={ROUTE_PATHS.testRuns} element={<TestRunsPage />} />
              <Route path={`${ROUTE_PATHS.testRuns}/:id`} element={<TestRunDetailsPage />} />
              <Route path={ROUTE_PATHS.releases} element={<ReleasesPage />} />
              <Route path={`${ROUTE_PATHS.releases}/:id`} element={<ReleaseDetailsPage />} />
              <Route path={ROUTE_PATHS.reports} element={<ReportsPage />} />
              <Route path={ROUTE_PATHS.users} element={<UsersPage />} />
              <Route path={`${ROUTE_PATHS.users}/:id`} element={<UserDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
