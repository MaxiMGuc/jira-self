export const RELEASE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'RELEASED', 'CANCELLED'] as const
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number]

export const RELEASE_TRANSITION_ACTIONS = ['START', 'MARK_RELEASED', 'CANCEL'] as const
export type ReleaseTransitionAction = (typeof RELEASE_TRANSITION_ACTIONS)[number]

export type Release = {
  id: string
  name: string
  description: string
  projectId: string
  status: ReleaseStatus
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export type ReleaseFormData = {
  name: string
  description: string
  projectId: string
  releaseDate: string
}

export const RELEASE_NAME_MAX_LENGTH = 80
export const RELEASE_DESCRIPTION_MAX_LENGTH = 1000
