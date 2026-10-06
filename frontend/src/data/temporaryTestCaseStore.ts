import type { TestCase, TestCaseDraft, TestCaseStatus, TestStep } from '../types/testCase'
import { TEMPORARY_TEST_CASE_SEED } from './temporaryTestCases'

let testCases: TestCase[] = cloneTestCases(TEMPORARY_TEST_CASE_SEED)
let nextTestCaseNumber = 1013

export function listTemporaryTestCases(): TestCase[] {
  return cloneTestCases(testCases)
}

export function getTemporaryTestCaseById(id: string): TestCase | null {
  const found = testCases.find((item) => item.id === id)
  return found ? cloneTestCase(found) : null
}

export function createTemporaryTestCase(draft: TestCaseDraft, authorId: string): TestCase {
  const now = new Date().toISOString()
  const created: TestCase = {
    id: `TC-${nextTestCaseNumber}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    preconditions: draft.preconditions.trim(),
    steps: normalizeSteps(draft.steps),
    expectedResult: draft.expectedResult.trim(),
    priority: draft.priority,
    status: 'DRAFT',
    projectId: draft.projectId,
    authorId,
    relatedBugId: draft.relatedBugId,
    createdAt: now,
    updatedAt: now,
  }
  nextTestCaseNumber += 1
  testCases = [created, ...testCases]
  return cloneTestCase(created)
}

export function updateTemporaryTestCase(id: string, draft: TestCaseDraft): TestCase | null {
  const index = testCases.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }

  const current = testCases[index]
  const updated: TestCase = {
    ...current,
    title: draft.title.trim(),
    description: draft.description.trim(),
    preconditions: draft.preconditions.trim(),
    steps: normalizeSteps(draft.steps),
    expectedResult: draft.expectedResult.trim(),
    priority: draft.priority,
    projectId: draft.projectId,
    relatedBugId: draft.relatedBugId,
    updatedAt: new Date().toISOString(),
  }
  testCases[index] = updated
  return cloneTestCase(updated)
}

export function deleteTemporaryTestCase(id: string): boolean {
  const before = testCases.length
  testCases = testCases.filter((item) => item.id !== id)
  return testCases.length < before
}

export function setTemporaryTestCaseStatus(id: string, status: TestCaseStatus): TestCase | null {
  const index = testCases.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const updated: TestCase = {
    ...testCases[index],
    status,
    updatedAt: new Date().toISOString(),
  }
  testCases[index] = updated
  return cloneTestCase(updated)
}

function normalizeSteps(steps: TestStep[]): TestStep[] {
  return steps
    .map((step) => ({
      stepNumber: step.stepNumber,
      action: step.action.trim(),
      expectedResult: step.expectedResult.trim(),
    }))
    .filter((step) => step.action.length > 0 || step.expectedResult.length > 0)
    .map((step, index) => ({
      stepNumber: index + 1,
      action: step.action,
      expectedResult: step.expectedResult,
    }))
}

function cloneTestCases(items: TestCase[]): TestCase[] {
  return items.map(cloneTestCase)
}

function cloneTestCase(item: TestCase): TestCase {
  return {
    ...item,
    steps: item.steps.map((step) => ({ ...step })),
  }
}
