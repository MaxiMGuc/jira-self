import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TestCasePriorityBadge, TestCaseStatusBadge } from '../components/testCases/TestCaseBadges'
import { TestCaseFormModal } from '../components/testCases/TestCaseFormModal'
import { TestCaseStatusActions } from '../components/testCases/TestCaseStatusActions'
import { Button } from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { getBugById, listBugs, listPeople } from '../services/bugService'
import { listProjects } from '../services/projectService'
import { getTestCaseById, transitionTestCaseStatus, updateTestCase } from '../services/testCaseService'
import { listTestSuitesForTestCase } from '../services/testSuiteService'
import type { Bug, Person } from '../types/bug'
import type { Project } from '../types/project'
import type { TestCase, TestCaseDraft, TestCaseTransitionAction } from '../types/testCase'
import type { TestSuite } from '../types/testSuite'
import { formatIsoDateTime } from '../utils/bugDisplay'
import { bugDetailsPath, projectDetailsPath, ROUTE_PATHS, testSuiteDetailsPath } from '../utils/routes'
import './TestCaseDetailsPage.css'

export function TestCaseDetailsPage() {
  const { id } = useParams()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [relatedBug, setRelatedBug] = useState<Bug | null>(null)
  const [missingRelatedBug, setMissingRelatedBug] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  usePageTitle(testCase?.id ?? 'Test Case')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const [nextCase, nextPeople, nextProjects, nextBugs, nextSuites] = await Promise.all([
      getTestCaseById(id),
      listPeople(),
      listProjects(),
      listBugs(),
      listTestSuitesForTestCase(id),
    ])
    if (!nextCase) {
      setTestCase(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }

    let nextRelated: Bug | null = null
    let relatedMissing = false
    if (nextCase.relatedBugId) {
      nextRelated = await getBugById(nextCase.relatedBugId)
      relatedMissing = nextRelated === null
    }

    setTestCase(nextCase)
    setPeople(nextPeople)
    setProjects(nextProjects)
    setBugs(nextBugs)
    setSuites(nextSuites)
    setProject(nextProjects.find((item) => item.id === nextCase.projectId) ?? null)
    setRelatedBug(nextRelated)
    setMissingRelatedBug(relatedMissing)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTransition(action: TestCaseTransitionAction) {
    if (!testCase) {
      return
    }
    setIsTransitioning(true)
    try {
      await transitionTestCaseStatus(testCase.id, action)
      await load()
    } finally {
      setIsTransitioning(false)
    }
  }

  async function handleSave(draft: TestCaseDraft) {
    if (!testCase) {
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateTestCase(testCase.id, draft)
      setIsEditing(false)
      await load()
    } catch {
      setSaveError('Unable to save the test case.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="tc-details__state">Loading test case…</p>
  }

  if (notFound || !testCase) {
    return (
      <section data-testid="test-case-not-found">
        <h1 className="tc-details__title">Test case not found</h1>
        <p className="tc-details__state">This test case does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.testCases}>Back to test cases</Link>
        </p>
      </section>
    )
  }

  const authorName = people.find((person) => person.id === testCase.authorId)?.displayName ?? 'Unknown'

  return (
    <section className="tc-details" data-testid="test-case-details">
      <p className="tc-details__crumb">
        <Link to={ROUTE_PATHS.testCases}>Test Cases</Link>
        {' / '}
        {testCase.id}
      </p>
      <header className="tc-details__header">
        <div>
          <p className="tc-details__id">{testCase.id}</p>
          <h1 className="tc-details__title">{testCase.title}</h1>
          <p className="tc-details__description">{testCase.description || 'No description provided.'}</p>
        </div>
        <Button
          variant="ghost"
          data-testid="edit-test-case-details"
          onClick={() => {
            setSaveError(null)
            setIsEditing(true)
          }}
        >
          Edit
        </Button>
      </header>

      <dl className="tc-details__meta">
        <div>
          <dt>Project</dt>
          <dd>
            {project ? (
              <Link to={projectDetailsPath(project.id)} data-testid="test-case-project-link">
                {project.name}
              </Link>
            ) : (
              <span data-testid="test-case-missing-project">Unknown project</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <TestCaseStatusBadge status={testCase.status} />
          </dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>
            <TestCasePriorityBadge priority={testCase.priority} />
          </dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{authorName}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDateTime(testCase.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatIsoDateTime(testCase.updatedAt)}</dd>
        </div>
        <div>
          <dt>Related bug</dt>
          <dd>
            {relatedBug ? (
              <Link to={bugDetailsPath(relatedBug.id)} data-testid="test-case-related-bug-link">
                {relatedBug.id}
              </Link>
            ) : missingRelatedBug ? (
              <span data-testid="test-case-missing-bug">Related bug is no longer in the temporary store.</span>
            ) : (
              'None'
            )}
          </dd>
        </div>
      </dl>

      <section className="tc-details__section">
        <h2>Test suites</h2>
        {suites.length === 0 ? (
          <p className="tc-details__hint" data-testid="test-case-no-suites">
            This test case is not in any suite yet.
          </p>
        ) : (
          <ul className="tc-suite-list" data-testid="test-case-suites">
            {suites.map((item) => (
              <li key={item.id}>
                <Link to={testSuiteDetailsPath(item.id)}>
                  {item.id} — {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tc-details__section">
        <h2>Preconditions</h2>
        <p className="tc-details__prose">{testCase.preconditions || 'None listed.'}</p>
      </section>

      <section className="tc-details__section">
        <h2>Change status</h2>
        <p className="tc-details__hint">
          Only the next valid status is offered. The Java Core backend will later enforce this workflow.
        </p>
        <TestCaseStatusActions
          testCase={testCase}
          isBusy={isTransitioning}
          onTransition={handleTransition}
        />
      </section>

      <section className="tc-details__section">
        <h2>Test steps</h2>
        {testCase.steps.length === 0 ? (
          <p className="tc-details__hint">No steps recorded.</p>
        ) : (
          <ol className="tc-steps" data-testid="test-case-steps">
            {testCase.steps.map((step) => (
              <li key={step.stepNumber} className="tc-steps__item">
                <span className="tc-steps__number">{step.stepNumber}</span>
                <div>
                  <p className="tc-steps__action">{step.action}</p>
                  <p className="tc-steps__expected">
                    <span>Expected:</span> {step.expectedResult}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="tc-details__section">
        <h2>Expected result</h2>
        <p className="tc-details__prose">{testCase.expectedResult}</p>
      </section>

      <TestCaseFormModal
        isOpen={isEditing}
        title="Edit test case"
        testCase={testCase}
        projects={projects}
        bugs={bugs}
        isSubmitting={isSaving}
        submitError={saveError}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
      />
    </section>
  )
}
