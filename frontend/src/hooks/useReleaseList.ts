import { useCallback, useEffect, useMemo, useState } from 'react'
import { listProjects } from '../services/projectService'
import { listReleases } from '../services/releaseService'
import type { Project } from '../types/project'
import type { ReleaseStatus } from '../types/release'
import type { SortDirection } from '../utils/projectDisplay'
import { compareReleases, type NamedRelease, type ReleaseSortKey } from '../utils/releaseDisplay'

export const RELEASES_PAGE_SIZE = 8

export function useReleaseList() {
  const [releases, setReleases] = useState<NamedRelease[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('ALL')
  const [status, setStatus] = useState<'ALL' | ReleaseStatus>('ALL')
  const [sortKey, setSortKey] = useState<ReleaseSortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextReleases, nextProjects] = await Promise.all([listReleases(), listProjects()])
      setProjects(nextProjects)
      setReleases(
        nextReleases.map((release) => ({
          ...release,
          projectName: nextProjects.find((project) => project.id === release.projectId)?.name ?? 'Unknown project',
        })),
      )
    } catch {
      setError('Unable to load releases.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setPage(1)
  }, [search, projectId, status])

  function changeSort(nextKey: ReleaseSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'name' || nextKey === 'project' || nextKey === 'status' ? 'asc' : 'desc')
  }

  function resetFilters() {
    setSearch('')
    setProjectId('ALL')
    setStatus('ALL')
  }

  const filteredReleases = useMemo(() => {
    const query = search.trim().toLowerCase()
    return releases.filter((release) => {
      const matchesSearch =
        query.length === 0 ||
        release.name.toLowerCase().includes(query) ||
        release.id.toLowerCase().includes(query)
      const matchesProject = projectId === 'ALL' || release.projectId === projectId
      const matchesStatus = status === 'ALL' || release.status === status
      return matchesSearch && matchesProject && matchesStatus
    })
  }, [projectId, releases, search, status])

  const sortedReleases = useMemo(() => {
    return [...filteredReleases].sort((left, right) =>
      compareReleases(left, right, sortKey, sortDirection),
    )
  }, [filteredReleases, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedReleases.length / RELEASES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * RELEASES_PAGE_SIZE
  const pagedReleases = sortedReleases.slice(pageStart, pageStart + RELEASES_PAGE_SIZE)
  const hasActiveFilters = search.trim().length > 0 || projectId !== 'ALL' || status !== 'ALL'

  return {
    releases,
    pagedReleases,
    filteredCount: filteredReleases.length,
    projects,
    isLoading,
    error,
    search,
    setSearch,
    projectId,
    setProjectId,
    status,
    setStatus,
    resetFilters,
    hasActiveFilters,
    sortKey,
    sortDirection,
    changeSort,
    page: currentPage,
    totalPages,
    setPage,
    reload,
  }
}
