import { useEffect, useState, type FormEvent } from 'react'
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FULL_NAME_MAX_LENGTH,
  USER_ROLES,
  USER_STATUSES,
  USER_USERNAME_MAX_LENGTH,
  type User,
  type UserFormData,
  type UserRole,
  type UserStatus,
} from '../../types/user'
import { formatUserRole, formatUserStatus, isValidUserEmail } from '../../utils/userDisplay'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'
import { TextField } from '../ui/TextField'
import './UserFormModal.css'

type UserFormModalProps = {
  isOpen: boolean
  title: string
  user: User | null
  isSubmitting: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (form: UserFormData) => Promise<void>
}

type FormErrors = {
  username?: string
  fullName?: string
  email?: string
  role?: string
}

export function UserFormModal({
  isOpen,
  title,
  user,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('QA')
  const [status, setStatus] = useState<UserStatus>('ACTIVE')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setUsername(user?.username ?? '')
    setFullName(user?.fullName ?? '')
    setEmail(user?.email ?? '')
    setRole(user?.role ?? 'QA')
    setStatus(user?.status ?? 'ACTIVE')
    setErrors({})
  }, [isOpen, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateUserForm(username, fullName, email, role, Boolean(user))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    await onSubmit({
      username: username.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      status,
    })
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} testId="user-form-modal">
      {submitError ? <Alert testId="user-form-error">{submitError}</Alert> : null}
      <form className="usr-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="user-username"
          label="Username"
          value={username}
          maxLength={USER_USERNAME_MAX_LENGTH}
          error={errors.username}
          data-testid="user-username"
          disabled={Boolean(user)}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          id="user-full-name"
          label="Full name"
          value={fullName}
          maxLength={USER_FULL_NAME_MAX_LENGTH}
          error={errors.fullName}
          data-testid="user-full-name"
          onChange={(event) => setFullName(event.target.value)}
        />
        <TextField
          id="user-email"
          label="Email"
          type="email"
          value={email}
          maxLength={USER_EMAIL_MAX_LENGTH}
          error={errors.email}
          data-testid="user-email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <SelectField
          id="user-role"
          label="Role"
          value={role}
          error={errors.role}
          data-testid="user-role"
          options={USER_ROLES.map((value) => ({ value, label: formatUserRole(value) }))}
          onChange={(event) => setRole(event.target.value as UserRole)}
        />
        <SelectField
          id="user-status"
          label="Status"
          value={status}
          data-testid="user-status"
          options={USER_STATUSES.map((value) => ({ value, label: formatUserStatus(value) }))}
          onChange={(event) => setStatus(event.target.value as UserStatus)}
        />
        {user ? (
          <p className="usr-form__hint">Username cannot be changed after creation. Passwords are not edited here.</p>
        ) : (
          <p className="usr-form__hint">
            New accounts default to Active. Passwords will be handled by the Java Core backend later. This form does
            not store or display passwords.
          </p>
        )}
        <div className="ui-modal-actions">
          <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" data-testid="save-user">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function validateUserForm(
  username: string,
  fullName: string,
  email: string,
  role: string,
  isEdit: boolean,
): FormErrors {
  const errors: FormErrors = {}
  const trimmedUsername = username.trim()
  const trimmedName = fullName.trim()
  const trimmedEmail = email.trim()
  if (!isEdit) {
    if (!trimmedUsername) {
      errors.username = 'Username is required.'
    } else if (trimmedUsername.length > USER_USERNAME_MAX_LENGTH) {
      errors.username = `Username must be ${USER_USERNAME_MAX_LENGTH} characters or fewer.`
    }
  }
  if (!trimmedName) {
    errors.fullName = 'Full name is required.'
  } else if (trimmedName.length > USER_FULL_NAME_MAX_LENGTH) {
    errors.fullName = `Full name must be ${USER_FULL_NAME_MAX_LENGTH} characters or fewer.`
  }
  if (!trimmedEmail) {
    errors.email = 'Email is required.'
  } else if (!isValidUserEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email address.'
  } else if (trimmedEmail.length > USER_EMAIL_MAX_LENGTH) {
    errors.email = `Email must be ${USER_EMAIL_MAX_LENGTH} characters or fewer.`
  }
  if (!role) {
    errors.role = 'Role is required.'
  }
  return errors
}
