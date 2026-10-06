import type { Release, ReleaseFormData, ReleaseStatus } from '../types/release'
import { TEMPORARY_RELEASE_SEED } from './temporaryReleases'

let releases: Release[] = cloneReleases(TEMPORARY_RELEASE_SEED)
let nextReleaseNumber = 1013

export function listTemporaryReleases(): Release[] {
  return cloneReleases(releases)
}

export function getTemporaryReleaseById(id: string): Release | null {
  const found = releases.find((item) => item.id === id)
  return found ? { ...found } : null
}

export function createTemporaryRelease(form: ReleaseFormData): Release {
  const now = new Date().toISOString()
  const created: Release = {
    id: `REL-${nextReleaseNumber}`,
    name: form.name.trim(),
    description: form.description.trim(),
    projectId: form.projectId,
    status: 'PLANNED',
    releaseDate: form.releaseDate,
    createdAt: now,
    updatedAt: now,
  }
  nextReleaseNumber += 1
  releases = [created, ...releases]
  return { ...created }
}

export function updateTemporaryRelease(id: string, form: ReleaseFormData): Release | null {
  const index = releases.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = releases[index]
  const updated: Release = {
    ...current,
    name: form.name.trim(),
    description: form.description.trim(),
    projectId: form.projectId,
    releaseDate: form.releaseDate,
    updatedAt: new Date().toISOString(),
  }
  releases[index] = updated
  return { ...updated }
}

export function setTemporaryReleaseStatus(id: string, status: ReleaseStatus): Release | null {
  const index = releases.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const updated: Release = {
    ...releases[index],
    status,
    updatedAt: new Date().toISOString(),
  }
  releases[index] = updated
  return { ...updated }
}

export function deleteTemporaryRelease(id: string): boolean {
  const before = releases.length
  releases = releases.filter((item) => item.id !== id)
  return releases.length < before
}

function cloneReleases(items: Release[]): Release[] {
  return items.map((item) => ({ ...item }))
}
