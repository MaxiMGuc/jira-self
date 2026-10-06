import type { TestCaseStatus, TestCaseTransitionAction } from '../types/testCase'

export type TestCaseTransition = {
  action: TestCaseTransitionAction
  label: string
  nextStatus: TestCaseStatus
  requiresConfirmation: boolean
}

const TRANSITIONS: Record<TestCaseStatus, TestCaseTransition[]> = {
  DRAFT: [
    {
      action: 'MARK_READY',
      label: 'Mark Ready',
      nextStatus: 'READY',
      requiresConfirmation: false,
    },
  ],
  READY: [
    {
      action: 'ACTIVATE',
      label: 'Activate',
      nextStatus: 'ACTIVE',
      requiresConfirmation: false,
    },
  ],
  ACTIVE: [
    {
      action: 'ARCHIVE',
      label: 'Archive',
      nextStatus: 'ARCHIVED',
      requiresConfirmation: true,
    },
  ],
  ARCHIVED: [],
}

export function getAllowedTestCaseTransitions(status: TestCaseStatus): TestCaseTransition[] {
  return TRANSITIONS[status]
}

export function resolveTestCaseTransition(
  status: TestCaseStatus,
  action: TestCaseTransitionAction,
): TestCaseTransition | null {
  return TRANSITIONS[status].find((item) => item.action === action) ?? null
}
