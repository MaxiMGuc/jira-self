import type { TestCasePriority, TestCaseStatus } from '../../types/testCase'
import { formatTestCasePriority, formatTestCaseStatus } from '../../utils/testCaseDisplay'
import './TestCaseBadges.css'

export function TestCaseStatusBadge({ status }: { status: TestCaseStatus }) {
  return (
    <span className={`tc-badge tc-badge--status-${status.toLowerCase()}`}>
      {formatTestCaseStatus(status)}
    </span>
  )
}

export function TestCasePriorityBadge({ priority }: { priority: TestCasePriority }) {
  return (
    <span className={`tc-badge tc-badge--priority-${priority.toLowerCase()}`}>
      {formatTestCasePriority(priority)}
    </span>
  )
}
