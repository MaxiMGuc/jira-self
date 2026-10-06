import type { Release, ReleaseStatus } from '../types/release'
import type { SortDirection } from './projectDisplay'

export type ReleaseSortKey = 'name' | 'project' | 'status' | 'releaseDate' | 'createdAt'

export type NamedRelease = Release & {
  projectName: string
}

const STATUS_ORDER: Record<ReleaseStatus, number> = {
  PLANNED: 0,
  IN_PROGRESS: 1,
  RELEASED: 2,
  CANCELLED: 3,
}

export function formatReleaseStatus(status: ReleaseStatus): string {
  switch (status) {
    case 'PLANNED':
      return 'Planned'
    case 'IN_PROGRESS':
      return 'In progress'
    case 'RELEASED':
      return 'Released'
    case 'CANCELLED':
      return 'Cancelled'
  }
}

export function formatReleaseDate(dateValue: string): string {
  if (!dateValue) {
    return '—'
  }
  const parsed = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return dateValue
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isValidReleaseDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }
  const [year, month, day] = value.split('-').map(Number)
  return parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day
}

export function compareReleases(
  left: NamedRelease,
  right: NamedRelease,
  sortKey: ReleaseSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'project') {
    return left.projectName.localeCompare(right.projectName, undefined, { sensitivity: 'base' }) * modifier
  }
  if (sortKey === 'status') {
    return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) * modifier
  }
  return left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
}
