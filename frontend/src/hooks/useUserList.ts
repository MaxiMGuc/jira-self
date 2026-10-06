import { useCallback, useEffect, useMemo, useState } from 'react'
import { listUsers } from '../services/userService'
import type { User, UserRole, UserStatus } from '../types/user'
import type { SortDirection } from '../utils/projectDisplay'
import { compareUsers, type UserSortKey } from '../utils/userDisplay'

export const USERS_PAGE_SIZE = 8

export function useUserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'ALL' | UserRole>('ALL')
  const [status, setStatus] = useState<'ALL' | UserStatus>('ALL')
  const [sortKey, setSortKey] = useState<UserSortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setUsers(await listUsers())
    } catch {
      setError('Unable to load users.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setPage(1)
  }, [search, role, status])

  function changeSort(nextKey: UserSortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection(nextKey === 'createdAt' ? 'desc' : 'asc')
  }

  function resetFilters() {
    setSearch('')
    setRole('ALL')
    setStatus('ALL')
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.username.toLowerCase().includes(query) ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      const matchesRole = role === 'ALL' || user.role === role
      const matchesStatus = status === 'ALL' || user.status === status
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [role, search, status, users])

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((left, right) => compareUsers(left, right, sortKey, sortDirection))
  }, [filteredUsers, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * USERS_PAGE_SIZE
  const pagedUsers = sortedUsers.slice(pageStart, pageStart + USERS_PAGE_SIZE)
  const hasActiveFilters = search.trim().length > 0 || role !== 'ALL' || status !== 'ALL'

  return {
    users,
    pagedUsers,
    filteredCount: filteredUsers.length,
    isLoading,
    error,
    search,
    setSearch,
    role,
    setRole,
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
