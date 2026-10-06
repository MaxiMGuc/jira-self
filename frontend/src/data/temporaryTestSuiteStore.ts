import type { TestSuite, TestSuiteFormData } from '../types/testSuite'
import { TEMPORARY_TEST_SUITE_SEED } from './temporaryTestSuites'

let suites: TestSuite[] = cloneSuites(TEMPORARY_TEST_SUITE_SEED)
let nextSuiteNumber = 1013

export function listTemporaryTestSuites(): TestSuite[] {
  return cloneSuites(suites)
}

export function getTemporaryTestSuiteById(id: string): TestSuite | null {
  const found = suites.find((item) => item.id === id)
  return found ? cloneSuite(found) : null
}

export function listTemporaryTestSuitesForTestCase(testCaseId: string): TestSuite[] {
  return cloneSuites(suites.filter((item) => item.testCaseIds.includes(testCaseId)))
}

export function createTemporaryTestSuite(form: TestSuiteFormData): TestSuite {
  const now = new Date().toISOString()
  const created: TestSuite = {
    id: `TS-${nextSuiteNumber}`,
    name: form.name.trim(),
    description: form.description.trim(),
    projectId: form.projectId,
    testCaseIds: [],
    createdAt: now,
    updatedAt: now,
  }
  nextSuiteNumber += 1
  suites = [created, ...suites]
  return cloneSuite(created)
}

export function updateTemporaryTestSuite(
  id: string,
  form: TestSuiteFormData,
  allowedTestCaseIds: string[],
): TestSuite | null {
  const index = suites.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }

  const current = suites[index]
  const allowed = new Set(allowedTestCaseIds)
  const updated: TestSuite = {
    ...current,
    name: form.name.trim(),
    description: form.description.trim(),
    projectId: form.projectId,
    testCaseIds: current.testCaseIds.filter((testCaseId) => allowed.has(testCaseId)),
    updatedAt: new Date().toISOString(),
  }
  suites[index] = updated
  return cloneSuite(updated)
}

export function deleteTemporaryTestSuite(id: string): boolean {
  const before = suites.length
  suites = suites.filter((item) => item.id !== id)
  return suites.length < before
}

export function addTemporarySuiteTestCases(id: string, testCaseIds: string[]): TestSuite | null {
  const index = suites.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = suites[index]
  const nextIds = [...current.testCaseIds]
  for (const testCaseId of testCaseIds) {
    if (!nextIds.includes(testCaseId)) {
      nextIds.push(testCaseId)
    }
  }
  const updated: TestSuite = {
    ...current,
    testCaseIds: nextIds,
    updatedAt: new Date().toISOString(),
  }
  suites[index] = updated
  return cloneSuite(updated)
}

export function removeTemporarySuiteTestCase(id: string, testCaseId: string): TestSuite | null {
  const index = suites.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = suites[index]
  const updated: TestSuite = {
    ...current,
    testCaseIds: current.testCaseIds.filter((item) => item !== testCaseId),
    updatedAt: new Date().toISOString(),
  }
  suites[index] = updated
  return cloneSuite(updated)
}

function cloneSuites(items: TestSuite[]): TestSuite[] {
  return items.map(cloneSuite)
}

function cloneSuite(item: TestSuite): TestSuite {
  return {
    ...item,
    testCaseIds: [...item.testCaseIds],
  }
}
