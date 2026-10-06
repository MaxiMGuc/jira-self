import type { TextareaHTMLAttributes } from 'react'
import './TextField.css'

type TextAreaFieldProps = {
  id: string
  label: string
  error?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaField({ id, label, error, className, ...props }: TextAreaFieldProps) {
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={['ui-field__input', 'ui-field__textarea', error ? 'ui-field__input--error' : '', className]
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
