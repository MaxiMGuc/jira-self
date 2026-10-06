import type { User, UserFormData, UserStatus } from '../types/user'
import { TEMPORARY_USER_SEED } from './temporaryUsers'

let users: User[] = cloneUsers(TEMPORARY_USER_SEED)
let nextUserNumber = 1013

export function listTemporaryUsers(): User[] {
  return cloneUsers(users)
}

export function getTemporaryUserById(id: string): User | null {
  const found = users.find((item) => item.id === id)
  return found ? { ...found } : null
}

export function findTemporaryUserByUsername(username: string): User | null {
  const normalized = username.trim().toLowerCase()
  const found = users.find((item) => item.username.toLowerCase() === normalized)
  return found ? { ...found } : null
}

export function createTemporaryUser(form: UserFormData): User {
  const now = new Date().toISOString()
  const created: User = {
    id: `user-${nextUserNumber}`,
    username: form.username.trim(),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    createdAt: now,
  }
  nextUserNumber += 1
  users = [created, ...users]
  return { ...created }
}

export function updateTemporaryUser(id: string, form: UserFormData): User | null {
  const index = users.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const current = users[index]
  const updated: User = {
    ...current,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
  }
  users[index] = updated
  return { ...updated }
}

export function setTemporaryUserStatus(id: string, status: UserStatus): User | null {
  const index = users.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  const updated: User = {
    ...users[index],
    status,
  }
  users[index] = updated
  return { ...updated }
}

export function deleteTemporaryUser(id: string): boolean {
  const before = users.length
  users = users.filter((item) => item.id !== id)
  return users.length < before
}

function cloneUsers(items: User[]): User[] {
  return items.map((item) => ({ ...item }))
}
