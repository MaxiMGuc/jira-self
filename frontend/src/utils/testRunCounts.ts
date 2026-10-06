import type { TestRunResult } from '../types/testRun'

export type TestRunCounts = {
  total: number
  passed: number
  failed: number
  blocked: number
  notRun: number
  passRate: number
}

export function calculateTestRunCounts(results: TestRunResult[]): TestRunCounts {
  const total = results.length
  const passed = results.filter((item) => item.status === 'PASSED').length
  const failed = results.filter((item) => item.status === 'FAILED').length
  const blocked = results.filter((item) => item.status === 'BLOCKED').length
  const notRun = results.filter((item) => item.status === 'NOT_RUN').length
  const passRate = total === 0 ? 0 : Math.round((passed / total) * 100)

  return { total, passed, failed, blocked, notRun, passRate }
}

export function formatPassRate(passRate: number): string {
  return `${passRate}%`
}
