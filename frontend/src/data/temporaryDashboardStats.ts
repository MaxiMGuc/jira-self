export type DashboardStats = {
  totalBugs: number
  openBugs: number
  inProgressBugs: number
  readyForQaBugs: number
  closedBugs: number
  testCaseCount: number
  testRunCount: number
  passRatePercent: number
}

/**
 * TEMPORARY frontend-only sample data for dashboard visuals.
 *
 * Replace `getDashboardStats()` in `services/dashboardService.ts` with a real
 * API call when the Java Core backend exposes dashboard statistics.
 */
export const TEMPORARY_DASHBOARD_STATS: DashboardStats = {
  totalBugs: 42,
  openBugs: 11,
  inProgressBugs: 8,
  readyForQaBugs: 5,
  closedBugs: 14,
  testCaseCount: 86,
  testRunCount: 12,
  passRatePercent: 78,
}
