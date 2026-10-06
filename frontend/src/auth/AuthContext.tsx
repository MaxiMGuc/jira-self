import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { clearStoredSession, readStoredSession, writeStoredSession } from './sessionStorage'
import { login as loginRequest } from '../services/authService'
import type { SessionUser } from '../types/user'

type AuthContextValue = {
  user: SessionUser | null
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredSession())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(identifier: string, password: string) {
        const nextUser = await loginRequest(identifier, password)
        writeStoredSession(nextUser)
        setUser(nextUser)
      },
      logout() {
        clearStoredSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
