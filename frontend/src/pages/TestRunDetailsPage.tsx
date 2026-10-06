import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TestResultStatusBadge, TestRunStatusBadge } from '../components/testRuns/TestRunBadges'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { SelectField } from '../components/ui/SelectField'
import { TextAreaField } from '../components/ui/TextAreaField'
import { usePageTitle } from '../hooks/usePageTitle'
import { listBugs } from '../services/bugService'
import { listProjects } from '../services/projectService'
import {
  completeTestRun,
  getTestRunById,
  startTestRun,
  updateTestRunResults,
} from '../services/testRunService'
import { listTestCases } from '../services/testCaseService'
import { getTestSuiteById } from '../services/testSuiteService'
import type { Bug } from '../types/bug'
import type { Project } from '../types/project'
import type { TestCase } from '../types/testCase'
import {
  TEST_RESULT_STATUSES,
  TEST_RUN_COMMENT_MAX_LENGTH,
  type TestResultStatus,
  type TestRun,
  type TestRunResult,
} from '../types/testRun'
import type { TestSuite } from '../types/testSuite'
import { formatIsoDateTime } from '../utils/bugDisplay'
import {
  bugDetailsPath,
  projectDetailsPath,
  ROUTE_PATHS,
  testCaseDetailsPath,
  testSuiteDetailsPath,
} from '../utils/routes'
import { calculateTestRunCounts, formatPassRate } from '../utils/testRunCounts'
import { formatTestResultStatus } from '../utils/testRunDisplay'
import { canStartTestRun, canUpdateTestRunResults, getCompleteRunBlockReason } from '../utils/testRunLifecycle'
import './TestRunDetailsPage.css'

