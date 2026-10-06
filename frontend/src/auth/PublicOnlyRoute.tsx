import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { getSafeRedirectPath } from './redirect'

type PublicOnlyRouteProps = {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (user) {
    return <Navigate to={getSafeRedirectPath(location.state)} replace />
  }

  return children
}
