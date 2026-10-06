import type { TestResultStatus, TestRunStatus } from '../../types/testRun'
import { formatTestResultStatus, formatTestRunStatus } from '../../utils/testRunDisplay'
import './TestRunBadges.css'

export function TestRunStatusBadge({ status }: { status: TestRunStatus }) {
  return (
    <span className={`tr-badge tr-badge--run-${status.toLowerCase()}`}>{formatTestRunStatus(status)}</span>
  )
}

export function TestResultStatusBadge({ status }: { status: TestResultStatus }) {
  return (
    <span className={`tr-badge tr-badge--result-${status.toLowerCase()}`}>
      {formatTestResultStatus(status)}
    </span>
  )
}
