import {
  createTemporaryUser,
  deleteTemporaryUser,
  findTemporaryUserByUsername,
  getTemporaryUserById,
  listTemporaryUsers,
  setTemporaryUserStatus,
  updateTemporaryUser,
} from '../data/temporaryUserStore'
import type { User, UserFormData, UserStatus } from '../types/user'

/**
 * Users directory service.
 *
 * Currently uses an isolated in-memory store. Replace function bodies with
 * `apiClient` calls when the Java Core user endpoints exist.
 *
 * Possible future contract (not implemented, not assumed final):
 * GET    /users
 * GET    /users/{id}
 * POST   /users
 * PUT    /users/{id}
 * DELETE /users/{id}
 *
 * A dedicated activation endpoint may be added later.
 *
 * This module is not used by temporary frontend authentication.
 */
const TEMPORARY_LATENCY_MS = 200

export class DuplicateUsernameError extends Error {
  constructor() {
    super('Username is already taken.')
    this.name = 'DuplicateUsernameError'
  }
}

export async function listUsers(): Promise<User[]> {
  await wait(TEMPORARY_LATENCY_MS)
  return listTemporaryUsers()
}

export async function getUserById(id: string): Promise<User | null> {
  await wait(TEMPORARY_LATENCY_MS)
  return getTemporaryUserById(id)
}

export async function createUser(form: UserFormData): Promise<User> {
  await wait(TEMPORARY_LATENCY_MS)
  if (findTemporaryUserByUsername(form.username)) {
    throw new DuplicateUsernameError()
  }
  return createTemporaryUser(form)
}

export async function updateUser(id: string, form: UserFormData): Promise<User> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = updateTemporaryUser(id, form)
  if (!updated) {
    throw new Error('User was not found.')
  }
  return updated
}

export async function setUserStatus(id: string, status: UserStatus): Promise<User> {
  await wait(TEMPORARY_LATENCY_MS)
  const updated = setTemporaryUserStatus(id, status)
  if (!updated) {
    throw new Error('User was not found.')
  }
  return updated
}

export async function deleteUser(id: string): Promise<void> {
  await wait(TEMPORARY_LATENCY_MS)
  if (!deleteTemporaryUser(id)) {
    throw new Error('User was not found.')
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
