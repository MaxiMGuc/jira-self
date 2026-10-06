import { useEffect } from 'react'
import { APP_NAME } from '../utils/routes'

export function usePageTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = `${pageTitle} | ${APP_NAME}`
    return () => {
      document.title = APP_NAME
    }
  }, [pageTitle])
}
