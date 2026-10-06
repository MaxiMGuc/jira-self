import { useEffect, useState, type FormEvent } from 'react'
import type { Project } from '../../types/project'
import {
  TEST_SUITE_DESCRIPTION_MAX_LENGTH,
  TEST_SUITE_NAME_MAX_LENGTH,
  type TestSuite,
  type TestSuiteFormData,
} from '../../types/testSuite'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { TextField } from '../ui/TextField'
import './TestSuiteFormModal.css'

type TestSuiteFormModalProps = {
  isOpen: boolean
  title: string
  suite: TestSuite | null
  projects: Project[]
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (form: TestSuiteFormData) => Promise<void>
}

type FormErrors = {
  name?: string
  description?: string
  projectId?: string
}

export function TestSuiteFormModal({
  isOpen,
  title,
  suite,
  projects,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: TestSuiteFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setName(suite?.name ?? '')
    setDescription(suite?.description ?? '')
    setProjectId(suite?.projectId ?? projects[0]?.id ?? '')
    setErrors({})
  }, [isOpen, projects, suite])

  const projectChanged = Boolean(suite && suite.projectId !== projectId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateSuiteForm(name, description, projectId)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      projectId,
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="test-suite-form-modal">
      {submitError ? <Alert>{submitError}</Alert> : null}
      <form className="ts-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="test-suite-name"
          label="Name"
          value={name}
          maxLength={TEST_SUITE_NAME_MAX_LENGTH}
          error={errors.name}
          data-testid="test-suite-name"
          onChange={(event) => setName(event.target.value)}
        />
        <TextAreaField
          id="test-suite-description"
          label="Description"
          rows={3}
          value={description}
          maxLength={TEST_SUITE_DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          data-testid="test-suite-description"
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          id="test-suite-project"
          label="Project"
          value={projectId}
          error={errors.projectId}
          data-testid="test-suite-project"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          onChange={(event) => setProjectId(event.target.value)}
        />
        {projectChanged ? (
          <p className="ts-form__hint">
            Changing the project keeps only test cases that belong to the new project. Other cases stay
            in the catalog and are removed from this suite.
          </p>
        ) : (
          <p className="ts-form__hint">A new suite starts with no test cases. Add them from the suite details page.</p>
        )}
        <div className="ui-modal-actions">
          <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" data-testid="save-test-suite">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateSuiteForm(name: string, description: string, projectId: string): FormErrors {
  const errors: FormErrors = {}
  const trimmedName = name.trim()
  const trimmedDescription = description.trim()
  if (!trimmedName) {
    errors.name = 'Name is required.'
  } else if (trimmedName.length > TEST_SUITE_NAME_MAX_LENGTH) {
    errors.name = `Name must be ${TEST_SUITE_NAME_MAX_LENGTH} characters or fewer.`
  }
  if (trimmedDescription.length > TEST_SUITE_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${TEST_SUITE_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }
  if (!projectId) {
    errors.projectId = 'Select a project.'
  }
  return errors
}
