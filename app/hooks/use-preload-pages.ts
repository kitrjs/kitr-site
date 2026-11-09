import { useRouter } from '@kitr/router'
import { useEffect } from 'react'

/**
 * Fetches the code of every page once the browser is idle, so later navigations never wait for
 * it. `defaultPreload: 'intent'` in app/router.tsx still preloads data on hover.
 */
export function usePreloadPages() {
  const router = useRouter()
  useEffect(() => {
    const load = () => {
      for (const route of Object.values(router.routesById))
        void Promise.resolve(router.loadRouteChunk(route)).catch(() => {})
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(load, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(load, 2000)
    return () => clearTimeout(id)
  }, [router])
}
