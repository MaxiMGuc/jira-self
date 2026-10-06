import { useEffect, useState, type FormEvent } from 'react'
import {
  BUG_DESCRIPTION_MAX_LENGTH,
  BUG_ENVIRONMENT_MAX_LENGTH,
  BUG_PRIORITIES,
  BUG_SEVERITIES,
  BUG_TITLE_MAX_LENGTH,
  type Bug,
  type BugDraft,
  type BugPriority,
  type BugSeverity,
  type Person,
} from '../../types/bug'
import type { Project } from '../../types/project'
import {
  formatBugPriority,
  formatBugSeverity,
  isBugPriority,
  isBugSeverity,
} from '../../utils/bugDisplay'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { TextField } from '../ui/TextField'
import './BugFormModal.css'

type BugFormModalProps = {
  isOpen: boolean
  title: string
  bug: Bug | null
  projects: Project[]
  people: Person[]
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (draft: BugDraft) => Promise<void>
}

type FormErrors = {
  title?: string
  description?: string
  projectId?: string
  priority?: string
  severity?: string
  assigneeId?: string
  environment?: string
}

export function BugFormModal({
  isOpen,
  title,
  bug,
  projects,
  people,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: BugFormModalProps) {
  const [draftTitle, setDraftTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState<BugPriority>('MEDIUM')
  const [severity, setSeverity] = useState<BugSeverity>('MAJOR')
  const [assigneeId, setAssigneeId] = useState('')
  const [environment, setEnvironment] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setDraftTitle(bug?.title ?? '')
    setDescription(bug?.description ?? '')
    setProjectId(bug?.projectId ?? projects[0]?.id ?? '')
    setPriority(bug?.priority ?? 'MEDIUM')
    setSeverity(bug?.severity ?? 'MAJOR')
    setAssigneeId(bug?.assigneeId ?? people[0]?.id ?? '')
    setEnvironment(bug?.environment ?? '')
    setErrors({})
  }, [bug, isOpen, people, projects])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateBugForm({
      title: draftTitle,
      description,
      projectId,
      priority,
      severity,
      assigneeId,
      environment,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      title: draftTitle.trim(),
      description: description.trim(),
      projectId,
      priority,
      severity,
      assigneeId,
      environment: environment.trim(),
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="bug-form-modal">
      {submitError ? <Alert>{submitError}</Alert> : null}
      <form className="bug-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="bug-title"
          label="Title"
          value={draftTitle}
          maxLength={BUG_TITLE_MAX_LENGTH}
          error={errors.title}
          disabled={isSubmitting}
          data-testid="bug-title-input"
          onChange={(event) => setDraftTitle(event.target.value)}
        />
        <TextAreaField
          id="bug-description"
          label="Description"
          value={description}
          maxLength={BUG_DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          disabled={isSubmitting}
          data-testid="bug-description-input"
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          id="bug-project"
          label="Project"
          value={projectId}
          error={errors.projectId}
          disabled={isSubmitting}
          data-testid="bug-project-input"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          onChange={(event) => setProjectId(event.target.value)}
        />
        <div className="bug-form__row">
          <SelectField
            id="bug-priority"
            label="Priority"
            value={priority}
            error={errors.priority}
            disabled={isSubmitting}
            data-testid="bug-priority-input"
            options={BUG_PRIORITIES.map((item) => ({
              value: item,
              label: formatBugPriority(item),
            }))}
            onChange={(event) => {
              if (isBugPriority(event.target.value)) {
                setPriority(event.target.value)
              }
            }}
          />
          <SelectField
            id="bug-severity"
            label="Severity"
            value={severity}
            error={errors.severity}
            disabled={isSubmitting}
            data-testid="bug-severity-input"
            options={BUG_SEVERITIES.map((item) => ({
              value: item,
              label: formatBugSeverity(item),
            }))}
            onChange={(event) => {
              if (isBugSeverity(event.target.value)) {
                setSeverity(event.target.value)
              }
            }}
          />
        </div>
        <SelectField
          id="bug-assignee"
          label="Assignee"
          value={assigneeId}
          error={errors.assigneeId}
          disabled={isSubmitting}
          data-testid="bug-assignee-input"
          options={people.map((person) => ({ value: person.id, label: person.displayName }))}
          onChange={(event) => setAssigneeId(event.target.value)}
        />
        <TextField
          id="bug-environment"
          label="Environment"
          value={environment}
          maxLength={BUG_ENVIRONMENT_MAX_LENGTH}
          error={errors.environment}
          disabled={isSubmitting}
          data-testid="bug-environment-input"
          onChange={(event) => setEnvironment(event.target.value)}
        />
        <p className="bug-form__hint">
          New bugs are created with status OPEN. Status changes use dedicated
          lifecycle actions, not this form.
        </p>
        <div className="ui-modal-actions">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" data-testid="bug-form-submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateBugForm(draft: BugDraft): FormErrors {
  const errors: FormErrors = {}
  if (!draft.title.trim()) {
    errors.title = 'Enter a bug title.'
  } else if (draft.title.trim().length > BUG_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${BUG_TITLE_MAX_LENGTH} characters or fewer.`
  }
  if (!draft.description.trim()) {
    errors.description = 'Enter a description.'
  } else if (draft.description.trim().length > BUG_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${BUG_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }
  if (!draft.projectId) {
    errors.projectId = 'Select a project.'
  }
  if (!isBugPriority(draft.priority)) {
    errors.priority = 'Select a valid priority.'
  }
  if (!isBugSeverity(draft.severity)) {
    errors.severity = 'Select a valid severity.'
  }
  if (!draft.assigneeId) {
    errors.assigneeId = 'Select an assignee.'
  }
  if (draft.environment.trim().length > BUG_ENVIRONMENT_MAX_LENGTH) {
    errors.environment = `Environment must be ${BUG_ENVIRONMENT_MAX_LENGTH} characters or fewer.`
  }
  return errors
}
