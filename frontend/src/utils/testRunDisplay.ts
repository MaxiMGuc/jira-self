import type { TestResultStatus, TestRun, TestRunStatus } from '../types/testRun'
import type { SortDirection } from './projectDisplay'
import type { TestRunCounts } from './testRunCounts'

export type TestRunSortKey = 'name' | 'status' | 'createdAt' | 'total'

export type NamedTestRun = TestRun & {
  projectName: string
  suiteName: string
  counts: TestRunCounts
}

const STATUS_ORDER: Record<TestRunStatus, number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
}

export function formatTestRunStatus(status: TestRunStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not started'
    case 'IN_PROGRESS':
      return 'In progress'
    case 'COMPLETED':
      return 'Completed'
  }
}

export function formatTestResultStatus(status: TestResultStatus): string {
  switch (status) {
    case 'PASSED':
      return 'Passed'
    case 'FAILED':
      return 'Failed'
    case 'BLOCKED':
      return 'Blocked'
    case 'NOT_RUN':
      return 'Not run'
  }
}

export function compareTestRuns(
  left: NamedTestRun,
  right: NamedTestRun,
  sortKey: TestRunSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'total') {
    return (left.counts.total - right.counts.total) * modifier
  }
  if (sortKey === 'status') {
    return (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]) * modifier
  }
  return left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
}
