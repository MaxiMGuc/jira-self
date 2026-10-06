import type { SessionUser } from '../types/user'

const SESSION_STORAGE_KEY = 'defectflow.temporarySession'

export function readStoredSession(): SessionUser | null {
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isSessionUser(parsed)) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function writeStoredSession(user: SessionUser): void {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredSession(): void {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function isSessionUser(value: unknown): value is SessionUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.username === 'string' &&
    typeof record.displayName === 'string' &&
    typeof record.email === 'string' &&
    typeof record.role === 'string'
  )
}
