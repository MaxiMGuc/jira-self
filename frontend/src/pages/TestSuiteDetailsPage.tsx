import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddTestCasesModal } from '../components/testSuites/AddTestCasesModal'
import { TestSuiteFormModal } from '../components/testSuites/TestSuiteFormModal'
import { TestCasePriorityBadge, TestCaseStatusBadge } from '../components/testCases/TestCaseBadges'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { usePageTitle } from '../hooks/usePageTitle'
import { listProjects } from '../services/projectService'
import { listTestCases } from '../services/testCaseService'
import {
  addTestCasesToSuite,
  getTestSuiteById,
  removeTestCaseFromSuite,
  updateTestSuite,
} from '../services/testSuiteService'
import type { Project } from '../types/project'
import type { TestCase } from '../types/testCase'
import type { TestSuite, TestSuiteFormData } from '../types/testSuite'
import { formatIsoDateTime } from '../utils/bugDisplay'
import { projectDetailsPath, ROUTE_PATHS, testCaseDetailsPath } from '../utils/routes'
import './TestSuiteDetailsPage.css'

export function TestSuiteDetailsPage() {
  const { id } = useParams()
  const [suite, setSuite] = useState<TestSuite | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [allCases, setAllCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [toRemove, setToRemove] = useState<TestCase | { id: string } | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  usePageTitle(suite?.id ?? 'Test Suite')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const [nextSuite, nextProjects, nextCases] = await Promise.all([
      getTestSuiteById(id),
      listProjects(),
      listTestCases(),
    ])
    if (!nextSuite) {
      setSuite(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setSuite(nextSuite)
    setProjects(nextProjects)
    setAllCases(nextCases)
    setProject(nextProjects.find((item) => item.id === nextSuite.projectId) ?? null)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(form: TestSuiteFormData) {
    if (!suite) {
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateTestSuite(suite.id, form)
      setIsEditing(false)
      await load()
    } catch {
      setSaveError('Unable to save the test suite.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAdd(testCaseIds: string[]) {
    if (!suite) {
      return
    }
    setIsAdding(true)
    try {
      await addTestCasesToSuite(suite.id, testCaseIds)
      setIsAddOpen(false)
      await load()
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemove() {
    if (!suite || !toRemove) {
      return
    }
    setIsRemoving(true)
    try {
      await removeTestCaseFromSuite(suite.id, toRemove.id)
      setToRemove(null)
      await load()
    } finally {
      setIsRemoving(false)
    }
  }

  if (isLoading) {
    return <p className="ts-details__state">Loading test suite…</p>
  }

  if (notFound || !suite) {
    return (
      <section data-testid="test-suite-not-found">
        <h1 className="ts-details__title">Test suite not found</h1>
        <p className="ts-details__state">This test suite does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.testSuites}>Back to test suites</Link>
        </p>
      </section>
    )
  }

  const projectCases = allCases.filter((item) => item.projectId === suite.projectId)
  const members = suite.testCaseIds.map((testCaseId) => {
    const found = allCases.find((item) => item.id === testCaseId)
    return found ?? { missingId: testCaseId }
  })
  const resolvedCount = members.filter((item) => !('missingId' in item)).length

  return (
    <section className="ts-details" data-testid="test-suite-details">
      <p className="ts-details__crumb">
        <Link to={ROUTE_PATHS.testSuites}>Test Suites</Link>
        {' / '}
        {suite.id}
      </p>
      <header className="ts-details__header">
        <div>
          <p className="ts-details__id">{suite.id}</p>
          <h1 className="ts-details__title">{suite.name}</h1>
          <p className="ts-details__description">{suite.description || 'No description provided.'}</p>
        </div>
        <Button
          variant="ghost"
          data-testid="edit-test-suite-details"
          onClick={() => {
            setSaveError(null)
            setIsEditing(true)
          }}
        >
          Edit
        </Button>
      </header>

      <dl className="ts-details__meta">
        <div>
          <dt>Project</dt>
          <dd>
            {project ? (
              <Link to={projectDetailsPath(project.id)} data-testid="test-suite-project-link">
                {project.name}
              </Link>
            ) : (
              <span data-testid="test-suite-missing-project">Unknown project</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Test cases</dt>
          <dd data-testid="test-suite-case-count">{resolvedCount}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDateTime(suite.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatIsoDateTime(suite.updatedAt)}</dd>
        </div>
      </dl>

      <section className="ts-details__section">
        <div className="ts-details__section-head">
          <div>
            <h2>Test cases in this suite</h2>
            <p className="ts-details__hint">
              These are existing catalog cases grouped for later execution. Removing a case from the suite
              does not delete it.
            </p>
          </div>
          <Button data-testid="open-add-test-cases" onClick={() => setIsAddOpen(true)}>
            Add Test Cases
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="ts-details__empty" data-testid="test-suite-empty-cases">
            <p>No test cases in this suite yet.</p>
            <Button data-testid="empty-add-test-cases" onClick={() => setIsAddOpen(true)}>
              Add Test Cases
            </Button>
          </div>
        ) : (
          <div className="ts-table-wrap">
            <table className="ts-member-table" data-testid="suite-test-cases-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((item) => {
                  if ('missingId' in item) {
                    return (
                      <tr key={item.missingId} data-testid={`missing-suite-case-${item.missingId}`}>
                        <td colSpan={4}>
                          <span className="ts-details__missing">
                            {item.missingId} is no longer in the temporary test case store.
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            data-testid={`remove-missing-case-${item.missingId}`}
                            onClick={() => setToRemove({ id: item.missingId })}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={item.id} data-testid={`suite-case-row-${item.id}`}>
                      <td>
                        <Link to={testCaseDetailsPath(item.id)}>{item.id}</Link>
                      </td>
                      <td>
                        <Link to={testCaseDetailsPath(item.id)}>{item.title}</Link>
                      </td>
                      <td>
                        <TestCaseStatusBadge status={item.status} />
                      </td>
                      <td>
                        <TestCasePriorityBadge priority={item.priority} />
                      </td>
                      <td>
                        <div className="ts-table__actions">
                          <Link
                            className="ts-table__open"
                            to={testCaseDetailsPath(item.id)}
                            data-testid={`open-suite-case-${item.id}`}
                          >
                            Open
                          </Link>
                          <Button
                            variant="danger"
                            data-testid={`remove-suite-case-${item.id}`}
                            onClick={() => setToRemove(item)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TestSuiteFormModal
        isOpen={isEditing}
        title="Edit test suite"
        suite={suite}
        projects={projects}
        isSubmitting={isSaving}
        submitError={saveError}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
      />
      <AddTestCasesModal
        isOpen={isAddOpen}
        projectName={project?.name ?? 'Unknown project'}
        includedIds={suite.testCaseIds}
        candidates={projectCases}
        isSubmitting={isAdding}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
      <ConfirmDialog
        isOpen={Boolean(toRemove)}
        title="Remove from suite"
        message={`Remove “${toRemove?.id ?? ''}” from this suite? The test case itself will not be deleted.`}
        confirmLabel="Remove"
        loadingLabel="Removing…"
        isBusy={isRemoving}
        onCancel={() => setToRemove(null)}
        onConfirm={() => {
          void handleRemove()
        }}
      />
    </section>
  )
}
