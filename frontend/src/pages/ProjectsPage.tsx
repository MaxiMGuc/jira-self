import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProjectFormModal } from '../components/projects/ProjectFormModal'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField } from '../components/ui/SelectField'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TextField } from '../components/ui/TextField'
import { usePageTitle } from '../hooks/usePageTitle'
import { PROJECTS_PAGE_SIZE, useProjectList } from '../hooks/useProjectList'
import { createProject, deleteProject, updateProject } from '../services/projectService'
import { PROJECT_STATUSES, type Project, type ProjectDraft } from '../types/project'
import { formatIsoDate, formatProjectStatus, isProjectStatus } from '../utils/projectDisplay'
import { projectDetailsPath } from '../utils/routes'
import './ProjectsPage.css'

export function ProjectsPage() {
  usePageTitle('Projects')
  const list = useProjectList()
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleSave(draft: ProjectDraft) {
    setIsSaving(true)
    setActionError(null)
    try {
      if (formMode === 'edit' && selectedProject) {
        await updateProject(selectedProject.id, draft)
      } else {
        await createProject(draft)
        list.setPage(1)
      }
      setFormMode('closed')
      setSelectedProject(null)
      await list.reload()
    } catch {
      setActionError('Unable to save the project.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!projectToDelete) {
      return
    }
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteProject(projectToDelete.id)
      setProjectToDelete(null)
      await list.reload()
    } catch {
      setActionError('Unable to delete the project.')
    } finally {
      setIsDeleting(false)
    }
  }

  const showEmptyCatalog = !list.isLoading && list.projects.length === 0
  const showNoResults =
    !list.isLoading && list.projects.length > 0 && list.filteredCount === 0

  return (
    <section className="projects-page" data-testid="projects-page">
      <header className="projects-page__header">
        <div>
          <h1 className="projects-page__title">Projects</h1>
          <p className="projects-page__subtitle">
            Workspaces for defects, test cases, suites, runs, and releases.
          </p>
        </div>
        <Button
          data-testid="create-project"
          onClick={() => {
            setSelectedProject(null)
            setActionError(null)
            setFormMode('create')
          }}
        >
          Create Project
        </Button>
      </header>
      <p className="projects-page__notice">
        Project records are temporary frontend data. Replace{' '}
        <code>projectService</code> with the Java Core REST API when it is
        available.
      </p>

      <div className="projects-page__toolbar">
        <TextField
          id="project-search"
          label="Search"
          placeholder="Search by name"
          value={list.search}
          data-testid="project-search"
          onChange={(event) => list.setSearch(event.target.value)}
        />
        <SelectField
          id="project-status-filter"
          label="Status"
          value={list.statusFilter}
          data-testid="project-status-filter"
          options={[
            { value: 'ALL', label: 'All statuses' },
            ...PROJECT_STATUSES.map((status) => ({
              value: status,
              label: formatProjectStatus(status),
            })),
          ]}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'ALL' || isProjectStatus(value)) {
              list.setStatusFilter(value)
            }
          }}
        />
      </div>

      {list.error ? <Alert>{list.error}</Alert> : null}
      {actionError ? <Alert testId="project-action-error">{actionError}</Alert> : null}

      {list.isLoading ? <p className="projects-page__state">Loading projects…</p> : null}
      {showEmptyCatalog ? (
        <p className="projects-page__state" data-testid="projects-empty">
          No projects yet. Create the first project to get started.
        </p>
      ) : null}
      {showNoResults ? (
        <p className="projects-page__state" data-testid="projects-no-results">
          No projects match the current search or filter.
        </p>
      ) : null}

      {!list.isLoading && list.filteredCount > 0 ? (
        <>
          <div className="projects-table-wrap">
            <table className="projects-table" data-testid="projects-table">
              <thead>
                <tr>
                  <SortableHeader
                    label="Name"
                    column="name"
                    active={list.sortKey === 'name'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('name')}
                  />
                  <th>Description</th>
                  <SortableHeader
                    label="Status"
                    column="status"
                    active={list.sortKey === 'status'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('status')}
                  />
                  <SortableHeader
                    label="Created"
                    column="createdAt"
                    active={list.sortKey === 'createdAt'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('createdAt')}
                  />
                  <SortableHeader
                    label="Updated"
                    column="updatedAt"
                    active={list.sortKey === 'updatedAt'}
                    direction={list.sortDirection}
                    onClick={() => list.changeSort('updatedAt')}
                  />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.pagedProjects.map((project) => (
                  <tr key={project.id} data-testid={`project-row-${project.id}`}>
                    <td>
                      <Link to={projectDetailsPath(project.id)}>{project.name}</Link>
                    </td>
                    <td className="projects-table__description">{project.description}</td>
                    <td>
                      <StatusBadge status={project.status} />
                    </td>
                    <td>{formatIsoDate(project.createdAt)}</td>
                    <td>{formatIsoDate(project.updatedAt)}</td>
                    <td>
                      <div className="projects-table__actions">
                        <Button
                          variant="ghost"
                          data-testid={`edit-project-${project.id}`}
                          onClick={() => {
                            setSelectedProject(project)
                            setActionError(null)
                            setFormMode('edit')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          data-testid={`delete-project-${project.id}`}
                          onClick={() => setProjectToDelete(project)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="projects-pagination" data-testid="projects-pagination">
            <Button
              variant="ghost"
              disabled={list.page <= 1}
              data-testid="projects-prev-page"
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <p className="projects-pagination__status">
              Page {list.page} of {list.totalPages} · {list.filteredCount} projects
              {list.filteredCount > PROJECTS_PAGE_SIZE ? ` · ${PROJECTS_PAGE_SIZE} per page` : ''}
            </p>
            <Button
              variant="ghost"
              disabled={list.page >= list.totalPages}
              data-testid="projects-next-page"
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}

      <ProjectFormModal
        isOpen={formMode !== 'closed'}
        title={formMode === 'edit' ? 'Edit project' : 'Create project'}
        project={formMode === 'edit' ? selectedProject : null}
        isSubmitting={isSaving}
        submitError={actionError}
        onClose={() => setFormMode('closed')}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete project"
        message={`Delete “${projectToDelete?.name ?? ''}”? This temporary record will be removed from the frontend store.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onCancel={() => setProjectToDelete(null)}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </section>
  )
}

type SortableHeaderProps = {
  label: string
  column: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}

function SortableHeader({ label, column, active, direction, onClick }: SortableHeaderProps) {
  return (
    <th aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="projects-table__sort"
        data-testid={`sort-${column}`}
        onClick={onClick}
      >
        {label}
        {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}
