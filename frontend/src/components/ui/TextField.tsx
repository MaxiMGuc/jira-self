import type { InputHTMLAttributes } from 'react'
import './TextField.css'

type TextFieldProps = {
  id: string
  label: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({ id, label, error, className, ...props }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={['ui-field__input', error ? 'ui-field__input--error' : '', className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p className="ui-field__error" id={describedBy} data-testid={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
