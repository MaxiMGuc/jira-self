import { useEffect, useState, type FormEvent } from 'react'
import type { Bug } from '../../types/bug'
import type { Project } from '../../types/project'
import {
  TEST_CASE_PRIORITIES,
  TEST_CASE_TEXT_MAX_LENGTH,
  TEST_CASE_TITLE_MAX_LENGTH,
  TEST_STEP_ACTION_MAX_LENGTH,
  TEST_STEP_EXPECTED_MAX_LENGTH,
  type TestCase,
  type TestCaseDraft,
  type TestCasePriority,
  type TestStep,
} from '../../types/testCase'
import { formatTestCasePriority, isTestCasePriority } from '../../utils/testCaseDisplay'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { TextField } from '../ui/TextField'
import './TestCaseFormModal.css'

type TestCaseFormModalProps = {
  isOpen: boolean
  title: string
  testCase: TestCase | null
  projects: Project[]
  bugs: Bug[]
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (draft: TestCaseDraft) => Promise<void>
}

type FormErrors = {
  title?: string
  description?: string
  expectedResult?: string
  projectId?: string
  priority?: string
  steps?: string
}

type EditableStep = TestStep & { key: string }

export function TestCaseFormModal({
  isOpen,
  title,
  testCase,
  projects,
  bugs,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: TestCaseFormModalProps) {
  const [draftTitle, setDraftTitle] = useState('')
  const [description, setDescription] = useState('')
  const [preconditions, setPreconditions] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState<TestCasePriority>('MEDIUM')
  const [relatedBugId, setRelatedBugId] = useState('')
  const [steps, setSteps] = useState<EditableStep[]>([emptyStep(1)])
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setDraftTitle(testCase?.title ?? '')
    setDescription(testCase?.description ?? '')
    setPreconditions(testCase?.preconditions ?? '')
    setExpectedResult(testCase?.expectedResult ?? '')
    setProjectId(testCase?.projectId ?? projects[0]?.id ?? '')
    setPriority(testCase?.priority ?? 'MEDIUM')
    setRelatedBugId(testCase?.relatedBugId ?? '')
    setSteps(
      testCase?.steps.length
        ? testCase.steps.map((step) => ({ ...step, key: `step-${step.stepNumber}` }))
        : [emptyStep(1)],
    )
    setErrors({})
  }, [isOpen, projects, testCase])

  const relatedBugs = bugs.filter((bug) => !projectId || bug.projectId === projectId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateTestCaseForm({
      title: draftTitle,
      description,
      expectedResult,
      projectId,
      priority,
      steps,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      title: draftTitle.trim(),
      description: description.trim(),
      preconditions: preconditions.trim(),
      expectedResult: expectedResult.trim(),
      projectId,
      priority,
      relatedBugId: relatedBugId || null,
      steps: steps.map((step, index) => ({
        stepNumber: index + 1,
        action: step.action,
        expectedResult: step.expectedResult,
      })),
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="test-case-form-modal" size="wide">
      {submitError ? <Alert>{submitError}</Alert> : null}
      <form className="tc-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="test-case-title"
          label="Title"
          value={draftTitle}
          maxLength={TEST_CASE_TITLE_MAX_LENGTH}
          error={errors.title}
          data-testid="test-case-title"
          onChange={(event) => setDraftTitle(event.target.value)}
        />
        <TextAreaField
          id="test-case-description"
          label="Description"
          rows={3}
          value={description}
          maxLength={TEST_CASE_TEXT_MAX_LENGTH}
          error={errors.description}
          data-testid="test-case-description"
          onChange={(event) => setDescription(event.target.value)}
        />
        <TextAreaField
          id="test-case-preconditions"
          label="Preconditions"
          rows={2}
          value={preconditions}
          maxLength={TEST_CASE_TEXT_MAX_LENGTH}
          data-testid="test-case-preconditions"
          onChange={(event) => setPreconditions(event.target.value)}
        />
        <div className="tc-form__row">
          <SelectField
            id="test-case-project"
            label="Project"
            value={projectId}
            error={errors.projectId}
            data-testid="test-case-project"
            options={projects.map((project) => ({ value: project.id, label: project.name }))}
            onChange={(event) => {
              const nextProjectId = event.target.value
              setProjectId(nextProjectId)
              const stillValid = bugs.some(
                (bug) => bug.id === relatedBugId && bug.projectId === nextProjectId,
              )
              if (!stillValid) {
                setRelatedBugId('')
              }
            }}
          />
          <SelectField
            id="test-case-priority"
            label="Priority"
            value={priority}
            error={errors.priority}
            data-testid="test-case-priority"
            options={TEST_CASE_PRIORITIES.map((item) => ({
              value: item,
              label: formatTestCasePriority(item),
            }))}
            onChange={(event) => {
              if (isTestCasePriority(event.target.value)) {
                setPriority(event.target.value)
              }
            }}
          />
        </div>
        <SelectField
          id="test-case-related-bug"
          label="Related bug"
          value={relatedBugId}
          data-testid="test-case-related-bug"
          options={[
            { value: '', label: 'None' },
            ...relatedBugs.map((bug) => ({ value: bug.id, label: `${bug.id} — ${bug.title}` })),
          ]}
          onChange={(event) => setRelatedBugId(event.target.value)}
        />
        <p className="tc-form__hint">New test cases start as Draft. Status is changed with dedicated actions, not this form.</p>
        <fieldset className="tc-steps-editor">
          <legend>Test steps</legend>
          {errors.steps ? (
            <p className="ui-field__error" data-testid="test-case-steps-error">
              {errors.steps}
            </p>
          ) : null}
          {steps.map((step, index) => (
            <div className="tc-steps-editor__item" key={step.key} data-testid={`test-step-${index + 1}`}>
              <div className="tc-steps-editor__head">
                <span className="tc-steps-editor__number">Step {index + 1}</span>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={steps.length === 1}
                  data-testid={`remove-test-step-${index + 1}`}
                  onClick={() => setSteps((current) => current.filter((item) => item.key !== step.key))}
                >
                  Remove
                </Button>
              </div>
              <TextAreaField
                id={`test-step-action-${index}`}
                label="Action"
                rows={2}
                value={step.action}
                maxLength={TEST_STEP_ACTION_MAX_LENGTH}
                data-testid={`test-step-action-${index + 1}`}
                onChange={(event) => updateStep(index, 'action', event.target.value)}
              />
              <TextAreaField
                id={`test-step-expected-${index}`}
                label="Expected result"
                rows={2}
                value={step.expectedResult}
                maxLength={TEST_STEP_EXPECTED_MAX_LENGTH}
                data-testid={`test-step-expected-${index + 1}`}
                onChange={(event) => updateStep(index, 'expectedResult', event.target.value)}
              />
            </div>
          ))}
          <Button
            variant="ghost"
            type="button"
            data-testid="add-test-step"
            onClick={() => setSteps((current) => [...current, emptyStep(current.length + 1)])}
          >
            Add step
          </Button>
        </fieldset>
        <TextAreaField
          id="test-case-expected"
          label="Expected result"
          rows={2}
          value={expectedResult}
          maxLength={TEST_CASE_TEXT_MAX_LENGTH}
          error={errors.expectedResult}
          data-testid="test-case-expected"
          onChange={(event) => setExpectedResult(event.target.value)}
        />
        <div className="ui-modal-actions">
          <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" data-testid="save-test-case">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )

  function updateStep(index: number, field: 'action' | 'expectedResult', value: string) {
    setSteps((current) =>
      current.map((step, stepIndex) => (stepIndex === index ? { ...step, [field]: value } : step)),
    )
  }
}

function emptyStep(stepNumber: number): EditableStep {
  return {
    key: `new-${stepNumber}-${Math.random().toString(36).slice(2, 8)}`,
    stepNumber,
    action: '',
    expectedResult: '',
  }
}

function validateTestCaseForm(values: {
  title: string
  description: string
  expectedResult: string
  projectId: string
  priority: string
  steps: EditableStep[]
}): FormErrors {
  const errors: FormErrors = {}
  const title = values.title.trim()
  const description = values.description.trim()
  const expectedResult = values.expectedResult.trim()
  const completeSteps = values.steps.filter(
    (step) => step.action.trim().length > 0 && step.expectedResult.trim().length > 0,
  )
  const incompleteSteps = values.steps.filter((step) => {
    const action = step.action.trim()
    const stepExpected = step.expectedResult.trim()
    return (action.length > 0 && stepExpected.length === 0) || (action.length === 0 && stepExpected.length > 0)
  })

  if (!title) {
    errors.title = 'Title is required.'
  } else if (title.length > TEST_CASE_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TEST_CASE_TITLE_MAX_LENGTH} characters or fewer.`
  }

  if (!values.projectId) {
    errors.projectId = 'Select a project.'
  }

  if (!isTestCasePriority(values.priority)) {
    errors.priority = 'Select a valid priority.'
  }

  if (!expectedResult) {
    errors.expectedResult = 'Expected result is required.'
  } else if (expectedResult.length > TEST_CASE_TEXT_MAX_LENGTH) {
    errors.expectedResult = `Expected result must be ${TEST_CASE_TEXT_MAX_LENGTH} characters or fewer.`
  }

  if (description.length > TEST_CASE_TEXT_MAX_LENGTH) {
    errors.description = `Description must be ${TEST_CASE_TEXT_MAX_LENGTH} characters or fewer.`
  }

  if (!description && completeSteps.length === 0) {
    errors.description = 'Enter a description or at least one complete test step.'
    errors.steps = 'Enter a description or at least one complete test step.'
  }

  if (incompleteSteps.length > 0) {
    errors.steps = 'Each step needs both an action and an expected result, or leave the step empty.'
  }

  return errors
}
