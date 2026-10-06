import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/ui/StatusBadge'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProjectById } from '../services/projectService'
import type { Project } from '../types/project'
import { formatIsoDate } from '../utils/projectDisplay'
import { ROUTE_PATHS } from '../utils/routes'
import './ProjectDetailsPage.css'

const RELATED_MODULES = [
  { label: 'Bugs', path: ROUTE_PATHS.bugs },
  { label: 'Test Cases', path: ROUTE_PATHS.testCases },
  { label: 'Test Suites', path: ROUTE_PATHS.testSuites },
  { label: 'Test Runs', path: ROUTE_PATHS.testRuns },
  { label: 'Releases', path: ROUTE_PATHS.releases },
] as const

export function ProjectDetailsPage() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  usePageTitle(project?.name ?? 'Project')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!id) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setNotFound(false)
      const result = await getProjectById(id)
      if (cancelled) {
        return
      }
      setProject(result)
      setNotFound(result === null)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) {
    return <p className="project-details__state">Loading project…</p>
  }

  if (notFound || !project) {
    return (
      <section data-testid="project-not-found">
        <h1 className="project-details__title">Project not found</h1>
        <p className="project-details__state">This project does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.projects}>Back to projects</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="project-details" data-testid="project-details">
      <p className="project-details__crumb">
        <Link to={ROUTE_PATHS.projects}>Projects</Link>
      </p>
      <header className="project-details__header">
        <div>
          <h1 className="project-details__title">{project.name}</h1>
          <p className="project-details__description">{project.description || 'No description.'}</p>
        </div>
        <StatusBadge status={project.status} />
      </header>
      <dl className="project-details__meta">
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={project.status} />
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDate(project.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatIsoDate(project.updatedAt)}</dd>
        </div>
      </dl>
      <section className="project-details__related">
        <h2 className="project-details__related-title">Related modules</h2>
        <p className="project-details__related-copy">
          These areas will later be scoped to this project when the Java Core API
          is connected. The links currently open the placeholder module pages.
        </p>
        <div className="project-details__related-grid">
          {RELATED_MODULES.map((module) => (
            <Link
              key={module.path}
              className="project-details__related-card"
              to={module.path}
            >
              {module.label}
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}
