import { usePageTitle } from '../hooks/usePageTitle'
import './PlaceholderPage.css'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  usePageTitle(title)

  return (
    <section className="placeholder-page" data-testid="placeholder-page">
      <h1 className="placeholder-page__title">{title}</h1>
      <p className="placeholder-page__description">{description}</p>
      <p className="placeholder-page__note">
        This screen is a layout placeholder. It will load real data from the
        DefectFlow API once the corresponding backend endpoints are available.
      </p>
    </section>
  )
}
