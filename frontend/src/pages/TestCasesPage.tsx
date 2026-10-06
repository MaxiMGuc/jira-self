import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { TestCasePriorityBadge, TestCaseStatusBadge } from '../components/testCases/TestCaseBadges'
import { TestCaseFormModal } from '../components/testCases/TestCaseFormModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { TEST_CASES_PAGE_SIZE, useTestCaseList } from '../hooks/useTestCaseList'
import { createTestCase, deleteTestCase, updateTestCase } from '../services/testCaseService'
import { TEST_CASE_PRIORITIES, TEST_CASE_STATUSES, type TestCase, type TestCaseDraft } from '../types/testCase'
import { formatIsoDate } from '../utils/projectDisplay'
import { testCaseDetailsPath } from '../utils/routes'
import {
  formatTestCasePriority,
  formatTestCaseStatus,
  isTestCasePriority,
  isTestCaseStatus,
  type TestCaseSortKey,
} from '../utils/testCaseDisplay'
import './TestCasesPage.css'

export function TestCasesPage() {
  usePageTitle('Test Cases')
  const { user } = useAuth()
  const list = useTestCaseList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selected, setSelected] = useState<TestCase | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState<TestCase | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const authorId = user?.id ?? 'temporary-user-qa-demo'

  async function handleSave(draft: TestCaseDraft) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selected) {
        await updateTestCase(selected.id, draft)
      } else {
        await createTestCase(draft, authorId)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelected(null)
      await list.reload()
    } catch {
      setActionError('Unable to save the test case.')
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
      await deleteTestCase(toDelete.id)
      setToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the test case.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.testCases.length === 0
  const showNoResults = !list.isLoading && list.testCases.length > 0 && list.filteredCount === 0

  return (
    <section className="tc-page" data-testid="test-cases-page">
      <header className="tc-page__header">
        <div>
          <h1 className="tc-page__title">Test Cases</h1>
          <p className="tc-page__subtitle">Manual test cases for DefectFlow projects.</p>
        </div>
        <Button
          data-testid="create-test-case"
          onClick={() => {
            setSelected(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create Test Case
        </Button>
      </header>
      <p className="tc-page__notice">
        Test case records are temporary frontend data. Replace <code>testCaseService</code> with the Java
        Core REST API when it is available.
      </p>

      <div className="tc-page__filters">
        <TextField
          id="test-case-search"
          label="Search"
          placeholder="Search by title or ID"
          value={list.search}
          data-testid="test-case-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="test-case-filter-project"
          label="Project"
          value={list.filters.projectId}
          data-testid="test-case-filter-project"
          options={[
            { value: 'ALL', label: 'All projects' },
            ...list.projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          onChange={(event) => list.setFilter('projectId', event.target.value)}
        />
        <SelectField
          id="test-case-filter-priority"
          label="Priority"
          value={list.filters.priority}
          data-testid="test-case-filter-priority"
          options={[
            { value: 'ALL', label: 'All priorities' },
            ...TEST_CASE_PRIORITIES.map((item) => ({ value: item, label: formatTestCasePriority(item) })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isTestCasePriority(value)) {
              list.setFilter('priority', value)
            }
          }}
        />
        <SelectField
          id="test-case-filter-status"
          label="Status"
          value={list.filters.status}
          data-testid="test-case-filter-status"
          options={[
            { value: 'ALL', label: 'All statuses' },
            ...TEST_CASE_STATUSES.map((item) => ({ value: item, label: formatTestCaseStatus(item) })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isTestCaseStatus(value)) {
              list.setFilter('status', value)
            }
          }}
        />
        <div className="tc-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="test-case-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && formMode === 'closed' ? (
        <Alert testId="test-case-action-error">{actionError}</Alert>
      ) : null}
      {list.isLoading ? <p className="tc-page__state">Loading test cases…</p> : null}
      {showEmptyCatalog ? (
        <p className="tc-page__state" data-testid="test-cases-empty">
          No test cases yet. Create the first test case to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="tc-page__state" data-testid="test-cases-no-results">
          No test cases match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="tc-table-wrap">
            <table className="tc-table" data-testid="test-cases-table">
              <thead>
                <tr>
                  <SortableHeader label="ID" column="id" active={list.sortKey === 'id'} direction={list.sortDirection} onClick={() => list.changeSort('id')} />
                  <SortableHeader label="Title" column="title" active={list.sortKey === 'title'} direction={list.sortDirection} onClick={() => list.changeSort('title')} />
                  <SortableHeader label="Project" column="project" active={list.sortKey === 'project'} direction={list.sortDirection} onClick={() => list.changeSort('project')} />
                  <SortableHeader label="Priority" column="priority" active={list.sortKey === 'priority'} direction={list.sortDirection} onClick={() => list.changeSort('priority')} />
                  <SortableHeader label="Status" column="status" active={list.sortKey === 'status'} direction={list.sortDirection} onClick={() => list.changeSort('status')} />
                  <th className="tc-table__optional">Author</th>
                  <SortableHeader className="tc-table__optional" label="Updated" column="updatedAt" active={list.sortKey === 'updatedAt'} direction={list.sortDirection} onClick={() => list.changeSort('updatedAt')} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pagedCases.map((item) => (
                  <tr key={item.id} data-testid={`test-case-row-${item.id}`}>
                    <td>
                      <Link to={testCaseDetailsPath(item.id)}>{item.id}</Link>
                    </td>
                    <td>
                      <Link to={testCaseDetailsPath(item.id)}>{item.title}</Link>
                    </td>
                    <td>{item.projectName}</td>
                    <td>
                      <TestCasePriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <TestCaseStatusBadge status={item.status} />
                    </td>
                    <td className="tc-table__optional">{item.authorName}</td>
                    <td className="tc-table__optional">{formatIsoDate(item.updatedAt)}</td>
                    <td>
                      <div className="tc-table__actions">
                        <Link
                          className="tc-table__open"
                          to={testCaseDetailsPath(item.id)}
                          data-testid={`open-test-case-${item.id}`}
                        >
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          data-testid={`edit-test-case-${item.id}`}
                          onClick={() => {
                            setSelected(item)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          data-testid={`delete-test-case-${item.id}`}
                          onClick={() => setToDelete(item)}
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
          <div className="tc-pagination" data-testid="test-cases-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="test-cases-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="tc-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} test cases
              {list.filteredCount > TEST_CASES_PAGE_SIZE ? ` · ${TEST_CASES_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="test-cases-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <TestCaseFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit test case' : 'Create test case'}
        testCase={formMode === 'edit' ? selected : null}
        projects={list.projects}
        bugs={list.bugs}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete test case"
        message={`Delete “${toDelete?.id ?? ''}”? This temporary record will be removed from the frontend store.`}
        confirmLabel="Delete"
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
  column: TestCaseSortKey
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
      <button
        type="button"
        className="tc-table__sort"
        data-testid={`sort-test-case-${column}`}
        onClick={onClick}
      >
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
