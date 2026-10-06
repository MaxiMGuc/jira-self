import { useMemo } from 'react'
import { StatCard } from '../components/ui/StatCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { getDashboardStats } from '../services/dashboardService'
import './DashboardPage.css'

export function DashboardPage() {
  usePageTitle('Dashboard')
  const stats = useMemo(() => getDashboardStats(), [])

  return (
    <section className="dashboard" data-testid="dashboard-page">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">
          Overview of defects and test activity for the current workspace.
        </p>
      </header>
      <p className="dashboard__notice">
        These figures are temporary frontend sample data for visual layout.
        Replace <code>getDashboardStats()</code> with the Java Core API when
        it is available.
      </p>
      <div className="dashboard__grid">
        <StatCard label="Total Bugs" value={String(stats.totalBugs)} testId="stat-total-bugs" />
        <StatCard label="Open Bugs" value={String(stats.openBugs)} testId="stat-open-bugs" />
        <StatCard
          label="In Progress"
          value={String(stats.inProgressBugs)}
          testId="stat-in-progress"
        />
        <StatCard
          label="Ready for QA"
          value={String(stats.readyForQaBugs)}
          testId="stat-ready-for-qa"
        />
        <StatCard label="Closed" value={String(stats.closedBugs)} testId="stat-closed" />
        <StatCard
          label="Test Cases"
          value={String(stats.testCaseCount)}
          testId="stat-test-cases"
        />
        <StatCard label="Test Runs" value={String(stats.testRunCount)} testId="stat-test-runs" />
        <StatCard
          label="Pass Rate"
          value={`${stats.passRatePercent}%`}
          testId="stat-pass-rate"
        />
      </div>
    </section>
  )
}
