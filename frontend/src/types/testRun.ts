export const TEST_RUN_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const
export type TestRunStatus = (typeof TEST_RUN_STATUSES)[number]

export const TEST_RESULT_STATUSES = ['PASSED', 'FAILED', 'BLOCKED', 'NOT_RUN'] as const
export type TestResultStatus = (typeof TEST_RESULT_STATUSES)[number]

export type TestRunResult = {
  testCaseId: string
  status: TestResultStatus
  comment: string
}

export type TestRun = {
  id: string
  name: string
  projectId: string
  testSuiteId: string
  status: TestRunStatus
  testCaseIds: string[]
  results: TestRunResult[]
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export type TestRunFormData = {
  name: string
  projectId: string
  testSuiteId: string
}

export const TEST_RUN_NAME_MAX_LENGTH = 80
export const TEST_RUN_COMMENT_MAX_LENGTH = 500
