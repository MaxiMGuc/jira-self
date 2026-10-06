import { getTemporaryTestCaseById, listTemporaryTestCases } from '../data/temporaryTestCaseStore'
import {
  addTemporarySuiteTestCases,
  createTemporaryTestSuite,
  deleteTemporaryTestSuite,
  getTemporaryTestSuiteById,
  listTemporaryTestSuites,
  listTemporaryTestSuitesForTestCase,
  removeTemporarySuiteTestCase,
  updateTemporaryTestSuite,
} from '../data/temporaryTestSuiteStore'
import type { TestSuite, TestSuiteFormData } from '../types/testSuite'

/**
 * Test Suites application service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core suite endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /test-suites
 * GET    /test-suites/{id}
 * POST   /test-suites
 * PUT    /test-suites/{id}
 * DELETE /test-suites/{id}
 * POST   /test-suites/{id}/test-cases
 * DELETE /test-suites/{id}/test-cases/{testCaseId}
 */
const TEMPORARY_LATENCY_MS = 200

export async function listTestSuites(): Promise<TestSuite[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryTestSuites()
}

export async function getTestSuiteById(id: string): Promise<TestSuite | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryTestSuiteById(id)
}

export async function listTestSuitesForTestCase(testCaseId: string): Promise<TestSuite[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryTestSuitesForTestCase(testCaseId)
}

export async function createTestSuite(form: TestSuiteFormData): Promise<TestSuite> {
  await wait(TEMPORARY_LATENCY_MS)
  return createTemporaryTestSuite(form)
}

export async function updateTestSuite(id: string, form: TestSuiteFormData): Promise<TestSuite> {
  await wait(TEMPORARY_LATENCY_MS)
  const allowedIds = listTemporaryTestCases()
    .filter((item) => item.projectId === form.projectId)
    .map((item) => item.id)
  const updated = updateTemporaryTestSuite(id, form, allowedIds)
  if (!updated) {
    throw new Error('Test suite was not found.')
  }
  return updated
}

export async function deleteTestSuite(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryTestSuite(id)) {
    throw new Error('Test suite was not found.')
  }
}

export async function addTestCasesToSuite(suiteId: string, testCaseIds: string[]): Promise<TestSuite> {
  await wait(TEMPORARY_LATENCY_MS)
  const suite = getTemporaryTestSuiteById(suiteId)
  if (!suite) {
    throw new Error('Test suite was not found.')
  }
  const uniqueIds = [...new Set(testCaseIds)]
  for (const testCaseId of uniqueIds) {
    const testCase = getTemporaryTestCaseById(testCaseId)
    if (!testCase) {
      throw new Error(`Test case ${testCaseId} was not found.`)
    }
    if (testCase.projectId !== suite.projectId) {
      throw new Error('A test case from another project cannot be added to this suite.')
    }
  }
  const updated = addTemporarySuiteTestCases(suiteId, uniqueIds)
  if (!updated) {
    throw new Error('Test suite was not found.')
  }
  return updated
}

export async function removeTestCaseFromSuite(suiteId: string, testCaseId: string): Promise<TestSuite> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = removeTemporarySuiteTestCase(suiteId, testCaseId)
  if (!updated) {
    throw new Error('Test suite was not found.')
  }
  return updated
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
