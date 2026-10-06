import type { Project } from '../types/project'
import { PROJECT_STATUSES, type ProjectStatus } from '../types/project'

export function formatIsoDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'ON_HOLD':
      return 'On hold'
    case 'ARCHIVED':
      return 'Archived'
  }
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value)
}

export type ProjectSortKey = 'name' | 'status' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export function compareProjects(
  left: Project,
  right: Project,
  sortKey: ProjectSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  const leftValue = left[sortKey]
  const rightValue = right[sortKey]
  return leftValue.localeCompare(rightValue, undefined, { sensitivity: 'base' }) * modifier
}
