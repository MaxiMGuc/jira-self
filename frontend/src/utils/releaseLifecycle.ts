import type { ReleaseStatus, ReleaseTransitionAction } from '../types/release'

export type ReleaseTransition = {
  action: ReleaseTransitionAction
  label: string
  nextStatus: ReleaseStatus
  requiresConfirmation: boolean
}

const TRANSITIONS: Record<ReleaseStatus, ReleaseTransition[]> = {
  PLANNED: [
    {
      action: 'START',
      label: 'Start Release',
      nextStatus: 'IN_PROGRESS',
      requiresConfirmation: false,
    },
    {
      action: 'CANCEL',
      label: 'Cancel',
      nextStatus: 'CANCELLED',
      requiresConfirmation: true,
    },
  ],
  IN_PROGRESS: [
    {
      action: 'MARK_RELEASED',
      label: 'Mark Released',
      nextStatus: 'RELEASED',
      requiresConfirmation: true,
    },
    {
      action: 'CANCEL',
      label: 'Cancel',
      nextStatus: 'CANCELLED',
      requiresConfirmation: true,
    },
  ],
  RELEASED: [],
  CANCELLED: [],
}

export function getAllowedReleaseTransitions(status: ReleaseStatus): ReleaseTransition[] {
  return TRANSITIONS[status]
}

export function resolveReleaseTransition(
  status: ReleaseStatus,
  action: ReleaseTransitionAction,
): ReleaseTransition | null {
  return TRANSITIONS[status].find((item) => item.action === action) ?? null
}
