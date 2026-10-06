import { useEffect, useMemo, useState } from 'react'
import type { TestCase } from '../../types/testCase'
import { formatTestCasePriority, formatTestCaseStatus } from '../../utils/testCaseDisplay'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'
import './AddTestCasesModal.css'

type AddTestCasesModalProps = {
  isOpen: boolean
  projectName: string
  includedIds: string[]
  candidates: TestCase[]
  isSubmitting: boolean
  onClose: () => void
  onAdd: (testCaseIds: string[]) => Promise<void>
}

export function AddTestCasesModal({
  isOpen,
  projectName,
  includedIds,
  candidates,
  isSubmitting,
  onClose,
  onAdd,
}: AddTestCasesModalProps) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setSearch('')
    setSelectedIds([])
  }, [isOpen])

  const included = useMemo(() => new Set(includedIds), [includedIds])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return candidates.filter((item) => {
      if (query.length === 0) {
        return true
      }
      return item.id.toLowerCase().includes(query) || item.title.toLowerCase().includes(query)
    })
  }, [candidates, search])

  const availableToAdd = filtered.filter((item) => !included.has(item.id))
  const alreadyIncluded = filtered.filter((item) => included.has(item.id))

  async function handleAdd() {
    if (selectedIds.length === 0) {
      return
    }
    await onAdd(selectedIds)
  }

  return (
    <Modal
      title="Add test cases"
      isOpen={isOpen}
      onClose={onClose}
      testId="add-test-cases-modal"
      size="wide"
    >
      <p className="add-cases__hint">
        Only test cases from <strong>{projectName}</strong> can be added. Cases already in the suite are
        listed but cannot be selected again.
      </p>
      <TextField
        id="add-cases-search"
        label="Search"
        placeholder="Search by ID or title"
        value={search}
        data-testid="add-cases-search"
        onChange={(event) => setSearch(event.target.value)}
      />

      {candidates.length === 0 ? (
        <p className="add-cases__empty" data-testid="add-cases-none-in-project">
          This project has no test cases to add.
        </p>
      ) : filtered.length === 0 ? (
        <p className="add-cases__empty" data-testid="add-cases-no-search">
          No test cases match the current search.
        </p>
      ) : availableToAdd.length === 0 && alreadyIncluded.length > 0 ? (
        <p className="add-cases__empty" data-testid="add-cases-all-included">
          All matching test cases for this project are already in the suite.
        </p>
      ) : null}

      {availableToAdd.length > 0 ? (
        <ul className="add-cases__list" data-testid="add-cases-available">
          {availableToAdd.map((item) => {
            const checked = selectedIds.includes(item.id)
            return (
              <li key={item.id}>
                <label className="add-cases__option">
                  <input
                    type="checkbox"
                    checked={checked}
                    data-testid={`add-case-${item.id}`}
                    onChange={() => {
                      setSelectedIds((current) =>
                        checked ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }}
                  />
                  <span>
                    <span className="add-cases__id">{item.id}</span>
                    <span className="add-cases__title">{item.title}</span>
                    <span className="add-cases__meta">
                      {formatTestCaseStatus(item.status)} · {formatTestCasePriority(item.priority)}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}

      {alreadyIncluded.length > 0 ? (
        <div className="add-cases__included">
          <p className="add-cases__included-label">Already in this suite</p>
          <ul className="add-cases__list add-cases__list--included">
            {alreadyIncluded.map((item) => (
              <li key={item.id} className="add-cases__option add-cases__option--disabled">
                <span>
                  <span className="add-cases__id">{item.id}</span>
                  <span className="add-cases__title">{item.title}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="ui-modal-actions">
        <Button variant="ghost" type="button" disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={selectedIds.length === 0}
          loading={isSubmitting}
          loadingLabel="Adding…"
          data-testid="confirm-add-test-cases"
          onClick={() => {
            void handleAdd()
          }}
        >
          Add selected
        </Button>
      </div>
    </Modal>
  )
}
