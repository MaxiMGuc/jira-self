import {
  createTemporaryTestCase,
  deleteTemporaryTestCase,
  getTemporaryTestCaseById,
  listTemporaryTestCases,
  setTemporaryTestCaseStatus,
  updateTemporaryTestCase,
} from '../data/temporaryTestCaseStore'
import type { TestCase, TestCaseDraft, TestCaseTransitionAction } from '../types/testCase'
import { resolveTestCaseTransition } from '../utils/testCaseLifecycle'

/**
 * Test Cases application service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core test-case endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /test-cases
 * GET    /test-cases/{id}
 * POST   /test-cases
 * PUT    /test-cases/{id}
 * DELETE /test-cases/{id}
 * plus a dedicated status-transition endpoint later.
 */
const TEMPORARY_LATENCY_MS = 200

export async function listTestCases(): Promise<TestCase[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryTestCases()
}

export async function getTestCaseById(id: string): Promise<TestCase | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryTestCaseById(id)
}

export async function createTestCase(draft: TestCaseDraft, authorId: string): Promise<TestCase> {
  await wait(TEMPORARY_LATENCY_MS)
  return createTemporaryTestCase(draft, authorId)
}

export async function updateTestCase(id: string, draft: TestCaseDraft): Promise<TestCase> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = updateTemporaryTestCase(id, draft)
  if (!updated) {
    throw new Error('Test case was not found.')
  }
  return updated
}

export async function deleteTestCase(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryTestCase(id)) {
    throw new Error('Test case was not found.')
  }
}

export async function transitionTestCaseStatus(
  id: string,
  action: TestCaseTransitionAction,
): Promise<TestCase> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryTestCaseById(id)
  if (!current) {
    throw new Error('Test case was not found.')
  }
  const transition = resolveTestCaseTransition(current.status, action)
  if (!transition) {
    throw new Error('This status change is not allowed for the current test case state.')
  }
  const updated = setTemporaryTestCaseStatus(id, transition.nextStatus)
  if (!updated) {
    throw new Error('Test case was not found.')
  }
  return updated
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
