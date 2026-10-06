import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Project } from '../../types/project'
import { TEST_RUN_NAME_MAX_LENGTH, type TestRunFormData } from '../../types/testRun'
import type { TestSuite } from '../../types/testSuite'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextField } from '../ui/TextField'
import './TestRunFormModal.css'

export type TestRunSuiteOption = {
  suite: TestSuite
  projectName: string
  testCaseCount: number
}

type TestRunFormModalProps = {
  isOpen: boolean
  suites: TestRunSuiteOption[]
  projects: Project[]
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (form: TestRunFormData) => Promise<void>
}

type FormErrors = {
  name?: string
  testSuiteId?: string
  projectId?: string
}

export function TestRunFormModal({
  isOpen,
  suites,
  projects,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: TestRunFormModalProps) {
  const [name, setName] = useState('')
  const [testSuiteId, setTestSuiteId] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setName('')
    setTestSuiteId('')
    setErrors({})
  }, [isOpen])

  const selected = useMemo(
    () => suites.find((item) => item.suite.id === testSuiteId) ?? null,
    [suites, testSuiteId],
  )
  const projectId = selected?.suite.projectId ?? ''
  const projectName =
    selected?.projectName ?? projects.find((project) => project.id === projectId)?.name ?? 'Unknown project'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateRunForm(name, testSuiteId, projectId, selected?.testCaseCount ?? 0)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      name: name.trim(),
      projectId,
      testSuiteId,
    })
  }

  return (
    <Modal title="Create test run" isOpen={isOpen} onClose={onClose} testId="test-run-form-modal">
      {submitError ? <Alert>{submitError}</Alert> : null}
      {suites.length === 0 ? (
        <p className="tr-form__hint" data-testid="test-run-no-suites">
          No test suites are available yet. Create a suite and add test cases first.
        </p>
      ) : null}
      <form className="tr-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="test-run-name"
          label="Name"
          value={name}
          maxLength={TEST_RUN_NAME_MAX_LENGTH}
          error={errors.name}
          data-testid="test-run-name"
          onChange={(event) => setName(event.target.value)}
        />
        <SelectField
          id="test-run-suite"
          label="Test suite"
          value={testSuiteId}
          error={errors.testSuiteId}
          data-testid="test-run-suite"
          options={[
            { value: '', label: 'Select a test suite' },
            ...suites.map((item) => ({
              value: item.suite.id,
              label: `${item.suite.id} — ${item.suite.name} (${item.testCaseCount} test case${
                item.testCaseCount === 1 ? '' : 's'
              })`,
            })),
          ]}
          onChange={(event) => setTestSuiteId(event.target.value)}
        />
        {selected ? (
          <div className="tr-form__suite" data-testid="test-run-suite-summary">
            <p>
              <strong>Project:</strong> {projectName}
            </p>
            <p>
              <strong>Test cases:</strong> {selected.testCaseCount}
            </p>
            {selected.testCaseCount === 0 ? (
              <p className="tr-form__empty" data-testid="test-run-empty-suite">
                This suite has no test cases. Add test cases to the suite before creating a run.
              </p>
            ) : (
              <p className="tr-form__hint">
                The run will include the suite’s current test cases. Cases are referenced by ID, not copied.
              </p>
            )}
          </div>
        ) : (
          <p className="tr-form__hint">Select a suite first. The project is taken from that suite.</p>
        )}
        {errors.projectId ? <p className="tr-form__empty">{errors.projectId}</p> : null}
        <div className="ui-modal-actions">
          <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Creating…" data-testid="save-test-run">
            Create Test Run
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateRunForm(
  name: string,
  testSuiteId: string,
  projectId: string,
  testCaseCount: number,
): FormErrors {
  const errors: FormErrors = {}
  const trimmedName = name.trim()
  if (!trimmedName) {
    errors.name = 'Name is required.'
  } else if (trimmedName.length > TEST_RUN_NAME_MAX_LENGTH) {
    errors.name = `Name must be ${TEST_RUN_NAME_MAX_LENGTH} characters or fewer.`
  }
  if (!testSuiteId) {
    errors.testSuiteId = 'Select a test suite.'
  } else if (testCaseCount === 0) {
    errors.testSuiteId = 'This suite has no test cases. Add test cases to the suite first.'
  }
  if (testSuiteId && !projectId) {
    errors.projectId = 'The selected suite must belong to a project.'
  }
  return errors
}
