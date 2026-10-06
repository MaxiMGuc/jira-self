export const TEST_CASE_STATUSES = ['DRAFT', 'READY', 'ACTIVE', 'ARCHIVED'] as const
export type TestCaseStatus = (typeof TEST_CASE_STATUSES)[number]

export const TEST_CASE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type TestCasePriority = (typeof TEST_CASE_PRIORITIES)[number]

export const TEST_CASE_TRANSITION_ACTIONS = ['MARK_READY', 'ACTIVATE', 'ARCHIVE'] as const
export type TestCaseTransitionAction = (typeof TEST_CASE_TRANSITION_ACTIONS)[number]

export type TestStep = {
  stepNumber: number
  action: string
  expectedResult: string
}

export type TestCase = {
  id: string
  title: string
  description: string
  preconditions: string
  steps: TestStep[]
  expectedResult: string
  priority: TestCasePriority
  status: TestCaseStatus
  projectId: string
  authorId: string
  relatedBugId: string | null
  createdAt: string
  updatedAt: string
}

export type TestCaseDraft = {
  title: string
  description: string
  preconditions: string
  steps: TestStep[]
  expectedResult: string
  priority: TestCasePriority
  projectId: string
  relatedBugId: string | null
}

export const TEST_CASE_TITLE_MAX_LENGTH = 120
export const TEST_CASE_TEXT_MAX_LENGTH = 2000
export const TEST_STEP_ACTION_MAX_LENGTH = 500
export const TEST_STEP_EXPECTED_MAX_LENGTH = 500
