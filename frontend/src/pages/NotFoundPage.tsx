import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { ROUTE_PATHS } from '../utils/routes'
import '../components/PlaceholderPage.css'

export function NotFoundPage() {
  usePageTitle('Not found')

  return (
    <section data-testid="not-found-page">
      <h1 className="placeholder-page__title">Page not found</h1>
      <p className="placeholder-page__description">
        The requested route does not exist.
      </p>
      <p>
        <Link to={ROUTE_PATHS.dashboard}>Back to dashboard</Link>
      </p>
    </section>
  )
}
