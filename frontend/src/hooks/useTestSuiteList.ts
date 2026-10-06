import { useCallback, useEffect, useMemo, useState } from 'react'
import { listProjects } from '../services/projectService'
import { listTestCases } from '../services/testCaseService'
import { listTestSuites } from '../services/testSuiteService'
import type { Project } from '../types/project'
import type { TestCase } from '../types/testCase'
import type { TestSuite } from '../types/testSuite'
import type { SortDirection } from '../utils/projectDisplay'
import { compareTestSuites, type TestSuiteSortKey } from '../utils/testSuiteDisplay'

export const TEST_SUITES_PAGE_SIZE = 8

export type TestSuiteListItem = TestSuite & {
  projectName: string
  testCaseCount: number
}

export function useTestSuiteList() {
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('ALL')
  const [sortKey, setSortKey] = useState<TestSuiteSortKey>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextSuites, nextProjects, nextCases] = await Promise.all([
        listTestSuites(),
        listProjects(),
        listTestCases(),
      ])
      setSuites(nextSuites)
      setProjects(nextProjects)
      setTestCases(nextCases)
    } catch {
      setError('Unable to load test suites.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setPage(1)
  }, [search, projectId])

  function changeSort(nextKey: TestSuiteSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'name' || nextKey === 'id' || nextKey === 'project' ? 'asc' : 'desc')
  }

  function resetFilters() {
    setSearch('')
    setProjectId('ALL')
  }

  const namedSuites: TestSuiteListItem[] = useMemo(() => {
    const existingIds = new Set(testCases.map((item) => item.id))
    return suites.map((suite) => ({
      ...suite,
      projectName: projects.find((project) => project.id === suite.projectId)?.name ?? 'Unknown project',
      testCaseCount: suite.testCaseIds.filter((id) => existingIds.has(id)).length,
    }))
  }, [projects, suites, testCases])

  const filteredSuites = useMemo(() => {
    const query = search.trim().toLowerCase()
    return namedSuites.filter((suite) => {
      const matchesSearch =
        query.length === 0 ||
        suite.name.toLowerCase().includes(query) ||
        suite.id.toLowerCase().includes(query)
      return matchesSearch && (projectId === 'ALL' || suite.projectId === projectId)
    })
  }, [namedSuites, projectId, search])

  const sortedSuites = useMemo(() => {
    return [...filteredSuites].sort((left, right) =>
      compareTestSuites(left, right, sortKey, sortDirection),
    )
  }, [filteredSuites, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedSuites.length / TEST_SUITES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * TEST_SUITES_PAGE_SIZE
  const pagedSuites = sortedSuites.slice(pageStart, pageStart + TEST_SUITES_PAGE_SIZE)
  const hasActiveFilters = search.trim().length > 0 || projectId !== 'ALL'

  return {
    suites,
    pagedSuites,
    filteredCount: filteredSuites.length,
    projects,
    isLoading,
    error,
    search,
    setSearch,
    projectId,
    setProjectId,
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
