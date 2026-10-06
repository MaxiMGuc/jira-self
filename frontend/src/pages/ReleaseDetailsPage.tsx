import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReleaseFormModal } from '../components/releases/ReleaseFormModal'
import { ReleaseLifecycleActions } from '../components/releases/ReleaseLifecycleActions'
import { ReleaseStatusBadge } from '../components/releases/ReleaseBadges'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { listBugs } from '../services/bugService'
import { listProjects } from '../services/projectService'
import { changeReleaseStatus, getReleaseById, updateRelease } from '../services/releaseService'
import { listTestRuns } from '../services/testRunService'
import type { Project } from '../types/project'
import type { Release, ReleaseFormData, ReleaseTransitionAction } from '../types/release'
import { formatIsoDateTime } from '../utils/bugDisplay'
import { formatReleaseDate } from '../utils/releaseDisplay'
import { projectDetailsPath, ROUTE_PATHS } from '../utils/routes'
import './ReleaseDetailsPage.css'

export function ReleaseDetailsPage() {
  const { id } = useParams()
  const [release, setRelease] = useState<Release | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [bugCount, setBugCount] = useState(0)
  const [runCount, setRunCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  usePageTitle(release?.id ?? 'Release')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const [nextRelease, nextProjects, nextBugs, nextRuns] = await Promise.all([
      getReleaseById(id),
      listProjects(),
      listBugs(),
      listTestRuns(),
    ])
    if (!nextRelease) {
      setRelease(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setRelease(nextRelease)
    setProjects(nextProjects)
    setProject(nextProjects.find((item) => item.id === nextRelease.projectId) ?? null)
    setBugCount(nextBugs.filter((item) => item.projectId === nextRelease.projectId).length)
    setRunCount(nextRuns.filter((item) => item.projectId === nextRelease.projectId).length)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(form: ReleaseFormData) {
    if (!release) {
      return
    }
    setIsSaving(true)
    setActionError(null)
    try {
      await updateRelease(release.id, form)
      setIsEditing(false)
      await load()
    } catch {
      setActionError('Unable to save the release.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTransition(action: ReleaseTransitionAction) {
    if (!release) {
      return
    }
    setIsTransitioning(true)
    setActionError(null)
    try {
      await changeReleaseStatus(release.id, action)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to change status.')
    } finally {
      setIsTransitioning(false)
    }
  }

  if (isLoading) {
    return <p className="rel-details__state">Loading release…</p>
  }

  if (notFound || !release) {
    return (
      <section data-testid="release-not-found">
        <h1 className="rel-details__title">Release not found</h1>
        <p className="rel-details__state">This release does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.releases}>Back to releases</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="rel-details" data-testid="release-details">
      <p className="rel-details__crumb">
        <Link to={ROUTE_PATHS.releases}>Releases</Link>
        {' / '}
        {release.id}
      </p>
      <header className="rel-details__header">
        <div>
          <p className="rel-details__id">{release.id}</p>
          <h1 className="rel-details__title">{release.name}</h1>
          <p className="rel-details__description">{release.description || 'No description provided.'}</p>
          <ReleaseStatusBadge status={release.status} />
        </div>
        <Button
          variant="ghost"
          data-testid="edit-release-details"
          onClick={() => {
            setActionError(null)
            setIsEditing(true)
          }}
        >
          Edit
        </Button>
      </header>
      {actionError ? <Alert testId="release-details-error">{actionError}</Alert> : null}

      <dl className="rel-details__meta">
        <div>
          <dt>Project</dt>
          <dd>
            {project ? (
              <Link to={projectDetailsPath(project.id)} data-testid="release-project-link">
                {project.name}
              </Link>
            ) : (
              <span data-testid="release-missing-project">Unknown project</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Release date</dt>
          <dd>{formatReleaseDate(release.releaseDate)}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDateTime(release.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatIsoDateTime(release.updatedAt)}</dd>
        </div>
      </dl>

      <section className="rel-details__section">
        <h2>Change status</h2>
        <p className="rel-details__hint">
          Only the next valid status is offered. The Java Core backend will later enforce this workflow.
        </p>
        <ReleaseLifecycleActions
          release={release}
          isBusy={isTransitioning}
          onTransition={handleTransition}
        />
      </section>

      <section className="rel-related" data-testid="release-related">
        <h2>Related information</h2>
        <p className="rel-details__hint">
          Bugs and test runs currently belong to a project, not to a specific release. Counts below are for{' '}
          {project?.name ?? 'this project'}. Release associations will be connected to the backend later.
        </p>
        <div className="rel-related__grid">
          <article className="rel-related__card">
            <h3>Bugs</h3>
            <p className="rel-related__value" data-testid="release-bug-count">
              {bugCount}
            </p>
            <p>
              <Link to={ROUTE_PATHS.bugs}>Open Bugs</Link>
            </p>
          </article>
          <article className="rel-related__card">
            <h3>Test Runs</h3>
            <p className="rel-related__value" data-testid="release-run-count">
              {runCount}
            </p>
            <p>
              <Link to={ROUTE_PATHS.testRuns}>Open Test Runs</Link>
            </p>
          </article>
        </div>
      </section>

      <ReleaseFormModal
        isOpen={isEditing}
        title="Edit release"
        release={release}
        projects={projects}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
      />
    </section>
  )
}
