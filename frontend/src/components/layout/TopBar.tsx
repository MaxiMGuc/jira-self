import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../ui/Button'
import { ROUTE_PATHS } from '../../utils/routes'

type TopBarProps = {
  title: string
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopBar({ title, isSidebarOpen, onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  return (
    <header className="topbar" data-testid="app-topbar">
      <button
        type="button"
        className="topbar__menu"
        aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isSidebarOpen}
        aria-controls="app-sidebar"
        data-testid="sidebar-toggle"
        onClick={onToggleSidebar}
      >
        <span className="topbar__menu-icon" aria-hidden="true" />
      </button>
      <p className="topbar__title">{title}</p>
      {user ? (
        <div className="topbar__actions">
          <div className="topbar__user" data-testid="current-user">
            <span className="topbar__avatar" aria-hidden="true">
              {getInitials(user.displayName)}
            </span>
            <span className="topbar__user-copy">
              <span className="topbar__user-name">{user.displayName}</span>
              <span className="topbar__user-role">{formatRole(user.role)}</span>
            </span>
          </div>
          <Button variant="ghost" data-testid="logout-button" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      ) : null}
    </header>
  )
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function formatRole(role: string): string {
  return role.replaceAll('_', ' ')
}
