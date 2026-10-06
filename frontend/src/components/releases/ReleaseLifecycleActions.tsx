import { useState } from 'react'
import type { Release, ReleaseTransitionAction } from '../../types/release'
import { getAllowedReleaseTransitions, type ReleaseTransition } from '../../utils/releaseLifecycle'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import './ReleaseLifecycleActions.css'

type ReleaseLifecycleActionsProps = {
  release: Release
  isBusy: boolean
  onTransition: (action: ReleaseTransitionAction) => Promise<void>
}

export function ReleaseLifecycleActions({ release, isBusy, onTransition }: ReleaseLifecycleActionsProps) {
  const transitions = getAllowedReleaseTransitions(release.status)
  const [pending, setPending] = useState<ReleaseTransition | null>(null)

  if (transitions.length === 0) {
    return (
      <p className="rel-lifecycle__empty" data-testid="release-lifecycle-empty">
        {release.status === 'RELEASED'
          ? 'This release is complete. No further status changes are available.'
          : 'This release is cancelled. No further status changes are available.'}
      </p>
    )
  }

  return (
    <div className="rel-lifecycle" data-testid="release-lifecycle">
      {transitions.map((transition) => (
        <Button
          key={transition.action}
          variant={transition.action === 'CANCEL' ? 'danger' : 'primary'}
          disabled={isBusy}
          data-testid={`release-transition-${transition.action}`}
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
        title={pending?.action === 'CANCEL' ? 'Cancel release' : 'Mark released'}
        message={
          pending?.action === 'CANCEL'
            ? `Cancel “${release.id}”? Cancelled releases cannot be restarted from the UI.`
            : `Mark “${release.id}” as released? This cannot be undone from the UI.`
        }
        confirmLabel={pending?.label ?? 'Confirm'}
        confirmVariant={pending?.action === 'CANCEL' ? 'danger' : 'primary'}
        loadingLabel="Updating…"
        isBusy={isBusy}
        testId="release-transition-confirm"
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
