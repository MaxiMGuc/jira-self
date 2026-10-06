import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TestSuiteFormModal } from '../components/testSuites/TestSuiteFormModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { TEST_SUITES_PAGE_SIZE, useTestSuiteList } from '../hooks/useTestSuiteList'
import { createTestSuite, deleteTestSuite, updateTestSuite } from '../services/testSuiteService'
import type { TestSuite, TestSuiteFormData } from '../types/testSuite'
import { formatIsoDate } from '../utils/projectDisplay'
import { testSuiteDetailsPath } from '../utils/routes'
import type { TestSuiteSortKey } from '../utils/testSuiteDisplay'
import './TestSuitesPage.css'

export function TestSuitesPage() {
  usePageTitle('Test Suites')
  const list = useTestSuiteList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selected, setSelected] = useState<TestSuite | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState<TestSuite | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleSave(form: TestSuiteFormData) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selected) {
        await updateTestSuite(selected.id, form)
      } else {
        await createTestSuite(form)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelected(null)
      await list.reload()
    } catch {
      setActionError('Unable to save the test suite.')
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
      await deleteTestSuite(toDelete.id)
      setToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the test suite.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.suites.length === 0
  const showNoResults = !list.isLoading && list.suites.length > 0 && list.filteredCount === 0

  return (
    <section className="ts-page" data-testid="test-suites-page">
      <header className="ts-page__header">
        <div>
          <h1 className="ts-page__title">Test Suites</h1>
          <p className="ts-page__subtitle">Group existing test cases for later execution.</p>
        </div>
        <Button
          data-testid="create-test-suite"
          onClick={() => {
            setSelected(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create Test Suite
        </Button>
      </header>
      <p className="ts-page__notice">
        Suite records are temporary frontend data. Replace <code>testSuiteService</code> with the Java Core
        REST API when it is available. Deleting a suite does not delete test cases.
      </p>

      <div className="ts-page__filters">
        <TextField
          id="test-suite-search"
          label="Search"
          placeholder="Search by name or ID"
          value={list.search}
          data-testid="test-suite-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="test-suite-filter-project"
          label="Project"
          value={list.projectId}
          data-testid="test-suite-filter-project"
          options={[
            { value: 'ALL', label: 'All projects' },
            ...list.projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          onChange={(event) => list.setProjectId(event.target.value)}
        />
        <div className="ts-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="test-suite-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && formMode === 'closed' ? (
        <Alert testId="test-suite-action-error">{actionError}</Alert>
      ) : null}
      {list.isLoading ? <p className="ts-page__state">Loading test suites…</p> : null}
      {showEmptyCatalog ? (
        <p className="ts-page__state" data-testid="test-suites-empty">
          No test suites yet. Create the first suite to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="ts-page__state" data-testid="test-suites-no-results">
          No test suites match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="ts-table-wrap">
            <table className="ts-table" data-testid="test-suites-table">
              <thead>
                <tr>
                  <SortableHeader label="ID" column="id" active={list.sortKey === 'id'} direction={list.sortDirection} onClick={() => list.changeSort('id')} />
                  <SortableHeader label="Name" column="name" active={list.sortKey === 'name'} direction={list.sortDirection} onClick={() => list.changeSort('name')} />
                  <th className="ts-table__optional">Description</th>
                  <SortableHeader label="Project" column="project" active={list.sortKey === 'project'} direction={list.sortDirection} onClick={() => list.changeSort('project')} />
                  <SortableHeader label="Test cases" column="testCaseCount" active={list.sortKey === 'testCaseCount'} direction={list.sortDirection} onClick={() => list.changeSort('testCaseCount')} />
                  <SortableHeader className="ts-table__optional" label="Created" column="createdAt" active={list.sortKey === 'createdAt'} direction={list.sortDirection} onClick={() => list.changeSort('createdAt')} />
                  <SortableHeader className="ts-table__optional" label="Updated" column="updatedAt" active={list.sortKey === 'updatedAt'} direction={list.sortDirection} onClick={() => list.changeSort('updatedAt')} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pagedSuites.map((suite) => (
                  <tr key={suite.id} data-testid={`test-suite-row-${suite.id}`}>
                    <td>
                      <Link to={testSuiteDetailsPath(suite.id)}>{suite.id}</Link>
                    </td>
                    <td>
                      <Link to={testSuiteDetailsPath(suite.id)}>{suite.name}</Link>
                    </td>
                    <td className="ts-table__optional">{suite.description || '—'}</td>
                    <td>{suite.projectName}</td>
                    <td>{suite.testCaseCount}</td>
                    <td className="ts-table__optional">{formatIsoDate(suite.createdAt)}</td>
                    <td className="ts-table__optional">{formatIsoDate(suite.updatedAt)}</td>
                    <td>
                      <div className="ts-table__actions">
                        <Link
                          className="ts-table__open"
                          to={testSuiteDetailsPath(suite.id)}
                          data-testid={`open-test-suite-${suite.id}`}
                        >
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          data-testid={`edit-test-suite-${suite.id}`}
                          onClick={() => {
                            setSelected(suite)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          data-testid={`delete-test-suite-${suite.id}`}
                          onClick={() => setToDelete(suite)}
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
          <div className="ts-pagination" data-testid="test-suites-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="test-suites-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="ts-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} suites
              {list.filteredCount > TEST_SUITES_PAGE_SIZE ? ` · ${TEST_SUITES_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="test-suites-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <TestSuiteFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit test suite' : 'Create test suite'}
        suite={formMode === 'edit' ? selected : null}
        projects={list.projects}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete test suite"
        message={`Delete suite “${toDelete?.id ?? ''}”? The suite will be removed. Test cases in it will not be deleted.`}
        confirmLabel="Delete suite"
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
  column: TestSuiteSortKey
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
        className="ts-table__sort"
        data-testid={`sort-test-suite-${column}`}
        onClick={onClick}
      >
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
