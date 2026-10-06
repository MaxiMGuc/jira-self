import { useState, type InputHTMLAttributes } from 'react'
import './PasswordField.css'
import './TextField.css'

type PasswordFieldProps = {
  id: string
  label: string
  error?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordField({ id, label, error, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="ui-password">
        <input
          id={id}
          className={['ui-field__input', 'ui-password__input', error ? 'ui-field__input--error' : '']
            .filter(Boolean)
            .join(' ')}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...props}
        />
        <button
          type="button"
          className="ui-password__toggle"
          data-testid={`${id}-toggle`}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p className="ui-field__error" id={describedBy} data-testid={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
