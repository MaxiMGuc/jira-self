import { useEffect, useState, type FormEvent } from 'react'
import type { Project } from '../../types/project'
import {
  RELEASE_DESCRIPTION_MAX_LENGTH,
  RELEASE_NAME_MAX_LENGTH,
  type Release,
  type ReleaseFormData,
} from '../../types/release'
import { isValidReleaseDate } from '../../utils/releaseDisplay'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { TextField } from '../ui/TextField'
import './ReleaseFormModal.css'

type ReleaseFormModalProps = {
  isOpen: boolean
  title: string
  release: Release | null
  projects: Project[]
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (form: ReleaseFormData) => Promise<void>
}

type FormErrors = {
  name?: string
  description?: string
  projectId?: string
  releaseDate?: string
}

export function ReleaseFormModal({
  isOpen,
  title,
  release,
  projects,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: ReleaseFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setName(release?.name ?? '')
    setDescription(release?.description ?? '')
    setProjectId(release?.projectId ?? projects[0]?.id ?? '')
    setReleaseDate(release?.releaseDate ?? '')
    setErrors({})
  }, [isOpen, projects, release])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateReleaseForm(name, description, projectId, releaseDate)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      projectId,
      releaseDate,
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="release-form-modal">
      {submitError ? <Alert>{submitError}</Alert> : null}
      <form className="rel-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="release-name"
          label="Name / version"
          value={name}
          maxLength={RELEASE_NAME_MAX_LENGTH}
          error={errors.name}
          data-testid="release-name"
          onChange={(event) => setName(event.target.value)}
        />
        <TextAreaField
          id="release-description"
          label="Description"
          rows={3}
          value={description}
          maxLength={RELEASE_DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          data-testid="release-description"
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          id="release-project"
          label="Project"
          value={projectId}
          error={errors.projectId}
          data-testid="release-project"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          onChange={(event) => setProjectId(event.target.value)}
        />
        <TextField
          id="release-date"
          label="Release date"
          type="date"
          value={releaseDate}
          error={errors.releaseDate}
          data-testid="release-date"
          onChange={(event) => setReleaseDate(event.target.value)}
        />
        {release ? (
          <p className="rel-form__hint">Status is not edited here. Use the lifecycle actions on the details page.</p>
        ) : (
          <p className="rel-form__hint">A new release starts as Planned.</p>
        )}
        <div className="ui-modal-actions">
          <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" data-testid="save-release">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateReleaseForm(
  name: string,
  description: string,
  projectId: string,
  releaseDate: string,
): FormErrors {
  const errors: FormErrors = {}
  const trimmedName = name.trim()
  const trimmedDescription = description.trim()
  if (!trimmedName) {
    errors.name = 'Name / version is required.'
  } else if (trimmedName.length > RELEASE_NAME_MAX_LENGTH) {
    errors.name = `Name / version must be ${RELEASE_NAME_MAX_LENGTH} characters or fewer.`
  }
  if (trimmedDescription.length > RELEASE_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${RELEASE_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }
  if (!projectId) {
    errors.projectId = 'Select a project.'
  }
  if (!releaseDate) {
    errors.releaseDate = 'Release date is required.'
  } else if (!isValidReleaseDate(releaseDate)) {
    errors.releaseDate = 'Enter a valid date.'
  }
  return errors
}
