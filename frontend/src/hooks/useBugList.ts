import { useCallback, useEffect, useMemo, useState } from 'react'
import { listBugs, listPeople } from '../services/bugService'
import { listProjects } from '../services/projectService'
import type { Bug, BugPriority, BugSeverity, BugStatus, Person } from '../types/bug'
import type { Project } from '../types/project'
import { compareBugs, type BugSortKey } from '../utils/bugDisplay'
import type { SortDirection } from '../utils/projectDisplay'

export const BUGS_PAGE_SIZE = 8

export type BugListItem = Bug & {
  projectName: string
  assigneeName: string
  reporterName: string
}

export type BugFilters = {
  projectId: string
  status: string
  priority: string
  severity: string
  assigneeId: string
}

const EMPTY_FILTERS: BugFilters = {
  projectId: 'ALL',
  status: 'ALL',
  priority: 'ALL',
  severity: 'ALL',
  assigneeId: 'ALL',
}

export function useBugList() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<BugFilters>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<BugSortKey>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextBugs, nextProjects, nextPeople] = await Promise.all([
        listBugs(),
        listProjects(),
        listPeople(),
      ])
      setBugs(nextBugs)
      setProjects(nextProjects)
      setPeople(nextPeople)
    } catch {
      setError('Unable to load bugs.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setPage(1)
  }, [search, filters])

  function changeSort(nextKey: BugSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'title' || nextKey === 'id' ? 'asc' : 'desc')
  }

  function setFilter<K extends keyof BugFilters>(key: K, value: BugFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function resetFilters() {
    setSearch('')
    setFilters(EMPTY_FILTERS)
  }

  const namedBugs: BugListItem[] = useMemo(() => {
    return bugs.map((bug) => ({
      ...bug,
      projectName: projects.find((project) => project.id === bug.projectId)?.name ?? 'Unknown project',
      assigneeName: people.find((person) => person.id === bug.assigneeId)?.displayName ?? 'Unassigned',
      reporterName: people.find((person) => person.id === bug.reporterId)?.displayName ?? 'Unknown',
    }))
  }, [bugs, people, projects])

  const filteredBugs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return namedBugs.filter((bug) => {
      const matchesSearch =
        query.length === 0 ||
        bug.title.toLowerCase().includes(query) ||
        bug.id.toLowerCase().includes(query)
      return (
        matchesSearch &&
        (filters.projectId === 'ALL' || bug.projectId === filters.projectId) &&
        (filters.status === 'ALL' || bug.status === (filters.status as BugStatus)) &&
        (filters.priority === 'ALL' || bug.priority === (filters.priority as BugPriority)) &&
        (filters.severity === 'ALL' || bug.severity === (filters.severity as BugSeverity)) &&
        (filters.assigneeId === 'ALL' || bug.assigneeId === filters.assigneeId)
      )
    })
  }, [filters, namedBugs, search])

  const sortedBugs = useMemo(() => {
    return [...filteredBugs].sort((left, right) => compareBugs(left, right, sortKey, sortDirection))
  }, [filteredBugs, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedBugs.length / BUGS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * BUGS_PAGE_SIZE
  const pagedBugs = sortedBugs.slice(pageStart, pageStart + BUGS_PAGE_SIZE)
  const hasActiveFilters =
    search.trim().length > 0 || Object.values(filters).some((value) => value !== 'ALL')

  return {
    bugs,
    pagedBugs,
    filteredCount: filteredBugs.length,
    projects,
    people,
    isLoading,
    error,
    search,
    setSearch,
    filters,
    setFilter,
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
