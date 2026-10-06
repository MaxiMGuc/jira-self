import type { ProjectStatus } from '../../types/project'
import { formatProjectStatus } from '../../utils/projectDisplay'
import './StatusBadge.css'

type StatusBadgeProps = {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {formatProjectStatus(status)}
    </span>
  )
}
