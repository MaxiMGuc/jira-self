import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { UserRoleBadge, UserStatusBadge } from '../components/users/UserBadges'
import { UserFormModal } from '../components/users/UserFormModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { usePageTitle } from '../hooks/usePageTitle'
import { getUserById, setUserStatus, updateUser } from '../services/userService'
import type { User, UserFormData } from '../types/user'
import { formatIsoDateTime } from '../utils/bugDisplay'
import { ROUTE_PATHS } from '../utils/routes'
import './UserDetailsPage.css'

export function UserDetailsPage() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  usePageTitle(user?.username ?? 'User')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const nextUser = await getUserById(id)
    if (!nextUser) {
      setUser(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setUser(nextUser)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(form: UserFormData) {
    if (!user) {
      return
    }
    setIsSaving(true)
    setActionError(null)
    try {
      await updateUser(user.id, form)
      setIsEditing(false)
      await load()
    } catch {
      setActionError('Unable to save the user.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleActivate() {
    if (!user) {
      return
    }
    setIsUpdatingStatus(true)
    setActionError(null)
    try {
      await setUserStatus(user.id, 'ACTIVE')
      await load()
    } catch {
      setActionError('Unable to activate the user.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDeactivate() {
    if (!user) {
      return
    }
    setIsUpdatingStatus(true)
    setActionError(null)
    try {
      await setUserStatus(user.id, 'INACTIVE')
      setConfirmDeactivate(false)
      await load()
    } catch {
      setActionError('Unable to deactivate the user.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return <p className="usr-details__state">Loading user…</p>
  }

  if (notFound || !user) {
    return (
      <section data-testid="user-not-found">
        <h1 className="usr-details__title">User not found</h1>
        <p className="usr-details__state">This user does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.users}>Back to users</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="usr-details" data-testid="user-details">
      <p className="usr-details__crumb">
        <Link to={ROUTE_PATHS.users}>Users</Link>
        {' / '}
        {user.username}
      </p>
      <header className="usr-details__header">
        <div>
          <p className="usr-details__id">{user.username}</p>
          <h1 className="usr-details__title">{user.fullName}</h1>
          <div className="usr-details__badges">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
        </div>
        <div className="usr-details__actions">
          <Button
            variant="ghost"
            data-testid="edit-user-details"
            onClick={() => {
              setActionError(null)
              setIsEditing(true)
            }}
          >
            Edit
          </Button>
          {user.status === 'ACTIVE' ? (
            <Button
              variant="danger"
              disabled={isUpdatingStatus}
              data-testid="deactivate-user-details"
              onClick={() => setConfirmDeactivate(true)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={isUpdatingStatus}
              loading={isUpdatingStatus}
              loadingLabel="Activating…"
              data-testid="activate-user-details"
              onClick={() => {
                void handleActivate()
              }}
            >
              Activate
            </Button>
          )}
        </div>
      </header>
      {actionError ? <Alert testId="user-details-error">{actionError}</Alert> : null}

      <dl className="usr-details__meta">
        <div>
          <dt>Username</dt>
          <dd>{user.username}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDateTime(user.createdAt)}</dd>
        </div>
        <div>
          <dt>Account status</dt>
          <dd>
            <UserStatusBadge status={user.status} />
          </dd>
        </div>
      </dl>

      <section className="usr-assignments" data-testid="user-assignments">
        <h2>Projects / Assignments</h2>
        <p className="usr-details__hint">
          Project membership will be defined later in the Java Core backend. This section is a placeholder and does
          not invent team assignments.
        </p>
      </section>

      <UserFormModal
        isOpen={isEditing}
        title="Edit user"
        user={user}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={confirmDeactivate}
        title="Deactivate user"
        message={`Deactivate “${user.username}”? The account will appear as Inactive. This is frontend-only for now.`}
        confirmLabel="Deactivate"
        loadingLabel="Deactivating…"
        isBusy={isUpdatingStatus}
        testId="deactivate-user-details-confirm"
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => {
          void handleDeactivate()
        }}
      />
    </section>
  )
}
