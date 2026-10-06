export type TestSuite = {
  id: string
  name: string
  description: string
  projectId: string
  testCaseIds: string[]
  createdAt: string
  updatedAt: string
}

export type TestSuiteFormData = {
  name: string
  description: string
  projectId: string
}

export const TEST_SUITE_NAME_MAX_LENGTH = 80
export const TEST_SUITE_DESCRIPTION_MAX_LENGTH = 1000