export function TestRunDetailsPage() {
  const { id } = useParams()
  const [run, setRun] = useState<TestRun | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [suite, setSuite] = useState<TestSuite | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [draft, setDraft] = useState<TestRunResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  usePageTitle(run?.id ?? 'Test Run')

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const [nextRun, nextProjects, nextCases, nextBugs] = await Promise.all([
      getTestRunById(id),
      listProjects(),
      listTestCases(),
      listBugs(),
    ])
    if (!nextRun) {
      setRun(null)
      setNotFound(true)
      setIsLoading(false)
      return
    }
    const nextSuite = await getTestSuiteById(nextRun.testSuiteId)
    setRun(nextRun)
    setDraft(nextRun.results.map((item) => ({ ...item })))
    setProject(nextProjects.find((item) => item.id === nextRun.projectId) ?? null)
    setSuite(nextSuite)
    setTestCases(nextCases)
    setBugs(nextBugs)
    setNotFound(false)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const counts = useMemo(() => calculateTestRunCounts(draft), [draft])
  const completeBlock = run ? getCompleteRunBlockReason(run.status, draft) : null
  const canEditResults = run ? canUpdateTestRunResults(run.status) : false

  function updateResult(testCaseId: string, patch: Partial<TestRunResult>) {
    setDraft((current) =>
      current.map((item) => (item.testCaseId === testCaseId ? { ...item, ...patch } : item)),
    )
    setActionError(null)
  }

  async function handleStart() {
    if (!run) {
      return
    }
    setIsStarting(true)
    setActionError(null)
    try {
      await startTestRun(run.id)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to start the run.')
    } finally {
      setIsStarting(false)
    }
  }

  async function handleSave() {
    if (!run) {
      return
    }
    setIsSaving(true)
    setActionError(null)
    try {
      await updateTestRunResults(run.id, draft)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save results.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleComplete() {
    if (!run) {
      return
    }
    if (completeBlock) {
      setActionError(completeBlock)
      return
    }
    setIsCompleting(true)
    setActionError(null)
    try {
      await completeTestRun(run.id, draft)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to complete the run.')
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return <p className="tr-details__state">Loading test run…</p>
  }

  if (notFound || !run) {
    return (
      <section data-testid="test-run-not-found">
        <h1 className="tr-details__title">Test run not found</h1>
        <p className="tr-details__state">This test run does not exist in the temporary store.</p>
        <p>
          <Link to={ROUTE_PATHS.testRuns}>Back to test runs</Link>
        </p>
      </section>
    )
  }

  const rows = run.testCaseIds.map((testCaseId) => {
    const testCase = testCases.find((item) => item.id === testCaseId) ?? null
    const result = draft.find((item) => item.testCaseId === testCaseId) ?? {
      testCaseId,
      status: 'NOT_RUN' as const,
      comment: '',
    }
    const relatedBug = testCase?.relatedBugId
      ? bugs.find((bug) => bug.id === testCase.relatedBugId) ?? null
      : null
    return { testCaseId, testCase, result, relatedBug }
  })

  return (
    <section className="tr-details" data-testid="test-run-details">
      <p className="tr-details__crumb">
        <Link to={ROUTE_PATHS.testRuns}>Test Runs</Link>
        {' / '}
        {run.id}
      </p>
      <header className="tr-details__header">
        <div>
          <p className="tr-details__id">{run.id}</p>
          <h1 className="tr-details__title">{run.name}</h1>
          <TestRunStatusBadge status={run.status} />
        </div>
        <div className="tr-details__actions">
          {canStartTestRun(run.status) ? (
            <Button data-testid="start-test-run" loading={isStarting} loadingLabel="Starting…" onClick={() => void handleStart()}>
              Start Run
            </Button>
          ) : null}
          {canEditResults ? (
            <>
              <Button
                variant="ghost"
                data-testid="save-test-run-results"
                loading={isSaving}
                loadingLabel="Saving…"
                onClick={() => void handleSave()}
              >
                Save results
              </Button>
              <Button
                data-testid="complete-test-run"
                loading={isCompleting}
                loadingLabel="Completing…"
                onClick={() => void handleComplete()}
              >
                Complete Run
              </Button>
            </>
          ) : null}
        </div>
      </header>
      {run.status === 'COMPLETED' ? (
        <p className="tr-details__hint">Results are locked because this run is completed.</p>
      ) : null}
      {run.status === 'NOT_STARTED' ? (
        <p className="tr-details__hint">Start the run to record Passed, Failed, or Blocked results.</p>
      ) : null}
      {actionError ? <Alert testId="test-run-details-error">{actionError}</Alert> : null}

      <dl className="tr-details__meta">
        <div>
          <dt>Project</dt>
          <dd>
            {project ? (
              <Link to={projectDetailsPath(project.id)} data-testid="test-run-project-link">
                {project.name}
              </Link>
            ) : (
              <span data-testid="test-run-missing-project">Unknown project</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Test suite</dt>
          <dd>
            {suite ? (
              <Link to={testSuiteDetailsPath(suite.id)} data-testid="test-run-suite-link">
                {suite.id} — {suite.name}
              </Link>
            ) : (
              <span data-testid="test-run-missing-suite">Unknown suite</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatIsoDateTime(run.createdAt)}</dd>
        </div>
        <div>
          <dt>Started</dt>
          <dd>{run.startedAt ? formatIsoDateTime(run.startedAt) : '—'}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{run.completedAt ? formatIsoDateTime(run.completedAt) : '—'}</dd>
        </div>
      </dl>

      <section className="tr-summary" data-testid="test-run-summary">
        <h2>Summary</h2>
        <div className="tr-summary__grid">
          <SummaryStat label="Total" value={counts.total} testId="run-total" />
          <SummaryStat label="Passed" value={counts.passed} tone="passed" testId="run-passed" />
          <SummaryStat label="Failed" value={counts.failed} tone="failed" testId="run-failed" />
          <SummaryStat label="Blocked" value={counts.blocked} tone="blocked" testId="run-blocked" />
          <SummaryStat label="Not run" value={counts.notRun} testId="run-not-run" />
          <SummaryStat label="Pass rate" value={formatPassRate(counts.passRate)} testId="run-pass-rate" />
        </div>
        <div className="tr-progress" aria-label="Run progress">
          <ProgressSegment count={counts.passed} total={counts.total} tone="passed" />
          <ProgressSegment count={counts.failed} total={counts.total} tone="failed" />
          <ProgressSegment count={counts.blocked} total={counts.total} tone="blocked" />
          <ProgressSegment count={counts.notRun} total={counts.total} tone="not-run" />
        </div>
        {completeBlock && run.status === 'IN_PROGRESS' ? (
          <p className="tr-details__hint" data-testid="complete-run-hint">
            {completeBlock}
          </p>
        ) : null}
      </section>

      <section className="tr-details__section">
        <h2>Test cases in this run</h2>
        <p className="tr-details__hint">
          Results are recorded here. Open a test case to read its steps. Changing a result does not change the
          catalog case.
        </p>
        {rows.length === 0 ? (
          <p className="tr-details__state" data-testid="test-run-empty-cases">
            This run has no test cases.
          </p>
        ) : (
          <ul className="tr-exec" data-testid="test-run-execution-list">
            {rows.map(({ testCaseId, testCase, result, relatedBug }) => (
              <li key={testCaseId} className="tr-exec__item" data-testid={`run-case-${testCaseId}`}>
                <div className="tr-exec__head">
                  <div>
                    {testCase ? (
                      <>
                        <Link to={testCaseDetailsPath(testCase.id)}>{testCase.id}</Link>
                        <p className="tr-exec__title">
                          <Link to={testCaseDetailsPath(testCase.id)}>{testCase.title}</Link>
                        </p>
                      </>
                    ) : (
                      <p className="tr-details__hint">
                        {testCaseId} is no longer in the temporary test case store.
                      </p>
                    )}
                    {testCase?.relatedBugId ? (
                      <p className="tr-exec__bug">
                        Related bug:{' '}
                        {relatedBug ? (
                          <Link to={bugDetailsPath(relatedBug.id)}>{relatedBug.id}</Link>
                        ) : (
                          <span>{testCase.relatedBugId}</span>
                        )}
                      </p>
                    ) : null}
                  </div>
                  <TestResultStatusBadge status={result.status} />
                </div>
                {canEditResults ? (
                  <>
                    <SelectField
                      id={`result-${testCaseId}`}
                      label="Result"
                      value={result.status}
                      data-testid={`result-select-${testCaseId}`}
                      options={TEST_RESULT_STATUSES.map((status) => ({
                        value: status,
                        label: formatTestResultStatus(status),
                      }))}
                      onChange={(event) =>
                        updateResult(testCaseId, {
                          status: event.target.value as TestResultStatus,
                          comment:
                            event.target.value === 'FAILED' || event.target.value === 'BLOCKED'
                              ? result.comment
                              : '',
                        })
                      }
                    />
                    {result.status === 'FAILED' || result.status === 'BLOCKED' ? (
                      <TextAreaField
                        id={`comment-${testCaseId}`}
                        label="Comment (optional)"
                        rows={2}
                        maxLength={TEST_RUN_COMMENT_MAX_LENGTH}
                        value={result.comment}
                        data-testid={`result-comment-${testCaseId}`}
                        onChange={(event) => updateResult(testCaseId, { comment: event.target.value })}
                      />
                    ) : null}
                  </>
                ) : result.comment ? (
                  <p className="tr-exec__comment">{result.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

function SummaryStat({
  label,
  value,
  tone,
  testId,
}: {
  label: string
  value: string | number
  tone?: 'passed' | 'failed' | 'blocked'
  testId: string
}) {
  return (
    <div className={`tr-stat${tone ? ` tr-stat--${tone}` : ''}`} data-testid={testId}>
      <p className="tr-stat__label">{label}</p>
      <p className="tr-stat__value">{value}</p>
    </div>
  )
}

function ProgressSegment({
  count,
  total,
  tone,
}: {
  count: number
  total: number
  tone: 'passed' | 'failed' | 'blocked' | 'not-run'
}) {
  if (total === 0 || count === 0) {
    return null
  }
  return (
    <span
      className={`tr-progress__seg tr-progress__seg--${tone}`}
      style={{ flexGrow: count }}
      title={`${count}`}
    />
  )
}
