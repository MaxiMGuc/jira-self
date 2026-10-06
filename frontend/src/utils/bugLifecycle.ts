import type { BugStatus, BugTransitionAction } from '../types/bug'

export type BugTransition = {
  action: BugTransitionAction
  label: string
  nextStatus: BugStatus
  requiresConfirmation: boolean
}

const TRANSITIONS: Record<BugStatus, BugTransition[]> = {
  OPEN: [
    {
      action: 'START_PROGRESS',
      label: 'Start progress',
      nextStatus: 'IN_PROGRESS',
      requiresConfirmation: false,
    },
  ],
  IN_PROGRESS: [
    {
      action: 'MARK_FIXED',
      label: 'Mark as fixed',
      nextStatus: 'FIXED',
      requiresConfirmation: false,
    },
  ],
  FIXED: [
    {
      action: 'SEND_TO_QA',
      label: 'Send to QA',
      nextStatus: 'READY_FOR_QA',
      requiresConfirmation: false,
    },
  ],
  READY_FOR_QA: [
    {
      action: 'VERIFY',
      label: 'Verify',
      nextStatus: 'VERIFIED',
      requiresConfirmation: true,
    },
    {
      action: 'REOPEN',
      label: 'Reopen',
      nextStatus: 'REOPENED',
      requiresConfirmation: true,
    },
  ],
  REOPENED: [
    {
      action: 'START_PROGRESS',
      label: 'Start progress',
      nextStatus: 'IN_PROGRESS',
      requiresConfirmation: false,
    },
  ],
  VERIFIED: [
    {
      action: 'CLOSE',
      label: 'Close',
      nextStatus: 'CLOSED',
      requiresConfirmation: true,
    },
  ],
  CLOSED: [],
}

export function getAllowedBugTransitions(status: BugStatus): BugTransition[] {
  return TRANSITIONS[status]
}

export function resolveBugTransition(
  status: BugStatus,
  action: BugTransitionAction,
): BugTransition | null {
  return TRANSITIONS[status].find((item) => item.action === action) ?? null
}
