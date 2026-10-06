import {
  addTemporaryComment,
  createTemporaryBug,
  deleteTemporaryBug,
  getTemporaryBugById,
  listTemporaryBugs,
  listTemporaryComments,
  listTemporaryHistory,
  listTemporaryPeople,
  setTemporaryBugStatus,
  updateTemporaryBug,
} from '../data/temporaryBugStore'
import type {
  Bug,
  BugComment,
  BugDraft,
  BugHistoryEntry,
  BugTransitionAction,
  Person,
} from '../types/bug'
import { resolveBugTransition } from '../utils/bugLifecycle'

/**
 * Bugs application service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core bug endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /bugs
 * GET    /bugs/{id}
 * POST   /bugs
 * PUT    /bugs/{id}
 * DELETE /bugs/{id}
 * plus a dedicated lifecycle/status endpoint later.
 */
const TEMPORARY_LATENCY_MS = 200

export async function listBugs(): Promise<Bug[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryBugs()
}

export async function getBugById(id: string): Promise<Bug | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryBugById(id)
}

export async function createBug(
  draft: BugDraft,
  reporterId: string,
  actorName: string,
): Promise<Bug> {
  await wait(TEMPORARY_LATENCY_MS)
  return createTemporaryBug(draft, reporterId, actorName)
}

export async function updateBug(id: string, draft: BugDraft, actorName: string): Promise<Bug> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = updateTemporaryBug(id, draft, actorName)
  if (!updated) {
    throw new Error('Bug was not found.')
  }
  return updated
}

export async function deleteBug(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryBug(id)) {
    throw new Error('Bug was not found.')
  }
}

export async function transitionBugStatus(
  id: string,
  action: BugTransitionAction,
  actorName: string,
): Promise<Bug> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryBugById(id)
  if (!current) {
    throw new Error('Bug was not found.')
  }
  const transition = resolveBugTransition(current.status, action)
  if (!transition) {
    throw new Error('This status change is not allowed for the current bug state.')
  }
  const updated = setTemporaryBugStatus(id, transition.nextStatus, actorName)
  if (!updated) {
    throw new Error('Bug was not found.')
  }
  return updated
}

export async function listBugComments(bugId: string): Promise<BugComment[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryComments(bugId)
}

export async function addBugComment(
  bugId: string,
  authorId: string,
  authorName: string,
  body: string,
): Promise<BugComment> {
  await wait(TEMPORARY_LATENCY_MS)
  const created = addTemporaryComment(bugId, authorId, authorName, body)
  if (!created) {
    throw new Error('Bug was not found.')
  }
  return created
}

export async function listBugHistory(bugId: string): Promise<BugHistoryEntry[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryHistory(bugId)
}

export async function listPeople(): Promise<Person[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryPeople()
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
