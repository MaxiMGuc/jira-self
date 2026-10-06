import type { Bug, BugPriority, BugSeverity, BugStatus } from '../types/bug'
import {
  BUG_PRIORITIES,
  BUG_SEVERITIES,
  BUG_STATUSES,
} from '../types/bug'
import type { SortDirection } from './projectDisplay'

export type BugSortKey =
  | 'id'
  | 'title'
  | 'status'
  | 'priority'
  | 'severity'
  | 'createdAt'
  | 'updatedAt'

const STATUS_ORDER: Record<BugStatus, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  REOPENED: 2,
  FIXED: 3,
  READY_FOR_QA: 4,
  VERIFIED: 5,
  CLOSED: 6,
}

const PRIORITY_ORDER: Record<BugPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

const SEVERITY_ORDER: Record<BugSeverity, number> = {
  MINOR: 0,
  MAJOR: 1,
  CRITICAL: 2,
  BLOCKER: 3,
}

export function formatBugStatus(status: BugStatus): string {
  return status.replaceAll('_', ' ')
}

export function formatBugPriority(priority: BugPriority): string {
  return capitalize(priority)
}

export function formatBugSeverity(severity: BugSeverity): string {
  return capitalize(severity)
}

export function isBugStatus(value: string): value is BugStatus {
  return (BUG_STATUSES as readonly string[]).includes(value)
}

export function isBugPriority(value: string): value is BugPriority {
  return (BUG_PRIORITIES as readonly string[]).includes(value)
}

export function isBugSeverity(value: string): value is BugSeverity {
  return (BUG_SEVERITIES as readonly string[]).includes(value)
}

export function formatIsoDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function compareBugs(
  left: Bug,
  right: Bug,
  sortKey: BugSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'status') {
    return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) * modifier
  }
  if (sortKey === 'priority') {
    return (PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority]) * modifier
  }
  if (sortKey === 'severity') {
    return (SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]) * modifier
  }
  return left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
}

function capitalize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}
