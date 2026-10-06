import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BugPriorityBadge, BugSeverityBadge, BugStatusBadge } from '../components/bugs/BugBadges'
import { BugFormModal } from '../components/bugs/BugFormModal'
import { BugLifecycleActions } from '../components/bugs/BugLifecycleActions'
import { Button } from '../components/ui/Button'
import { TextAreaField } from '../components/ui/TextAreaField'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  addBugComment,
  getBugById,
  listBugComments,
  listBugHistory,
  listPeople,
  transitionBugStatus,
  updateBug,
} from '../services/bugService'
import { listProjects } from '../services/projectService'
import type { Bug, BugComment, BugDraft, BugHistoryEntry, BugTransitionAction, Person } from '../types/bug'
import { BUG_COMMENT_MAX_LENGTH } from '../types/bug'
import type { Project } from '../types/project'
import { formatIsoDateTime } from '../utils/bugDisplay'
import { formatIsoDate } from '../utils/projectDisplay'
import { projectDetailsPath, ROUTE_PATHS } from '../utils/routes'
import './BugDetailsPage.css'

export function BugDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [bug, setBug] = useState<Bug | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [comments, setComments] = useState<BugComment[]>([])
  const [history, setHistory] = useState<BugHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  usePageTitle(bug?.id ?? 'Bug')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const [nextBug, nextPeople, nextProjects] = await Promise.all([
      getBugById(id),
      listPeople(),
      listProjects(),
    ])
    if (!nextBug) {
      setBug(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }
    const [nextComments, nextHistory] = await Promise.all([
      listBugComments(id),
      listBugHistory(id),
    ])
    setBug(nextBug)
    setPeople(nextPeople)
    setProjects(nextProjects)
    setProject(nextProjects.find((item) => item.id === nextBug.projectId) ?? null)
    setComments(nextComments)
    setHistory(nextHistory)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const actorName = user?.displayName ?? 'Unknown user'

  async function handleTransition(action: BugTransitionAction) {
    if (!bug) {
      return
    }
    setIsTransitioning(true)
    try {
      await transitionBugStatus(bug.id, action, actorName)
      await load()
    } finally {
      setIsTransitioning(false)
    }
  }

  async function handleSave(draft: BugDraft) {
    if (!bug) {
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateBug(bug.id, draft, actorName)
      setIsEditing(false)
      await load()
    } catch {
      setSaveError('Unable to save the bug.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!bug || !user) {
      return
    }
    if (!commentBody.trim()) {
      setCommentError('Enter a comment.')
      return
    }
    if (commentBody.trim().length > BUG_COMMENT_MAX_LENGTH) {
      setCommentError(`Comment must be ${BUG_COMMENT_MAX_LENGTH} characters or fewer.`)
      return
    }
    setIsCommenting(true)
    setCommentError(null)
    try {
      await addBugComment(bug.id, user.id, user.displayName, commentBody)
      setCommentBody('')
      await load()
    } finally {
      setIsCommenting(false)
    }
  }

  if (isLoading) {
    return <p className="bug-details__state">Loading bug…</p>
  }

  if (notFound || !bug) {
    return (
      <section data-testid="bug-not-found">
        <h1 className="bug-details__title">Bug not found</h1>
        <p className="bug-details__state">This bug does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.bugs}>Back to bugs</Link>
        </p>
      </section>
    )
  }

  const assigneeName = people.find((person) => person.id === bug.assigneeId)?.displayName ?? 'Unassigned'
  const reporterName = people.find((person) => person.id === bug.reporterId)?.displayName ?? 'Unknown'

  return (
    <section className="bug-details" data-testid="bug-details">
      <p className="bug-details__crumb">
        <Link to={ROUTE_PATHS.bugs}>Bugs</Link>
        {' / '}
        {bug.id}
      </p>
      <header className="bug-details__header">
        <div>
          <p className="bug-details__id">{bug.id}</p>
          <h1 className="bug-details__title">{bug.title}</h1>
          <p className="bug-details__description">{bug.description}</p>
        </div>
        <Button
          variant="ghost"
          data-testid="edit-bug-details"
          onClick={() => {
            setSaveError(null)
            setIsEditing(true)
          }}
        >
          Edit
        </Button>
      </header>

      <dl className="bug-details__meta">
        <div>
          <dt>Status</dt>
          <dd>
            <BugStatusBadge status={bug.status} />
          </dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>
            <BugPriorityBadge priority={bug.priority} />
          </dd>
        </div>
        <div>
          <dt>Severity</dt>
          <dd>
            <BugSeverityBadge severity={bug.severity} />
          </dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>
            {project ? (
              <Link to={projectDetailsPath(project.id)}>{project.name}</Link>
            ) : (
              'Unknown project'
            )}
          </dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{assigneeName}</dd>
        </div>
        <div>
          <dt>Reporter</dt>
          <dd>{reporterName}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{bug.environment || 'Not specified'}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDate(bug.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatIsoDate(bug.updatedAt)}</dd>
        </div>
      </dl>

      <section className="bug-details__section">
        <h2>Change status</h2>
        <p className="bug-details__hint">
          Only valid next steps for the current status are shown. The Java Core
          backend will later enforce this workflow.
        </p>
        <BugLifecycleActions bug={bug} isBusy={isTransitioning} onTransition={handleTransition} />
      </section>

      <section className="bug-details__section" data-testid="bug-comments">
        <h2>Comments</h2>
        {comments.length === 0 ? (
          <p className="bug-details__state">No comments yet.</p>
        ) : (
          <ul className="bug-comments">
            {comments.map((comment) => (
              <li key={comment.id} className="bug-comments__item">
                <p className="bug-comments__meta">
                  <strong>{comment.authorName}</strong>
                  <span>{formatIsoDateTime(comment.createdAt)}</span>
                </p>
                <p className="bug-comments__body">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
        <form className="bug-comments__form" onSubmit={handleComment} noValidate>
          <TextAreaField
            id="bug-comment"
            label="Add a comment"
            value={commentBody}
            error={commentError ?? undefined}
            disabled={isCommenting}
            data-testid="bug-comment-input"
            onChange={(event) => setCommentBody(event.target.value)}
          />
          <Button type="submit" loading={isCommenting} loadingLabel="Posting…" data-testid="bug-comment-submit">
            Add comment
          </Button>
        </form>
      </section>

      <section className="bug-details__section" data-testid="bug-history">
        <h2>History</h2>
        <ol className="bug-history">
          {history.map((entry) => (
            <li key={entry.id} className="bug-history__item">
              <span className="bug-history__dot" aria-hidden="true" />
              <div>
                <p className="bug-history__message">{entry.message}</p>
                <p className="bug-history__meta">
                  {entry.actorName} · {formatIsoDateTime(entry.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bug-details__section">
        <h2>Related test cases</h2>
        <p className="bug-details__placeholder">
          Linked test cases will appear here when the Test Cases module is
          connected to the Java Core API.
        </p>
      </section>
      <section className="bug-details__section">
        <h2>Release</h2>
        <p className="bug-details__placeholder">
          Release association will appear here when the Releases module is
          connected to the Java Core API.
        </p>
      </section>

      <BugFormModal
        isOpen={isEditing}
        title="Edit bug"
        bug={bug}
        projects={projects}
        people={people}
        isSubmitting={isSaving}
        submitError={saveError}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
      />
    </section>
  )
}
