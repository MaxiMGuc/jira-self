import type { TestCase, TestCasePriority, TestCaseStatus } from '../types/testCase'
import { TEST_CASE_PRIORITIES, TEST_CASE_STATUSES } from '../types/testCase'
import type { SortDirection } from './projectDisplay'

export type TestCaseSortKey = 'id' | 'title' | 'project' | 'priority' | 'status' | 'updatedAt'

const STATUS_ORDER: Record<TestCaseStatus, number> = {
  DRAFT: 0,
  READY: 1,
  ACTIVE: 2,
  ARCHIVED: 3,
}

const PRIORITY_ORDER: Record<TestCasePriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

export function formatTestCaseStatus(status: TestCaseStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function formatTestCasePriority(priority: TestCasePriority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase()
}

export function isTestCaseStatus(value: string): value is TestCaseStatus {
  return (TEST_CASE_STATUSES as readonly string[]).includes(value)
}

export function isTestCasePriority(value: string): value is TestCasePriority {
  return (TEST_CASE_PRIORITIES as readonly string[]).includes(value)
}

export function compareTestCases(
  left: TestCase & { projectName: string },
  right: TestCase & { projectName: string },
  sortKey: TestCaseSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'status') {
    return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) * modifier
  }
  if (sortKey === 'priority') {
    return (PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority]) * modifier
  }
  if (sortKey === 'project') {
    return left.projectName.localeCompare(right.projectName, undefined, { sensitivity: 'base' }) * modifier
  }
  return (
    left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
  )
}
