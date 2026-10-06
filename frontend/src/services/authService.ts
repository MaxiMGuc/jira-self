import { signInWithTemporaryFrontendAuth } from '../auth/temporaryFrontendAuth'
import type { SessionUser } from '../types/user'

/**
 * Application authentication entry point.
 *
 * Currently delegates to temporary frontend-only sign-in.
 * Replace the body of `login` with an `apiClient` call to the Java Core
 * REST login endpoint when that contract exists. Do not keep this
 * temporary path in production.
 */
export async function login(identifier: string, password: string): Promise<SessionUser> {
  return signInWithTemporaryFrontendAuth(identifier, password)
}
