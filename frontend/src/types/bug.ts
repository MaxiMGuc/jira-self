export const BUG_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'FIXED',
  'READY_FOR_QA',
  'REOPENED',
  'VERIFIED',
  'CLOSED',
] as const

export type BugStatus = (typeof BUG_STATUSES)[number]

export const BUG_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type BugPriority = (typeof BUG_PRIORITIES)[number]

export const BUG_SEVERITIES = ['MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'] as const
export type BugSeverity = (typeof BUG_SEVERITIES)[number]

export const BUG_TRANSITION_ACTIONS = [
  'START_PROGRESS',
  'MARK_FIXED',
  'SEND_TO_QA',
  'VERIFY',
  'REOPEN',
  'CLOSE',
] as const

export type BugTransitionAction = (typeof BUG_TRANSITION_ACTIONS)[number]

export type Bug = {
  id: string
  title: string
  description: string
  projectId: string
  status: BugStatus
  priority: BugPriority
  severity: BugSeverity
  assigneeId: string
  reporterId: string
  environment: string
  createdAt: string
  updatedAt: string
}

export type BugDraft = {
  title: string
  description: string
  projectId: string
  priority: BugPriority
  severity: BugSeverity
  assigneeId: string
  environment: string
}

export type BugComment = {
  id: string
  bugId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export const BUG_HISTORY_EVENT_TYPES = [
  'CREATED',
  'ASSIGNEE_CHANGED',
  'PRIORITY_CHANGED',
  'STATUS_CHANGED',
  'COMMENT_ADDED',
] as const

export type BugHistoryEventType = (typeof BUG_HISTORY_EVENT_TYPES)[number]

export type BugHistoryEntry = {
  id: string
  bugId: string
  type: BugHistoryEventType
  message: string
  actorName: string
  createdAt: string
}

export type Person = {
  id: string
  username: string
  displayName: string
}

export const BUG_TITLE_MAX_LENGTH = 120
export const BUG_DESCRIPTION_MAX_LENGTH = 2000
export const BUG_ENVIRONMENT_MAX_LENGTH = 120
export const BUG_COMMENT_MAX_LENGTH = 1000
