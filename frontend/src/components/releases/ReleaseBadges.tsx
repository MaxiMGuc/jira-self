import type { ReleaseStatus } from '../../types/release'
import { formatReleaseStatus } from '../../utils/releaseDisplay'
import './ReleaseBadges.css'

export function ReleaseStatusBadge({ status }: { status: ReleaseStatus }) {
  return (
    <span className={`rel-badge rel-badge--${status.toLowerCase()}`}>{formatReleaseStatus(status)}</span>
  )
}
