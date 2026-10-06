import { getTemporaryTestCaseById } from '../data/temporaryTestCaseStore'
import {
  completeTemporaryTestRun,
  createTemporaryTestRun,
  deleteTemporaryTestRun,
  getTemporaryTestRunById,
  listTemporaryTestRuns,
  startTemporaryTestRun,
  updateTemporaryTestRunResults,
} from '../data/temporaryTestRunStore'
import { getTemporaryTestSuiteById } from '../data/temporaryTestSuiteStore'
import type { TestRun, TestRunFormData, TestRunResult } from '../types/testRun'
import { getCompleteRunBlockReason } from '../utils/testRunLifecycle'

/**
 * Test Runs application service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core run endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /test-runs
 * GET    /test-runs/{id}
 * POST   /test-runs
 * PUT    /test-runs/{id}
 * DELETE /test-runs/{id}
 *
 * Execution endpoints may be added later.
 */
const TEMPORARY_LATENCY_MS = 200

export async function listTestRuns(): Promise<TestRun[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryTestRuns()
}

export async function getTestRunById(id: string): Promise<TestRun | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryTestRunById(id)
}

export async function createTestRun(form: TestRunFormData): Promise<TestRun> {
  await wait(TEMPORARY_LATENCY_MS)
  const suite = getTemporaryTestSuiteById(form.testSuiteId)
  if (!suite) {
    throw new Error('Test suite was not found.')
  }
  if (suite.projectId !== form.projectId) {
    throw new Error('The selected suite must belong to the selected project.')
  }
  const testCaseIds = suite.testCaseIds.filter((testCaseId) => Boolean(getTemporaryTestCaseById(testCaseId)))
  if (testCaseIds.length === 0) {
    throw new Error('This suite has no test cases. Add test cases to the suite before creating a run.')
  }
  return createTemporaryTestRun(form, testCaseIds)
}

export async function startTestRun(id: string): Promise<TestRun> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryTestRunById(id)
  if (!current) {
    throw new Error('Test run was not found.')
  }
  if (current.status !== 'NOT_STARTED') {
    throw new Error('Only a not-started run can be started.')
  }
  const updated = startTemporaryTestRun(id)
  if (!updated) {
    throw new Error('Test run was not found.')
  }
  return updated
}

export async function updateTestRunResults(id: string, results: TestRunResult[]): Promise<TestRun> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryTestRunById(id)
  if (!current) {
    throw new Error('Test run was not found.')
  }
  if (current.status !== 'IN_PROGRESS') {
    throw new Error('Results can only be updated while the run is in progress.')
  }
  const updated = updateTemporaryTestRunResults(id, results)
  if (!updated) {
    throw new Error('Test run was not found.')
  }
  return updated
}

export async function completeTestRun(id: string, results?: TestRunResult[]): Promise<TestRun> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryTestRunById(id)
  if (!current) {
    throw new Error('Test run was not found.')
  }
  let working = current
  if (results && current.status === 'IN_PROGRESS') {
    working = updateTemporaryTestRunResults(id, results) ?? current
  }
  const blockReason = getCompleteRunBlockReason(working.status, working.results)
  if (blockReason) {
    throw new Error(blockReason)
  }
  const updated = completeTemporaryTestRun(id)
  if (!updated) {
    throw new Error('Test run was not found.')
  }
  return updated
}

export async function deleteTestRun(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryTestRun(id)) {
    throw new Error('Test run was not found.')
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
