import type { User, UserRole, UserStatus } from '../types/user'
import type { SortDirection } from './projectDisplay'

export type UserSortKey = 'username' | 'fullName' | 'role' | 'status' | 'createdAt'

const ROLE_ORDER: Record<UserRole, number> = {
  ADMIN: 0,
  PROJECT_MANAGER: 1,
  QA: 2,
  DEVELOPER: 3,
}

const STATUS_ORDER: Record<UserStatus, number> = {
  ACTIVE: 0,
  INACTIVE: 1,
}

export function formatUserRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin'
    case 'PROJECT_MANAGER':
      return 'Project manager'
    case 'QA':
      return 'QA'
    case 'DEVELOPER':
      return 'Developer'
  }
}

export function formatUserStatus(status: UserStatus): string {
  return status === 'ACTIVE' ? 'Active' : 'Inactive'
}

export function isValidUserEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function compareUsers(left: User, right: User, sortKey: UserSortKey, direction: SortDirection): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'role') {
    return (ROLE_ORDER[left.role] - ROLE_ORDER[right.role]) * modifier
  }
  if (sortKey === 'status') {
    return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) * modifier
  }
  return left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
}
