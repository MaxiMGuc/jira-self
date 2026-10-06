import { useCallback, useEffect, useMemo, useState } from 'react'
import { listBugs, listPeople } from '../services/bugService'
import { listProjects } from '../services/projectService'
import { listTestCases } from '../services/testCaseService'
import type { Bug, Person } from '../types/bug'
import type { Project } from '../types/project'
import type { TestCase, TestCasePriority, TestCaseStatus } from '../types/testCase'
import { compareTestCases, type TestCaseSortKey } from '../utils/testCaseDisplay'
import type { SortDirection } from '../utils/projectDisplay'

export const TEST_CASES_PAGE_SIZE = 8

export type TestCaseListItem = TestCase & {
  projectName: string
  authorName: string
}

export type TestCaseFilters = {
  projectId: string
  priority: string
  status: string
}

const EMPTY_FILTERS: TestCaseFilters = {
  projectId: 'ALL',
  priority: 'ALL',
  status: 'ALL',
}

export function useTestCaseList() {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<TestCaseFilters>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<TestCaseSortKey>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextCases, nextProjects, nextPeople, nextBugs] = await Promise.all([
        listTestCases(),
        listProjects(),
        listPeople(),
        listBugs(),
      ])
      setTestCases(nextCases)
      setProjects(nextProjects)
      setPeople(nextPeople)
      setBugs(nextBugs)
    } catch {
      setError('Unable to load test cases.')
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

  function changeSort(nextKey: TestCaseSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'title' || nextKey === 'id' || nextKey === 'project' ? 'asc' : 'desc')
  }

  function setFilter<K extends keyof TestCaseFilters>(key: K, value: TestCaseFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function resetFilters() {
    setSearch('')
    setFilters(EMPTY_FILTERS)
  }

  const namedCases: TestCaseListItem[] = useMemo(() => {
    return testCases.map((item) => ({
      ...item,
      projectName: projects.find((project) => project.id === item.projectId)?.name ?? 'Unknown project',
      authorName: people.find((person) => person.id === item.authorId)?.displayName ?? 'Unknown',
    }))
  }, [people, projects, testCases])

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase()
    return namedCases.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      return (
        matchesSearch &&
        (filters.projectId === 'ALL' || item.projectId === filters.projectId) &&
        (filters.priority === 'ALL' || item.priority === (filters.priority as TestCasePriority)) &&
        (filters.status === 'ALL' || item.status === (filters.status as TestCaseStatus))
      )
    })
  }, [filters, namedCases, search])

  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((left, right) =>
      compareTestCases(left, right, sortKey, sortDirection),
    )
  }, [filteredCases, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedCases.length / TEST_CASES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * TEST_CASES_PAGE_SIZE
  const pagedCases = sortedCases.slice(pageStart, pageStart + TEST_CASES_PAGE_SIZE)
  const hasActiveFilters =
    search.trim().length > 0 || Object.values(filters).some((value) => value !== 'ALL')

  return {
    testCases,
    pagedCases,
    filteredCount: filteredCases.length,
    projects,
    people,
    bugs,
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
