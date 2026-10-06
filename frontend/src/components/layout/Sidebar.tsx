import { NavLink } from 'react-router-dom'
import { APP_NAME, APP_NAV_ITEMS } from '../../utils/routes'
import './Sidebar.css'

type SidebarProps = {
  isOpen: boolean
  onNavigate: () => void
}

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <aside
      id="app-sidebar"
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      data-testid="app-sidebar"
      aria-label="Main navigation"
    >
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          DF
        </span>
        <span className="sidebar__title">{APP_NAME}</span>
      </div>
      <nav className="sidebar__nav">
        {APP_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-testid={item.testId}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
