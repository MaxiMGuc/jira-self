import { useCallback, useEffect, useMemo, useState } from 'react'
import { listProjects } from '../services/projectService'
import type { Project, ProjectStatus } from '../types/project'
import {
  compareProjects,
  type ProjectSortKey,
  type SortDirection,
} from '../utils/projectDisplay'

export const PROJECTS_PAGE_SIZE = 5

export type StatusFilter = 'ALL' | ProjectStatus

export function useProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortKey, setSortKey] = useState<ProjectSortKey>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const next = await listProjects()
      setProjects(next)
    } catch {
      setError('Unable to load projects.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  function changeSort(nextKey: ProjectSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'name' || nextKey === 'status' ? 'asc' : 'desc')
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesName = project.name.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter
      return matchesName && matchesStatus
    })
  }, [projects, search, statusFilter])

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((left, right) =>
      compareProjects(left, right, sortKey, sortDirection),
    )
  }, [filteredProjects, sortKey, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PROJECTS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PROJECTS_PAGE_SIZE
  const pagedProjects = sortedProjects.slice(pageStart, pageStart + PROJECTS_PAGE_SIZE)

  return {
    projects,
    pagedProjects,
    filteredCount: filteredProjects.length,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDirection,
    changeSort,
    page: currentPage,
    totalPages,
    setPage,
    reload,
  }
}
