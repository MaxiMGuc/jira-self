import type { ReactNode } from 'react'
import { useEffect } from 'react'
import './Modal.css'

type ModalProps = {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  testId?: string
  size?: 'default' | 'wide'
}

export function Modal({ title, isOpen, onClose, children, testId, size = 'default' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="ui-modal-overlay" data-testid={testId}>
      <div
        className={`ui-modal${size === 'wide' ? ' ui-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="ui-modal__header">
          <h2 id="modal-title" className="ui-modal__title">
            {title}
          </h2>
          <button type="button" className="ui-modal__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
