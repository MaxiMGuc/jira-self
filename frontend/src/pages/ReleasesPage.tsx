import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReleaseFormModal } from '../components/releases/ReleaseFormModal'
import { ReleaseStatusBadge } from '../components/releases/ReleaseBadges'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { RELEASES_PAGE_SIZE, useReleaseList } from '../hooks/useReleaseList'
import { createRelease, deleteRelease, updateRelease } from '../services/releaseService'
import { RELEASE_STATUSES, type Release, type ReleaseFormData, type ReleaseStatus } from '../types/release'
import { formatIsoDate } from '../utils/projectDisplay'
import { formatReleaseDate, formatReleaseStatus, type ReleaseSortKey } from '../utils/releaseDisplay'
import { releaseDetailsPath } from '../utils/routes'
import './ReleasesPage.css'

export function ReleasesPage() {
  usePageTitle('Releases')
  const list = useReleaseList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selected, setSelected] = useState<Release | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Release | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleSave(form: ReleaseFormData) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selected) {
        await updateRelease(selected.id, form)
      } else {
        await createRelease(form)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelected(null)
      await list.reload()
    } catch {
      setActionError('Unable to save the release.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!toDelete) {
      return
    }
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteRelease(toDelete.id)
      setToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the release.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.releases.length === 0
  const showNoResults = !list.isLoading && list.releases.length > 0 && list.filteredCount === 0
  const statusOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All statuses' },
      ...RELEASE_STATUSES.map((value) => ({ value, label: formatReleaseStatus(value) })),
    ],
    [],
  )

  return (
    <section className="rel-page" data-testid="releases-page">
      <header className="rel-page__header">
        <div>
          <h1 className="rel-page__title">Releases</h1>
          <p className="rel-page__subtitle">Plan and track simple project versions.</p>
        </div>
        <Button
          data-testid="create-release"
          onClick={() => {
            setSelected(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create Release
        </Button>
      </header>
      <p className="rel-page__notice">
        Release records are temporary frontend data. Replace <code>releaseService</code> with the Java Core REST
        API when it is available. Deleting a release does not delete projects, bugs, or test work.
      </p>

      <div className="rel-page__filters">
        <TextField
          id="release-search"
          label="Search"
          placeholder="Search by name or ID"
          value={list.search}
          data-testid="release-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="release-filter-project"
          label="Project"
          value={list.projectId}
          data-testid="release-filter-project"
          options={[
            { value: 'ALL', label: 'All projects' },
            ...list.projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          onChange={(event) => list.setProjectId(event.target.value)}
        />
        <SelectField
          id="release-filter-status"
          label="Status"
          value={list.status}
          data-testid="release-filter-status"
          options={statusOptions}
          onChange={(event) => list.setStatus(event.target.value as 'ALL' | ReleaseStatus)}
        />
        <div className="rel-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="release-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && formMode === 'closed' ? <Alert testId="release-action-error">{actionError}</Alert> : null}
      {list.isLoading ? <p className="rel-page__state">Loading releases…</p> : null}
      {showEmptyCatalog ? (
        <p className="rel-page__state" data-testid="releases-empty">
          No releases yet. Create the first release to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="rel-page__state" data-testid="releases-no-results">
          No releases match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="rel-table-wrap">
            <table className="rel-table" data-testid="releases-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <SortableHeader
                    label="Name / version"
                    column="name"
                    active={list.sortKey === 'name'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('name')}
                  />
                  <th className="rel-table__optional">Description</th>
                  <SortableHeader
                    label="Project"
                    column="project"
                    active={list.sortKey === 'project'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('project')}
                  />
                  <SortableHeader
                    label="Status"
                    column="status"
                    active={list.sortKey === 'status'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('status')}
                  />
                  <SortableHeader
                    label="Release date"
                    column="releaseDate"
                    active={list.sortKey === 'releaseDate'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('releaseDate')}
                  />
                  <SortableHeader
                    className="rel-table__optional"
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
                {list.pagedReleases.map((release) => (
                  <tr key={release.id} data-testid={`release-row-${release.id}`}>
                    <td>
                      <Link to={releaseDetailsPath(release.id)}>{release.id}</Link>
                    </td>
                    <td>
                      <Link to={releaseDetailsPath(release.id)}>{release.name}</Link>
                    </td>
                    <td className="rel-table__optional">{release.description || '—'}</td>
                    <td>{release.projectName}</td>
                    <td>
                      <ReleaseStatusBadge status={release.status} />
                    </td>
                    <td>{formatReleaseDate(release.releaseDate)}</td>
                    <td className="rel-table__optional">{formatIsoDate(release.createdAt)}</td>
                    <td>
                      <div className="rel-table__actions">
                        <Link
                          className="rel-table__open"
                          to={releaseDetailsPath(release.id)}
                          data-testid={`open-release-${release.id}`}
                        >
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          data-testid={`edit-release-${release.id}`}
                          onClick={() => {
                            setSelected(release)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          data-testid={`delete-release-${release.id}`}
                          onClick={() => setToDelete(release)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rel-pagination" data-testid="releases-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="releases-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="rel-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} releases
              {list.filteredCount > RELEASES_PAGE_SIZE ? ` · ${RELEASES_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="releases-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <ReleaseFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit release' : 'Create release'}
        release={formMode === 'edit' ? selected : null}
        projects={list.projects}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete release"
        message={`Delete release “${toDelete?.id ?? ''}”? Projects, bugs, test cases, suites, and runs will not be deleted.`}
        confirmLabel="Delete release"
        isBusy={isDeleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </section>
  )
}

type SortableHeaderProps = {
  label: string
  column: ReleaseSortKey
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
  className?: string
}

function SortableHeader({ label, column, active, direction, onClick, className }: SortableHeaderProps) {
  return (
    <th
      className={className}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className="rel-table__sort" data-testid={`sort-release-${column}`} onClick={onClick}>
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
