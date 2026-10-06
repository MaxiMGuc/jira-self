import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRoleBadge, UserStatusBadge } from '../components/users/UserBadges'
import { UserFormModal } from '../components/users/UserFormModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { USERS_PAGE_SIZE, useUserList } from '../hooks/useUserList'
import { createUser, DuplicateUsernameError, setUserStatus, updateUser } from '../services/userService'
import { USER_ROLES, USER_STATUSES, type User, type UserFormData, type UserRole, type UserStatus } from '../types/user'
import { formatIsoDate } from '../utils/projectDisplay'
import { formatUserRole, formatUserStatus, type UserSortKey } from '../utils/userDisplay'
import { userDetailsPath } from '../utils/routes'
import './UsersPage.css'

export function UsersPage() {
  usePageTitle('Users')
  const list = useUserList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selected, setSelected] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toDeactivate, setToDeactivate] = useState<User | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleSave(form: UserFormData) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selected) {
        await updateUser(selected.id, form)
      } else {
        await createUser(form)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelected(null)
      await list.reload()
    } catch (error) {
      if (error instanceof DuplicateUsernameError) {
        setActionError(error.message)
      } else {
        setActionError('Unable to save the user.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleActivate(user: User) {
    setIsUpdatingStatus(true)
    setActionError(null)
    try {
      await setUserStatus(user.id, 'ACTIVE')
      await list.reload()
    } catch {
      setActionError('Unable to activate the user.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDeactivate() {
    if (!toDeactivate) {
      return
    }
    setIsUpdatingStatus(true)
    setActionError(null)
    try {
      await setUserStatus(toDeactivate.id, 'INACTIVE')
      setToDeactivate(null)
      await list.reload()
    } catch {
      setActionError('Unable to deactivate the user.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.users.length === 0
  const showNoResults = !list.isLoading && list.users.length > 0 && list.filteredCount === 0
  const roleOptions = useMemo(
    () => [{ value: 'ALL', label: 'All roles' }, ...USER_ROLES.map((value) => ({ value, label: formatUserRole(value) }))],
    [],
  )
  const statusOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All statuses' },
      ...USER_STATUSES.map((value) => ({ value, label: formatUserStatus(value) })),
    ],
    [],
  )

  return (
    <section className="usr-page" data-testid="users-page">
      <header className="usr-page__header">
        <div>
          <h1 className="usr-page__title">Users</h1>
          <p className="usr-page__subtitle">Directory of accounts, roles, and active status.</p>
        </div>
        <Button
          data-testid="create-user"
          onClick={() => {
            setSelected(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create User
        </Button>
      </header>
      <p className="usr-page__notice">
        User records are temporary frontend data and are not connected to the demo login. Replace{' '}
        <code>userService</code> with the Java Core REST API when it is available. Passwords are not stored or
        shown here.
      </p>

      <div className="usr-page__filters">
        <TextField
          id="user-search"
          label="Search"
          placeholder="Search by username, name, or email"
          value={list.search}
          data-testid="user-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="user-filter-role"
          label="Role"
          value={list.role}
          data-testid="user-filter-role"
          options={roleOptions}
          onChange={(event) => list.setRole(event.target.value as 'ALL' | UserRole)}
        />
        <SelectField
          id="user-filter-status"
          label="Status"
          value={list.status}
          data-testid="user-filter-status"
          options={statusOptions}
          onChange={(event) => list.setStatus(event.target.value as 'ALL' | UserStatus)}
        />
        <div className="usr-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="user-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && formMode === 'closed' ? <Alert testId="user-action-error">{actionError}</Alert> : null}
      {list.isLoading ? <p className="usr-page__state">Loading users…</p> : null}
      {showEmptyCatalog ? (
        <p className="usr-page__state" data-testid="users-empty">
          No users yet. Create the first user to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="usr-page__state" data-testid="users-no-results">
          No users match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="usr-table-wrap">
            <table className="usr-table" data-testid="users-table">
              <thead>
                <tr>
                  <SortableHeader
                    label="Username"
                    column="username"
                    active={list.sortKey === 'username'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('username')}
                  />
                  <SortableHeader
                    label="Full name"
                    column="fullName"
                    active={list.sortKey === 'fullName'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('fullName')}
                  />
                  <th>Email</th>
                  <SortableHeader
                    label="Role"
                    column="role"
                    active={list.sortKey === 'role'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('role')}
                  />
                  <SortableHeader
                    label="Status"
                    column="status"
                    active={list.sortKey === 'status'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('status')}
                  />
                  <SortableHeader
                    label="Created"
                    column="createdAt"
                    active={list.sortKey === 'createdAt'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('createdAt')}
                  />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pagedUsers.map((user) => (
                  <tr key={user.id} data-testid={`user-row-${user.id}`}>
                    <td>
                      <Link to={userDetailsPath(user.id)}>{user.username}</Link>
                    </td>
                    <td>
                      <Link to={userDetailsPath(user.id)}>{user.fullName}</Link>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td>
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td>{formatIsoDate(user.createdAt)}</td>
                    <td>
                      <div className="usr-table__actions">
                        <Link
                          className="usr-table__open"
                          to={userDetailsPath(user.id)}
                          data-testid={`open-user-${user.id}`}
                        >
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          data-testid={`edit-user-${user.id}`}
                          onClick={() => {
                            setSelected(user)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="danger"
                            disabled={isUpdatingStatus}
                            data-testid={`deactivate-user-${user.id}`}
                            onClick={() => setToDeactivate(user)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            disabled={isUpdatingStatus}
                            data-testid={`activate-user-${user.id}`}
                            onClick={() => {
                              void handleActivate(user)
                            }}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="usr-pagination" data-testid="users-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="users-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="usr-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} users
              {list.filteredCount > USERS_PAGE_SIZE ? ` · ${USERS_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="users-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <UserFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit user' : 'Create user'}
        user={formMode === 'edit' ? selected : null}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(toDeactivate)}
        title="Deactivate user"
        message={`Deactivate “${toDeactivate?.username ?? ''}”? The account will appear as Inactive. This is frontend-only for now.`}
        confirmLabel="Deactivate"
        loadingLabel="Deactivating…"
        isBusy={isUpdatingStatus}
        testId="deactivate-user-confirm"
        onCancel={() => setToDeactivate(null)}
        onConfirm={() => {
          void handleDeactivate()
        }}
      />
    </section>
  )
}

type SortableHeaderProps = {
  label: string
  column: UserSortKey
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}

function SortableHeader({ label, column, active, direction, onClick }: SortableHeaderProps) {
  return (
    <th aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="usr-table__sort" data-testid={`sort-user-${column}`} onClick={onClick}>
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
