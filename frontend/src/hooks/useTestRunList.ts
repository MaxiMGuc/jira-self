import { useCallback, useEffect, useMemo, useState } from 'react'
import { listProjects } from '../services/projectService'
import { listTestRuns } from '../services/testRunService'
import { listTestSuites } from '../services/testSuiteService'
import type { Project } from '../types/project'
import type { TestRunStatus } from '../types/testRun'
import type { TestSuite } from '../types/testSuite'
import type { SortDirection } from '../utils/projectDisplay'
import { calculateTestRunCounts } from '../utils/testRunCounts'
import { compareTestRuns, type NamedTestRun, type TestRunSortKey } from '../utils/testRunDisplay'

export const TEST_RUNS_PAGE_SIZE = 8

export function useTestRunList() {
  const [runs, setRuns] = useState<NamedTestRun[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('ALL')
  const [status, setStatus] = useState<'ALL' | TestRunStatus>('ALL')
  const [sortKey, setSortKey] = useState<TestRunSortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextRuns, nextProjects, nextSuites] = await Promise.all([
        listTestRuns(),
        listProjects(),
        listTestSuites(),
      ])
      setProjects(nextProjects)
      setSuites(nextSuites)
      setRuns(
        nextRuns.map((run) => ({
          ...run,
          projectName: nextProjects.find((project) => project.id === run.projectId)?.name ?? 'Unknown project',
          suiteName: nextSuites.find((suite) => suite.id === run.testSuiteId)?.name ?? 'Unknown suite',
          counts: calculateTestRunCounts(run.results),
        })),
      )
    } catch {
      setError('Unable to load test runs.')
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

  function changeSort(nextKey: TestRunSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'name' || nextKey === 'status' ? 'asc' : 'desc')
  }

  function resetFilters() {
    setSearch('')
    setProjectId('ALL')
    setStatus('ALL')
  }

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase()
    return runs.filter((run) => {
      const matchesSearch =
        query.length === 0 ||
        run.name.toLowerCase().includes(query) ||
        run.id.toLowerCase().includes(query)
      const matchesProject = projectId === 'ALL' || run.projectId === projectId
      const matchesStatus = status === 'ALL' || run.status === status
      return matchesSearch && matchesProject && matchesStatus
    })
  }, [projectId, runs, search, status])

  const sortedRuns = useMemo(() => {
    return [...filteredRuns].sort((left, right) => compareTestRuns(left, right, sortKey, sortDirection))
  }, [filteredRuns, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedRuns.length / TEST_RUNS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * TEST_RUNS_PAGE_SIZE
  const pagedRuns = sortedRuns.slice(pageStart, pageStart + TEST_RUNS_PAGE_SIZE)
  const hasActiveFilters = search.trim().length > 0 || projectId !== 'ALL' || status !== 'ALL'

  return {
    runs,
    pagedRuns,
    filteredCount: filteredRuns.length,
    projects,
    suites,
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
