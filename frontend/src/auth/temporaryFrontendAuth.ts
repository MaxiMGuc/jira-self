import type { SessionUser } from '../types/user'

/**
 * TEMPORARY frontend-only sign-in.
 *
 * This is not real authentication. It does not call Java Core, does not hash
 * passwords, and must be replaced by `services/authService.ts` once the
 * backend login endpoint exists.
 */
export const TEMPORARY_FRONTEND_CREDENTIALS = {
  username: 'qa.demo',
  email: 'qa.demo@defectflow.local',
  password: 'Demo123!',
} as const

const TEMPORARY_SIGN_IN_DELAY_MS = 450

export class TemporaryAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TemporaryAuthError'
  }
}

export async function signInWithTemporaryFrontendAuth(
  identifier: string,
  password: string,
): Promise<SessionUser> {
  await wait(TEMPORARY_SIGN_IN_DELAY_MS)

  const normalized = identifier.trim().toLowerCase()
  const identifierMatches =
    normalized === TEMPORARY_FRONTEND_CREDENTIALS.username ||
    normalized === TEMPORARY_FRONTEND_CREDENTIALS.email
  const passwordMatches = password === TEMPORARY_FRONTEND_CREDENTIALS.password

  if (!identifierMatches || !passwordMatches) {
    throw new TemporaryAuthError('Invalid username or password.')
  }

  return {
    id: 'temporary-user-qa-demo',
    username: TEMPORARY_FRONTEND_CREDENTIALS.username,
    displayName: 'QA Demo',
    email: TEMPORARY_FRONTEND_CREDENTIALS.email,
    role: 'QA',
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
