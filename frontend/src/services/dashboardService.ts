import { TEMPORARY_DASHBOARD_STATS, type DashboardStats } from '../data/temporaryDashboardStats'

/**
 * Dashboard statistics entry point.
 *
 * Currently returns temporary frontend-only sample data for layout and
 * visual design. Replace this with an `apiClient` request when the backend
 * dashboard endpoint exists.
 */
export function getDashboardStats(): DashboardStats {
  return TEMPORARY_DASHBOARD_STATS
}
