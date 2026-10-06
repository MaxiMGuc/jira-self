import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonProps = {
  children: ReactNode
  loading?: boolean
  loadingLabel?: string
  variant?: 'primary' | 'ghost' | 'danger'
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  loading = false,
  loadingLabel = 'Please wait…',
  variant = 'primary',
  disabled,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const classes = ['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ')

  return (
    <button className={classes} type={type} disabled={disabled || loading} {...props}>
      {loading ? loadingLabel : children}
    </button>
  )
}
