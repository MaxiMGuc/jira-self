import type { Person } from '../types/bug'

/**
 * TEMPORARY people directory for assignee/reporter labels.
 * Not a Users module and not an API. Replace via the Java Core user API later.
 */
export const TEMPORARY_PEOPLE: Person[] = [
  { id: 'temporary-user-qa-demo', username: 'qa.demo', displayName: 'QA Demo' },
  { id: 'user-anna-dev', username: 'anna.dev', displayName: 'Anna Dev' },
  { id: 'user-marcus-qa', username: 'marcus.qa', displayName: 'Marcus QA' },
  { id: 'user-lena-pm', username: 'lena.pm', displayName: 'Lena PM' },
]
