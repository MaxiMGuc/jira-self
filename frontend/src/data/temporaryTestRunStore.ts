import type { TestRun, TestRunFormData, TestRunResult } from '../types/testRun'
import { TEMPORARY_TEST_RUN_SEED } from './temporaryTestRuns'

let runs: TestRun[] = cloneRuns(TEMPORARY_TEST_RUN_SEED)
let nextRunNumber = 1013

export function listTemporaryTestRuns(): TestRun[] {
  return cloneRuns(runs)
}

export function getTemporaryTestRunById(id: string): TestRun | null {
  const found = runs.find((item) => item.id === id)
  return found ? cloneRun(found) : null
}

export function createTemporaryTestRun(form: TestRunFormData, testCaseIds: string[]): TestRun {
  const now = new Date().toISOString()
  const created: TestRun = {
    id: `TR-${nextRunNumber}`,
    name: form.name.trim(),
    projectId: form.projectId,
    testSuiteId: form.testSuiteId,
    status: 'NOT_STARTED',
    testCaseIds: [...testCaseIds],
    results: testCaseIds.map((testCaseId) => ({
      testCaseId,
      status: 'NOT_RUN',
      comment: '',
    })),
    createdAt: now,
    startedAt: null,
    completedAt: null,
  }
  nextRunNumber += 1
  runs = [created, ...runs]
  return cloneRun(created)
}

export function startTemporaryTestRun(id: string): TestRun | null {
  const index = runs.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = runs[index]
  if (current.status !== 'NOT_STARTED') {
    return cloneRun(current)
  }
  const now = new Date().toISOString()
  const updated: TestRun = {
    ...current,
    status: 'IN_PROGRESS',
    startedAt: now,
  }
  runs[index] = updated
  return cloneRun(updated)
}

export function updateTemporaryTestRunResults(id: string, results: TestRunResult[]): TestRun | null {
  const index = runs.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = runs[index]
  const allowed = new Set(current.testCaseIds)
  const nextResults = current.results.map((existing) => {
    const incoming = results.find((item) => item.testCaseId === existing.testCaseId)
    if (!incoming || !allowed.has(existing.testCaseId)) {
      return existing
    }
    return {
      testCaseId: existing.testCaseId,
      status: incoming.status,
      comment: incoming.comment.trim(),
    }
  })
  const updated: TestRun = {
    ...current,
    results: nextResults,
  }
  runs[index] = updated
  return cloneRun(updated)
}

export function completeTemporaryTestRun(id: string): TestRun | null {
  const index = runs.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = runs[index]
  const now = new Date().toISOString()
  const updated: TestRun = {
    ...current,
    status: 'COMPLETED',
    completedAt: now,
  }
  runs[index] = updated
  return cloneRun(updated)
}

export function deleteTemporaryTestRun(id: string): boolean {
  const before = runs.length
  runs = runs.filter((item) => item.id !== id)
  return runs.length < before
}

function cloneRuns(items: TestRun[]): TestRun[] {
  return items.map(cloneRun)
}

function cloneRun(item: TestRun): TestRun {
  return {
    ...item,
    testCaseIds: [...item.testCaseIds],
    results: item.results.map((result) => ({ ...result })),
  }
}
