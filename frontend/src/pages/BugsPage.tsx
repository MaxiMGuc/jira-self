import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BugFormModal } from '../components/bugs/BugFormModal'
import { BugPriorityBadge, BugSeverityBadge, BugStatusBadge } from '../components/bugs/BugBadges'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { BUGS_PAGE_SIZE, useBugList } from '../hooks/useBugList'
import { createBug, deleteBug, updateBug } from '../services/bugService'
import {
  BUG_PRIORITIES,
  BUG_SEVERITIES,
  BUG_STATUSES,
  type Bug,
  type BugDraft,
} from '../types/bug'
import {
  formatBugPriority,
  formatBugSeverity,
  formatBugStatus,
  isBugPriority,
  isBugSeverity,
  isBugStatus,
  type BugSortKey,
} from '../utils/bugDisplay'
import { formatIsoDate } from '../utils/projectDisplay'
import { bugDetailsPath } from '../utils/routes'
import './BugsPage.css'

export function BugsPage() {
  usePageTitle('Bugs')
  const { user } = useAuth()
  const list = useBugList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [bugToDelete, setBugToDelete] = useState<Bug | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const actorName = user?.displayName ?? 'Unknown user'
  const reporterId = user?.id ?? 'temporary-user-qa-demo'

  async function handleSave(draft: BugDraft) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selectedBug) {
        await updateBug(selectedBug.id, draft, actorName)
      } else {
        await createBug(draft, reporterId, actorName)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelectedBug(null)
      await list.reload()
    } catch {
      setActionError('Unable to save the bug.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!bugToDelete) {
      return
    }
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteBug(bugToDelete.id)
      setBugToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the bug.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.bugs.length === 0
  const showNoResults = !list.isLoading && list.bugs.length > 0 && list.filteredCount === 0

  return (
    <section className="bugs-page" data-testid="bugs-page">
      <header className="bugs-page__header">
        <div>
          <h1 className="bugs-page__title">Bugs</h1>
          <p className="bugs-page__subtitle">
            Track defects, assignment, and lifecycle for DefectFlow projects.
          </p>
        </div>
        <Button
          data-testid="create-bug"
          onClick={() => {
            setSelectedBug(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create Bug
        </Button>
      </header>
      <p className="bugs-page__notice">
        Bug records, comments, and history are temporary frontend data. Replace{' '}
        <code>bugService</code> with the Java Core REST API when it is available.
      </p>

      <div className="bugs-page__filters">
        <TextField
          id="bug-search"
          label="Search"
          placeholder="Search by title or ID"
          value={list.search}
          data-testid="bug-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="bug-filter-project"
          label="Project"
          value={list.filters.projectId}
          data-testid="bug-filter-project"
          options={[
            { value: 'ALL', label: 'All projects' },
            ...list.projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          onChange={(event) => list.setFilter('projectId', event.target.value)}
        />
        <SelectField
          id="bug-filter-status"
          label="Status"
          value={list.filters.status}
          data-testid="bug-filter-status"
          options={[
            { value: 'ALL', label: 'All statuses' },
            ...BUG_STATUSES.map((status) => ({ value: status, label: formatBugStatus(status) })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isBugStatus(value)) {
              list.setFilter('status', value)
            }
          }}
        />
        <SelectField
          id="bug-filter-priority"
          label="Priority"
          value={list.filters.priority}
          data-testid="bug-filter-priority"
          options={[
            { value: 'ALL', label: 'All priorities' },
            ...BUG_PRIORITIES.map((item) => ({ value: item, label: formatBugPriority(item) })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isBugPriority(value)) {
              list.setFilter('priority', value)
            }
          }}
        />
        <SelectField
          id="bug-filter-severity"
          label="Severity"
          value={list.filters.severity}
          data-testid="bug-filter-severity"
          options={[
            { value: 'ALL', label: 'All severities' },
            ...BUG_SEVERITIES.map((item) => ({ value: item, label: formatBugSeverity(item) })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isBugSeverity(value)) {
              list.setFilter('severity', value)
            }
          }}
        />
        <SelectField
          id="bug-filter-assignee"
          label="Assignee"
          value={list.filters.assigneeId}
          data-testid="bug-filter-assignee"
          options={[
            { value: 'ALL', label: 'All assignees' },
            ...list.people.map((person) => ({ value: person.id, label: person.displayName })),
          ]}
          onChange={(event) => list.setFilter('assigneeId', event.target.value)}
        />
        <div className="bugs-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="bug-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && formMode === 'closed' ? <Alert testId="bug-action-error">{actionError}</Alert> : null}
      {list.isLoading ? <p className="bugs-page__state">Loading bugs…</p> : null}
      {showEmptyCatalog ? (
        <p className="bugs-page__state" data-testid="bugs-empty">
          No bugs yet. Create the first bug to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="bugs-page__state" data-testid="bugs-no-results">
          No bugs match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="bugs-table-wrap">
            <table className="bugs-table" data-testid="bugs-table">
              <thead>
                <tr>
                  <SortableHeader label="ID" column="id" active={list.sortKey === 'id'} direction={list.sortDirection} onClick={() => list.changeSort('id')} />
                  <SortableHeader label="Title" column="title" active={list.sortKey === 'title'} direction={list.sortDirection} onClick={() => list.changeSort('title')} />
                  <th>Project</th>
                  <SortableHeader label="Status" column="status" active={list.sortKey === 'status'} direction={list.sortDirection} onClick={() => list.changeSort('status')} />
                  <SortableHeader label="Priority" column="priority" active={list.sortKey === 'priority'} direction={list.sortDirection} onClick={() => list.changeSort('priority')} />
                  <SortableHeader label="Severity" column="severity" active={list.sortKey === 'severity'} direction={list.sortDirection} onClick={() => list.changeSort('severity')} />
                  <th>Assignee</th>
                  <th className="bugs-table__optional">Reporter</th>
                  <SortableHeader className="bugs-table__optional" label="Created" column="createdAt" active={list.sortKey === 'createdAt'} direction={list.sortDirection} onClick={() => list.changeSort('createdAt')} />
                  <SortableHeader className="bugs-table__optional" label="Updated" column="updatedAt" active={list.sortKey === 'updatedAt'} direction={list.sortDirection} onClick={() => list.changeSort('updatedAt')} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pagedBugs.map((bug) => (
                  <tr key={bug.id} data-testid={`bug-row-${bug.id}`}>
                    <td>
                      <Link to={bugDetailsPath(bug.id)}>{bug.id}</Link>
                    </td>
                    <td>
                      <Link to={bugDetailsPath(bug.id)}>{bug.title}</Link>
                    </td>
                    <td>{bug.projectName}</td>
                    <td>
                      <BugStatusBadge status={bug.status} />
                    </td>
                    <td>
                      <BugPriorityBadge priority={bug.priority} />
                    </td>
                    <td>
                      <BugSeverityBadge severity={bug.severity} />
                    </td>
                    <td>{bug.assigneeName}</td>
                    <td className="bugs-table__optional">{bug.reporterName}</td>
                    <td className="bugs-table__optional">{formatIsoDate(bug.createdAt)}</td>
                    <td className="bugs-table__optional">{formatIsoDate(bug.updatedAt)}</td>
                    <td>
                      <div className="bugs-table__actions">
                        <Link className="bugs-table__open" to={bugDetailsPath(bug.id)} data-testid={`open-bug-${bug.id}`}>
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          data-testid={`edit-bug-${bug.id}`}
                          onClick={() => {
                            setSelectedBug(bug)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          data-testid={`delete-bug-${bug.id}`}
                          onClick={() => setBugToDelete(bug)}
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
          <div className="bugs-pagination" data-testid="bugs-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="bugs-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="bugs-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} bugs
              {list.filteredCount > BUGS_PAGE_SIZE ? ` · ${BUGS_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="bugs-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <BugFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit bug' : 'Create bug'}
        bug={formMode === 'edit' ? selectedBug : null}
        projects={list.projects}
        people={list.people}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(bugToDelete)}
        title="Delete bug"
        message={`Delete “${bugToDelete?.id ?? ''}”? This temporary record, its comments, and history will be removed from the frontend store.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onCancel={() => setBugToDelete(null)}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </section>
  )
}

type SortableHeaderProps = {
  label: string
  column: BugSortKey
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
      <button type="button" className="bugs-table__sort" data-testid={`sort-bug-${column}`} onClick={onClick}>
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
