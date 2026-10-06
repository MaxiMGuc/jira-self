import { useEffect, useState, type FormEvent } from 'react'
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_STATUSES,
  type Project,
  type ProjectDraft,
  type ProjectStatus,
} from '../../types/project'
import { formatProjectStatus, isProjectStatus } from '../../utils/projectDisplay'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { TextField } from '../ui/TextField'
import './ProjectFormModal.css'

type ProjectFormModalProps = {
  isOpen: boolean
  title: string
  project: Project | null
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (draft: ProjectDraft) => Promise<void>
}

type FormErrors = {
  name?: string
  description?: string
  status?: string
}

export function ProjectFormModal({
  isOpen,
  title,
  project,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setName(project?.name ?? '')
    setDescription(project?.description ?? '')
    setStatus(project?.status ?? 'ACTIVE')
    setErrors({})
  }, [isOpen, project])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProjectForm(name, description, status)
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.description || nextErrors.status) {
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="project-form-modal">
      {submitError ? <Alert>{submitError}</Alert> : null}
      <form className="project-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="project-name"
          label="Name"
          value={name}
          maxLength={PROJECT_NAME_MAX_LENGTH}
          error={errors.name}
          disabled={isSubmitting}
          data-testid="project-name-input"
          onChange={(event) => setName(event.target.value)}
        />
        <TextAreaField
          id="project-description"
          label="Description"
          value={description}
          maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          disabled={isSubmitting}
          data-testid="project-description-input"
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          id="project-status"
          label="Status"
          value={status}
          error={errors.status}
          disabled={isSubmitting}
          data-testid="project-status-input"
          options={PROJECT_STATUSES.map((item) => ({
            value: item,
            label: formatProjectStatus(item),
          }))}
          onChange={(event) => {
            if (isProjectStatus(event.target.value)) {
              setStatus(event.target.value)
            }
          }}
        />
        <div className="ui-modal-actions">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Saving…"
            data-testid="project-form-submit"
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateProjectForm(
  name: string,
  description: string,
  status: string,
): FormErrors {
  const errors: FormErrors = {}
  const trimmedName = name.trim()

  if (!trimmedName) {
    errors.name = 'Enter a project name.'
  } else if (trimmedName.length > PROJECT_NAME_MAX_LENGTH) {
    errors.name = `Name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`
  }

  if (description.trim().length > PROJECT_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${PROJECT_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }

  if (!isProjectStatus(status)) {
    errors.status = 'Select a valid status.'
  }

  return errors
}
