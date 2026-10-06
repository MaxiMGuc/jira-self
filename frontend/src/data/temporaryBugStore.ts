import type { Bug, BugComment, BugDraft, BugHistoryEntry, Person } from '../types/bug'
import {
  TEMPORARY_BUG_COMMENT_SEED,
  TEMPORARY_BUG_HISTORY_SEED,
  TEMPORARY_BUG_SEED,
} from './temporaryBugs'
import { TEMPORARY_PEOPLE } from './temporaryPeople'

let bugs: Bug[] = cloneBugs(TEMPORARY_BUG_SEED)
let comments: BugComment[] = TEMPORARY_BUG_COMMENT_SEED.map((item) => ({ ...item }))
let history: BugHistoryEntry[] = TEMPORARY_BUG_HISTORY_SEED.map((item) => ({ ...item }))
let nextBugNumber = 1013
let nextComment = 5
let nextHistory = 200

export function listTemporaryPeople(): Person[] {
  return TEMPORARY_PEOPLE.map((person) => ({ ...person }))
}

export function getTemporaryPersonById(id: string): Person | null {
  return TEMPORARY_PEOPLE.find((person) => person.id === id) ?? null
}

export function listTemporaryBugs(): Bug[] {
  return cloneBugs(bugs)
}

export function getTemporaryBugById(id: string): Bug | null {
  const found = bugs.find((bug) => bug.id === id)
  return found ? { ...found } : null
}

export function createTemporaryBug(draft: BugDraft, reporterId: string, actorName: string): Bug {
  const now = new Date().toISOString()
  const created: Bug = {
    id: `BUG-${nextBugNumber}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    projectId: draft.projectId,
    status: 'OPEN',
    priority: draft.priority,
    severity: draft.severity,
    assigneeId: draft.assigneeId,
    reporterId,
    environment: draft.environment.trim(),
    createdAt: now,
    updatedAt: now,
  }
  nextBugNumber += 1
  bugs = [created, ...bugs]
  addHistory(created.id, 'CREATED', 'Bug created.', actorName, now)
  return { ...created }
}

export function updateTemporaryBug(
  id: string,
  draft: BugDraft,
  actorName: string,
): Bug | null {
  const index = bugs.findIndex((bug) => bug.id === id)
  if (index === -1) {
    return null
  }

  const current = bugs[index]
  const now = new Date().toISOString()
  const updated: Bug = {
    ...current,
    title: draft.title.trim(),
    description: draft.description.trim(),
    projectId: draft.projectId,
    priority: draft.priority,
    severity: draft.severity,
    assigneeId: draft.assigneeId,
    environment: draft.environment.trim(),
    updatedAt: now,
  }

  if (current.assigneeId !== updated.assigneeId) {
    const nextAssignee = getTemporaryPersonById(updated.assigneeId)
    addHistory(
      id,
      'ASSIGNEE_CHANGED',
      `Assignee changed to ${nextAssignee?.displayName ?? updated.assigneeId}.`,
      actorName,
      now,
    )
  }
  if (current.priority !== updated.priority) {
    addHistory(
      id,
      'PRIORITY_CHANGED',
      `Priority changed from ${current.priority} to ${updated.priority}.`,
      actorName,
      now,
    )
  }

  bugs = [...bugs.slice(0, index), updated, ...bugs.slice(index + 1)]
  return { ...updated }
}

export function setTemporaryBugStatus(
  id: string,
  nextStatus: Bug['status'],
  actorName: string,
): Bug | null {
  const index = bugs.findIndex((bug) => bug.id === id)
  if (index === -1) {
    return null
  }
  const current = bugs[index]
  const now = new Date().toISOString()
  const updated: Bug = { ...current, status: nextStatus, updatedAt: now }
  bugs = [...bugs.slice(0, index), updated, ...bugs.slice(index + 1)]
  addHistory(
    id,
    'STATUS_CHANGED',
    `Status changed from ${formatStatusLabel(current.status)} to ${formatStatusLabel(nextStatus)}.`,
    actorName,
    now,
  )
  return { ...updated }
}

export function deleteTemporaryBug(id: string): boolean {
  const next = bugs.filter((bug) => bug.id !== id)
  if (next.length === bugs.length) {
    return false
  }
  bugs = next
  comments = comments.filter((item) => item.bugId !== id)
  history = history.filter((item) => item.bugId !== id)
  return true
}

export function listTemporaryComments(bugId: string): BugComment[] {
  return comments
    .filter((item) => item.bugId === bugId)
    .map((item) => ({ ...item }))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

export function addTemporaryComment(
  bugId: string,
  authorId: string,
  authorName: string,
  body: string,
): BugComment | null {
  if (!getTemporaryBugById(bugId)) {
    return null
  }
  const now = new Date().toISOString()
  const created: BugComment = {
    id: `comment-${nextComment}`,
    bugId,
    authorId,
    authorName,
    body: body.trim(),
    createdAt: now,
  }
  nextComment += 1
  comments = [...comments, created]
  addHistory(bugId, 'COMMENT_ADDED', 'Comment added.', authorName, now)
  touchBug(bugId, now)
  return { ...created }
}

export function listTemporaryHistory(bugId: string): BugHistoryEntry[] {
  return history
    .filter((item) => item.bugId === bugId)
    .map((item) => ({ ...item }))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function touchBug(id: string, now: string) {
  const index = bugs.findIndex((bug) => bug.id === id)
  if (index === -1) {
    return
  }
  const updated = { ...bugs[index], updatedAt: now }
  bugs = [...bugs.slice(0, index), updated, ...bugs.slice(index + 1)]
}

function addHistory(
  bugId: string,
  type: BugHistoryEntry['type'],
  message: string,
  actorName: string,
  createdAt: string,
) {
  history = [
    ...history,
    {
      id: `hist-${nextHistory}`,
      bugId,
      type,
      message,
      actorName,
      createdAt,
    },
  ]
  nextHistory += 1
}

function formatStatusLabel(status: Bug['status']): string {
  return status.replaceAll('_', ' ')
}

function cloneBugs(source: Bug[]): Bug[] {
  return source.map((bug) => ({ ...bug }))
}
