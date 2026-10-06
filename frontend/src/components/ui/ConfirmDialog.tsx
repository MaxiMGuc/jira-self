import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  isBusy?: boolean
  confirmVariant?: 'primary' | 'danger'
  loadingLabel?: string
  testId?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  isBusy = false,
  confirmVariant = 'danger',
  loadingLabel = 'Deleting…',
  testId = 'confirm-dialog',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onCancel} testId={testId}>
      <p className="ui-confirm__message">{message}</p>
      <div className="ui-modal-actions">
        <Button variant="ghost" disabled={isBusy} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          loading={isBusy}
          loadingLabel={loadingLabel}
          data-testid="confirm-action"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
