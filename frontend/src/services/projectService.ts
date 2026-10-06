import {
  createTemporaryProject,
  deleteTemporaryProject,
  getTemporaryProjectById,
  listTemporaryProjects,
  updateTemporaryProject,
} from '../data/temporaryProjectStore'
import type { Project, ProjectDraft } from '../types/project'

/**
 * Projects application service.
 *
 * Currently uses an isolated in-memory store. Replace these function bodies
 * with `apiClient` calls when the Java Core project endpoints exist.
 *
 * Expected future contract (not implemented):
 * GET    /projects
 * GET    /projects/:id
 * POST   /projects
 * PUT    /projects/:id
 * DELETE /projects/:id
 */
const TEMPORARY_LATENCY_MS = 220

export async function listProjects(): Promise<Project[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryProjects()
}

export async function getProjectById(id: string): Promise<Project | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryProjectById(id)
}

export async function createProject(draft: ProjectDraft): Promise<Project> {
  await wait(TEMPORARY_LATENCY_MS)
  return createTemporaryProject(draft)
}

export async function updateProject(id: string, draft: ProjectDraft): Promise<Project> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = updateTemporaryProject(id, draft)
  if (!updated) {
    throw new Error('Project was not found.')
  }
  return updated
}

export async function deleteProject(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  const removed = deleteTemporaryProject(id)
  if (!removed) {
    throw new Error('Project was not found.')
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
