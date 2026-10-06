import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TestRunFormModal, type TestRunSuiteOption } from '../components/testRuns/TestRunFormModal'
import { TestRunStatusBadge } from '../components/testRuns/TestRunBadges'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { TEST_RUNS_PAGE_SIZE, useTestRunList } from '../hooks/useTestRunList'
import { createTestRun, deleteTestRun } from '../services/testRunService'
import { listTestCases } from '../services/testCaseService'
import type { TestRunFormData, TestRunStatus } from '../types/testRun'
import { TEST_RUN_STATUSES } from '../types/testRun'
import { formatIsoDate } from '../utils/projectDisplay'
import { testRunDetailsPath } from '../utils/routes'
import { formatTestRunStatus, type TestRunSortKey } from '../utils/testRunDisplay'
import './TestRunsPage.css'

export function TestRunsPage() {
  usePageTitle('Test Runs')
  const list = useTestRunList()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [suiteOptions, setSuiteOptions] = useState<TestRunSuiteOption[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const showEmptyCatalog = !list.isLoading && list.runs.length === 0
  const showNoResults = !list.isLoading && list.runs.length > 0 && list.filteredCount === 0

  async function openCreate() {
    setActionError(null)
    const cases = await listTestCases()
    const existingIds = new Set(cases.map((item) => item.id))
    setSuiteOptions(
      list.suites.map((suite) => ({
        suite,
        projectName: list.projects.find((project) => project.id === suite.projectId)?.name ?? 'Unknown project',
        testCaseCount: suite.testCaseIds.filter((id) => existingIds.has(id)).length,
      })),
    )
    setIsCreateOpen(true)
  }

  async function handleSave(form: TestRunFormData) {
    setIsSaving(true)
    setActionError(null)
    try {
      await createTestRun(form)
      setIsCreateOpen(false)
      list.setPage(1)
      await list.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to create the test run.')
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
      await deleteTestRun(toDelete.id)
      setToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the test run.')
    } finally {
      setIsDeleting(false)
    }
  }

  const statusOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All statuses' },
      ...TEST_RUN_STATUSES.map((value) => ({ value, label: formatTestRunStatus(value) })),
    ],
    [],
  )

  return (
    <section className="tr-page" data-testid="test-runs-page">
      <header className="tr-page__header">
        <div>
          <h1 className="tr-page__title">Test Runs</h1>
          <p className="tr-page__subtitle">Execute a test suite and record simple results.</p>
        </div>
        <Button data-testid="create-test-run" onClick={() => void openCreate()}>
          Create Test Run
        </Button>
      </header>
      <p className="tr-page__notice">
        Run records are temporary frontend data. Replace <code>testRunService</code> with the Java Core REST
        API when it is available. Deleting a run does not delete suites, test cases, projects, or bugs.
      </p>

      <div className="tr-page__filters">
        <TextField
          id="test-run-search"
          label="Search"
          placeholder="Search by name or ID"
          value={list.search}
          data-testid="test-run-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="test-run-filter-project"
          label="Project"
          value={list.projectId}
          data-testid="test-run-filter-project"
          options={[
            { value: 'ALL', label: 'All projects' },
            ...list.projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          onChange={(event) => list.setProjectId(event.target.value)}
        />
        <SelectField
          id="test-run-filter-status"
          label="Status"
          value={list.status}
          data-testid="test-run-filter-status"
          options={statusOptions}
          onChange={(event) => list.setStatus(event.target.value as 'ALL' | TestRunStatus)}
        />
        <div className="tr-page__reset">
          <Button
            variant="ghost"
            disabled={!list.hasActiveFilters}
            data-testid="test-run-filters-reset"
            onClick={() => list.resetFilters()}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError && !isCreateOpen ? <Alert testId="test-run-action-error">{actionError}</Alert> : null}
      {list.isLoading ? <p className="tr-page__state">Loading test runs…</p> : null}
      {showEmptyCatalog ? (
        <p className="tr-page__state" data-testid="test-runs-empty">
          No test runs yet. Create a run from a suite that already has test cases.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="tr-page__state" data-testid="test-runs-no-results">
          No test runs match the current search or filters.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="tr-table-wrap">
            <table className="tr-table" data-testid="test-runs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <SortableHeader
                    label="Name"
                    column="name"
                    active={list.sortKey === 'name'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('name')}
                  />
                  <th>Project</th>
                  <th>Suite</th>
                  <SortableHeader
                    label="Status"
                    column="status"
                    active={list.sortKey === 'status'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('status')}
                  />
                  <SortableHeader
                    className="tr-table__num"
                    label="Total"
                    column="total"
                    active={list.sortKey === 'total'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('total')}
                  />
                  <th className="tr-table__num">Passed</th>
                  <th className="tr-table__num">Failed</th>
                  <th className="tr-table__optional tr-table__num">Blocked</th>
                  <th className="tr-table__optional tr-table__num">Not run</th>
                  <SortableHeader
                    className="tr-table__optional"
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
                {list.pagedRuns.map((run) => (
                  <tr key={run.id} data-testid={`test-run-row-${run.id}`}>
                    <td>
                      <Link to={testRunDetailsPath(run.id)}>{run.id}</Link>
                    </td>
                    <td>
                      <Link to={testRunDetailsPath(run.id)}>{run.name}</Link>
                    </td>
                    <td>{run.projectName}</td>
                    <td>{run.suiteName}</td>
                    <td>
                      <TestRunStatusBadge status={run.status} />
                    </td>
                    <td className="tr-table__num">{run.counts.total}</td>
                    <td className="tr-table__num">{run.counts.passed}</td>
                    <td className="tr-table__num">{run.counts.failed}</td>
                    <td className="tr-table__optional tr-table__num">{run.counts.blocked}</td>
                    <td className="tr-table__optional tr-table__num">{run.counts.notRun}</td>
                    <td className="tr-table__optional">{formatIsoDate(run.createdAt)}</td>
                    <td>
                      <div className="tr-table__actions">
                        <Link
                          className="tr-table__open"
                          to={testRunDetailsPath(run.id)}
                          data-testid={`open-test-run-${run.id}`}
                        >
                          Open
                        </Link>
                        <Button
                          variant="danger"
                          data-testid={`delete-test-run-${run.id}`}
                          onClick={() => setToDelete({ id: run.id, name: run.name })}
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
          <div className="tr-pagination" data-testid="test-runs-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="test-runs-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="tr-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} runs
              {list.filteredCount > TEST_RUNS_PAGE_SIZE ? ` · ${TEST_RUNS_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="test-runs-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <TestRunFormModal
        isOpen={isCreateOpen}
        suites={suiteOptions}
        projects={list.projects}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete test run"
        message={`Delete run “${toDelete?.id ?? ''}”? The run and its results will be removed. The suite, test cases, project, and bugs will not be deleted.`}
        confirmLabel="Delete run"
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
  column: TestRunSortKey
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
        className="tr-table__sort"
        data-testid={`sort-test-run-${column}`}
        onClick={onClick}
      >
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
