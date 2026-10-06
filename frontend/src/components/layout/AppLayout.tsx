import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { APP_NAV_ITEMS, APP_NAME } from '../../utils/routes'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import './AppLayout.css'
import './TopBar.css'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const currentNavItem = APP_NAV_ITEMS.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  )
  const pageTitle = currentNavItem?.label ?? APP_NAME

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
      {isSidebarOpen ? (
        <button
          type="button"
          className="app-layout__backdrop"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      ) : null}
      <div className="app-layout__main">
        <TopBar
          title={pageTitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <main className="app-layout__content" data-testid="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
