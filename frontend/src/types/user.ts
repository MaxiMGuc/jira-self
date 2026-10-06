export const USER_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'QA', 'DEVELOPER'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const

export type UserStatus = (typeof USER_STATUSES)[number]

/**
 * Temporary login session. Kept separate from directory User records.
 * Do not treat this as the Users module data source.
 */
export type SessionUser = {
  id: string
  username: string
  displayName: string
  email: string
  role: UserRole
}

export type User = {
  id: string
  username: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type UserFormData = {
  username: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
}

export const USER_USERNAME_MAX_LENGTH = 40
export const USER_FULL_NAME_MAX_LENGTH = 80
export const USER_EMAIL_MAX_LENGTH = 120
