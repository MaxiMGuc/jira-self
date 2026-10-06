export const APP_NAME = 'DefectFlow'

export const ROUTE_PATHS = {
  login: '/login',
  dashboard: '/dashboard',
  projects: '/projects',
  bugs: '/bugs',
  testCases: '/test-cases',
  testSuites: '/test-suites',
  testRuns: '/test-runs',
  releases: '/releases',
  reports: '/reports',
  users: '/users',
} as const

export function projectDetailsPath(id: string): string {
  return `${ROUTE_PATHS.projects}/${id}`
}

export function bugDetailsPath(id: string): string {
  return `${ROUTE_PATHS.bugs}/${id}`
}

export function testCaseDetailsPath(id: string): string {
  return `${ROUTE_PATHS.testCases}/${id}`
}

export function testSuiteDetailsPath(id: string): string {
  return `${ROUTE_PATHS.testSuites}/${id}`
}

export function testRunDetailsPath(id: string): string {
  return `${ROUTE_PATHS.testRuns}/${id}`
}

export function releaseDetailsPath(id: string): string {
  return `${ROUTE_PATHS.releases}/${id}`
}

export function userDetailsPath(id: string): string {
  return `${ROUTE_PATHS.users}/${id}`
}

export type AppRoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]

export type NavItem = {
  path: AppRoutePath
  label: string
  testId: string
}

export const APP_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.dashboard, label: 'Dashboard', testId: 'nav-dashboard' },
  { path: ROUTE_PATHS.projects, label: 'Projects', testId: 'nav-projects' },
  { path: ROUTE_PATHS.bugs, label: 'Bugs', testId: 'nav-bugs' },
  { path: ROUTE_PATHS.testCases, label: 'Test Cases', testId: 'nav-test-cases' },
  { path: ROUTE_PATHS.testSuites, label: 'Test Suites', testId: 'nav-test-suites' },
  { path: ROUTE_PATHS.testRuns, label: 'Test Runs', testId: 'nav-test-runs' },
  { path: ROUTE_PATHS.releases, label: 'Releases', testId: 'nav-releases' },
  { path: ROUTE_PATHS.reports, label: 'Reports', testId: 'nav-reports' },
  { path: ROUTE_PATHS.users, label: 'Users', testId: 'nav-users' },
]
