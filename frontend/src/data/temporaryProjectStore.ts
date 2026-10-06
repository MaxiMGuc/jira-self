import type { Project, ProjectDraft } from '../types/project'
import { TEMPORARY_PROJECT_SEED } from './temporaryProjects'

/**
 * In-memory store for temporary project records.
 * Isolated from React components. Replace via `projectService` later.
 */
let projects: Project[] = cloneProjects(TEMPORARY_PROJECT_SEED)
let nextSequence = 1012

export function listTemporaryProjects(): Project[] {
  return cloneProjects(projects)
}

export function getTemporaryProjectById(id: string): Project | null {
  const found = projects.find((project) => project.id === id)
  return found ? { ...found } : null
}

export function createTemporaryProject(draft: ProjectDraft): Project {
  const now = new Date().toISOString()
  const created: Project = {
    id: `project-${nextSequence}`,
    name: draft.name.trim(),
    description: draft.description.trim(),
    status: draft.status,
    createdAt: now,
    updatedAt: now,
  }
  nextSequence += 1
  projects = [created, ...projects]
  return { ...created }
}

export function updateTemporaryProject(id: string, draft: ProjectDraft): Project | null {
  const index = projects.findIndex((project) => project.id === id)
  if (index === -1) {
    return null
  }

  const updated: Project = {
    ...projects[index],
    name: draft.name.trim(),
    description: draft.description.trim(),
    status: draft.status,
    updatedAt: new Date().toISOString(),
  }
  projects = [...projects.slice(0, index), updated, ...projects.slice(index + 1)]
  return { ...updated }
}

export function deleteTemporaryProject(id: string): boolean {
  const next = projects.filter((project) => project.id !== id)
  if (next.length === projects.length) {
    return false
  }
  projects = next
  return true
}

function cloneProjects(source: Project[]): Project[] {
  return source.map((project) => ({ ...project }))
}
