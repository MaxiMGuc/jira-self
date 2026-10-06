import { ROUTE_PATHS } from '../utils/routes'

export function getSafeRedirectPath(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const from = (state as { from?: unknown }).from
    if (typeof from === 'string' && from.startsWith('/') && from !== ROUTE_PATHS.login) {
      return from
    }
  }
  return ROUTE_PATHS.dashboard
}
