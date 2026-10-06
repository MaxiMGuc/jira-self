import type { BugPriority, BugSeverity, BugStatus } from '../../types/bug'
import {
  formatBugPriority,
  formatBugSeverity,
  formatBugStatus,
} from '../../utils/bugDisplay'
import './BugBadges.css'

export function BugStatusBadge({ status }: { status: BugStatus }) {
  return (
    <span className={`bug-badge bug-badge--status-${status.toLowerCase()}`}>
      {formatBugStatus(status)}
    </span>
  )
}

export function BugPriorityBadge({ priority }: { priority: BugPriority }) {
  return (
    <span className={`bug-badge bug-badge--priority-${priority.toLowerCase()}`}>
      {formatBugPriority(priority)}
    </span>
  )
}

export function BugSeverityBadge({ severity }: { severity: BugSeverity }) {
  return (
    <span className={`bug-badge bug-badge--severity-${severity.toLowerCase()}`}>
      {formatBugSeverity(severity)}
    </span>
  )
}
