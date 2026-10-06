import type { TestSuite } from '../types/testSuite'
import type { SortDirection } from './projectDisplay'

export type TestSuiteSortKey = 'id' | 'name' | 'project' | 'testCaseCount' | 'createdAt' | 'updatedAt'

export type NamedTestSuite = TestSuite & {
  projectName: string
  testCaseCount: number
}

export function compareTestSuites(
  left: NamedTestSuite,
  right: NamedTestSuite,
  sortKey: TestSuiteSortKey,
  direction: SortDirection,
): number {
  const modifier = direction === 'asc' ? 1 : -1
  if (sortKey === 'testCaseCount') {
    return (left.testCaseCount - right.testCaseCount) * modifier
  }
  if (sortKey === 'project') {
    return left.projectName.localeCompare(right.projectName, undefined, { sensitivity: 'base' }) * modifier
  }
  return left[sortKey].localeCompare(right[sortKey], undefined, { numeric: true, sensitivity: 'base' }) * modifier
}
