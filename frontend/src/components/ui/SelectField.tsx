import type { SelectHTMLAttributes } from 'react'
import './TextField.css'

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  id: string
  label: string
  error?: string
  options: SelectOption[]
} & SelectHTMLAttributes<HTMLSelectElement>

export function SelectField({
  id,
  label,
  error,
  options,
  className,
  ...props
}: SelectFieldProps) {
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={['ui-field__input', error ? 'ui-field__input--error' : '', className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="ui-field__error" id={describedBy} data-testid={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
