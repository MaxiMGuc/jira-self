import type { TestRunResult, TestRunStatus } from '../types/testRun'
import { calculateTestRunCounts } from './testRunCounts'

export function canStartTestRun(status: TestRunStatus): boolean {
  return status === 'NOT_STARTED'
}

export function canUpdateTestRunResults(status: TestRunStatus): boolean {
  return status === 'IN_PROGRESS'
}

export function getCompleteRunBlockReason(status: TestRunStatus, results: TestRunResult[]): string | null {
  if (status !== 'IN_PROGRESS') {
    return status === 'COMPLETED'
      ? 'This run is already completed.'
      : 'Start the run before recording results and completing it.'
  }
  const { notRun } = calculateTestRunCounts(results)
  if (notRun > 0) {
    return `Cannot complete this run while ${notRun} test${notRun === 1 ? '' : 's'} ${
      notRun === 1 ? 'is' : 'are'
    } still Not run.`
  }
  return null
}
