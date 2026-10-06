export const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'ARCHIVED'] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type Project = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export type ProjectDraft = {
  name: string
  description: string
  status: ProjectStatus
}

export const PROJECT_NAME_MAX_LENGTH = 80
export const PROJECT_DESCRIPTION_MAX_LENGTH = 1000
