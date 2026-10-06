import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSafeRedirectPath } from '../auth/redirect'
import { useAuth } from '../auth/AuthContext'
import { TEMPORARY_FRONTEND_CREDENTIALS } from '../auth/temporaryFrontendAuth'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { PasswordField } from '../components/ui/PasswordField'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { APP_NAME } from '../utils/routes'
import './LoginPage.css'

type FieldErrors = {
  identifier?: string
  password?: string
}

export function LoginPage() {
  usePageTitle('Login')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFieldErrors = validateLoginFields(identifier, password)
    setFieldErrors(nextFieldErrors)
    setFormError(null)

    if (nextFieldErrors.identifier || nextFieldErrors.password) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(identifier, password)
      navigate(getSafeRedirectPath(location.state), { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-page__card">
        <div className="login-page__brand-row">
          <span className="login-page__logo" aria-hidden="true">
            DF
          </span>
          <p className="login-page__brand">{APP_NAME}</p>
        </div>
        <h1 className="login-page__title">Sign in</h1>
        <p className="login-page__hint">
          Bug tracking and test management for QA, developers, and project
          managers.
        </p>
        <p className="login-page__notice">
          Temporary frontend-only sign-in. This is not real authentication and
          will be replaced by the Java Core REST API. Use{' '}
          <strong>{TEMPORARY_FRONTEND_CREDENTIALS.username}</strong> or{' '}
          <strong>{TEMPORARY_FRONTEND_CREDENTIALS.email}</strong> with password{' '}
          <strong>{TEMPORARY_FRONTEND_CREDENTIALS.password}</strong>.
        </p>
        {formError ? <Alert testId="login-error">{formError}</Alert> : null}
        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="identifier"
            name="identifier"
            label="Username or email"
            autoComplete="username"
            value={identifier}
            error={fieldErrors.identifier}
            disabled={isSubmitting}
            data-testid="login-username"
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            error={fieldErrors.password}
            disabled={isSubmitting}
            data-testid="login-password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            className="login-page__submit"
            type="submit"
            loading={isSubmitting}
            loadingLabel="Signing in…"
            data-testid="login-submit"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}

function validateLoginFields(identifier: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!identifier.trim()) {
    errors.identifier = 'Enter your username or email.'
  }
  if (!password) {
    errors.password = 'Enter your password.'
  }
  return errors
}
