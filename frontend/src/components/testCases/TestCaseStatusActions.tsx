import { useState } from 'react'
import type { TestCase, TestCaseTransitionAction } from '../../types/testCase'
import { getAllowedTestCaseTransitions, type TestCaseTransition } from '../../utils/testCaseLifecycle'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'

type TestCaseStatusActionsProps = {
  testCase: TestCase
  isBusy: boolean
  onTransition: (action: TestCaseTransitionAction) => Promise<void>
}

export function TestCaseStatusActions({ testCase, isBusy, onTransition }: TestCaseStatusActionsProps) {
  const transitions = getAllowedTestCaseTransitions(testCase.status)
  const [pending, setPending] = useState<TestCaseTransition | null>(null)

  if (transitions.length === 0) {
    return <p className="tc-status-empty">No status actions for an archived test case.</p>
  }

  return (
    <div className="tc-status-actions" data-testid="test-case-status-actions">
      {transitions.map((transition) => (
        <Button
          key={transition.action}
          variant={transition.action === 'ARCHIVE' ? 'danger' : 'primary'}
          disabled={isBusy}
          data-testid={`test-case-transition-${transition.action}`}
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
            ? `Change this test case from ${testCase.status} to ${pending.nextStatus}?`
            : ''
        }
        confirmLabel={pending?.label ?? 'Confirm'}
        confirmVariant={pending?.action === 'ARCHIVE' ? 'danger' : 'primary'}
        loadingLabel="Updating…"
        isBusy={isBusy}
        testId="test-case-transition-confirm"
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
