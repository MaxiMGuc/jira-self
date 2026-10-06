import { useState } from 'react'
import type { Bug, BugTransitionAction } from '../../types/bug'
import { getAllowedBugTransitions, type BugTransition } from '../../utils/bugLifecycle'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import './BugLifecycleActions.css'

type BugLifecycleActionsProps = {
  bug: Bug
  isBusy: boolean
  onTransition: (action: BugTransitionAction) => Promise<void>
}

export function BugLifecycleActions({ bug, isBusy, onTransition }: BugLifecycleActionsProps) {
  const transitions = getAllowedBugTransitions(bug.status)
  const [pending, setPending] = useState<BugTransition | null>(null)

  if (transitions.length === 0) {
    return <p className="bug-lifecycle__empty">No lifecycle actions for a closed bug.</p>
  }

  return (
    <div className="bug-lifecycle" data-testid="bug-lifecycle">
      {transitions.map((transition) => (
        <Button
          key={transition.action}
          variant={transition.action === 'REOPEN' || transition.action === 'CLOSE' ? 'danger' : 'primary'}
          disabled={isBusy}
          data-testid={`bug-transition-${transition.action}`}
          onClick={() => {
            if (transition.requiresConfirmation) {
              setPending(transition)
              return
            }
            void onTransition(transition.action)
          }}
        >
          {transition.label}
        </Button>
      ))}
      <ConfirmDialog
        isOpen={Boolean(pending)}
        title="Change status"
        message={
          pending
            ? `Change this bug from ${bug.status.replaceAll('_', ' ')} to ${pending.nextStatus.replaceAll('_', ' ')}?`
            : ''
        }
        confirmLabel={pending?.label ?? 'Confirm'}
        confirmVariant={pending?.action === 'CLOSE' || pending?.action === 'REOPEN' ? 'danger' : 'primary'}
        loadingLabel="Updating…"
        isBusy={isBusy}
        testId="bug-transition-confirm"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) {
            return
          }
          const action = pending.action
          setPending(null)
          void onTransition(action)
        }}
      />
    </div>
  )
}
