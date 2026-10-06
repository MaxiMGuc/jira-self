import type { UserRole, UserStatus } from '../../types/user'
import { formatUserRole, formatUserStatus } from '../../utils/userDisplay'
import './UserBadges.css'

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <span className={`usr-badge usr-badge--role-${role.toLowerCase()}`}>{formatUserRole(role)}</span>
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`usr-badge usr-badge--status-${status.toLowerCase()}`}>{formatUserStatus(status)}</span>
  )
}
