import {
  createTemporaryRelease,
  deleteTemporaryRelease,
  getTemporaryReleaseById,
  listTemporaryReleases,
  setTemporaryReleaseStatus,
  updateTemporaryRelease,
} from '../data/temporaryReleaseStore'
import type { Release, ReleaseFormData, ReleaseTransitionAction } from '../types/release'
import { resolveReleaseTransition } from '../utils/releaseLifecycle'

/**
 * Releases application service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core release endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /releases
 * GET    /releases/{id}
 * POST   /releases
 * PUT    /releases/{id}
 * DELETE /releases/{id}
 *
 * A dedicated status endpoint may be added later.
 */
const TEMPORARY_LATENCY_MS = 200

export async function listReleases(): Promise<Release[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryReleases()
}

export async function getReleaseById(id: string): Promise<Release | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryReleaseById(id)
}

export async function createRelease(form: ReleaseFormData): Promise<Release> {
  await wait(TEMPORARY_LATENCY_MS)
  return createTemporaryRelease(form)
}

export async function updateRelease(id: string, form: ReleaseFormData): Promise<Release> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = updateTemporaryRelease(id, form)
  if (!updated) {
    throw new Error('Release was not found.')
  }
  return updated
}

export async function changeReleaseStatus(
  id: string,
  action: ReleaseTransitionAction,
): Promise<Release> {
  await wait(TEMPORARY_LATENCY_MS)
  const current = getTemporaryReleaseById(id)
  if (!current) {
    throw new Error('Release was not found.')
  }
  const transition = resolveReleaseTransition(current.status, action)
  if (!transition) {
    throw new Error('That status change is not allowed from the current state.')
  }
  const updated = setTemporaryReleaseStatus(id, transition.nextStatus)
  if (!updated) {
    throw new Error('Release was not found.')
  }
  return updated
}

export async function deleteRelease(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryRelease(id)) {
    throw new Error('Release was not found.')
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
