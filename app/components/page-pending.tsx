import { useRouterState } from '@kitr/router'
import { useEffect, useState } from 'react'

/**
 * A thin progress bar along the top of the window while the next page's code or data loads.
 * The page you are on stays put until the next one is ready; the bar only shows when that takes
 * long enough to notice.
 */
export function NavProgress() {
  const loading = useRouterState({ select: (s) => s.status === 'pending' })
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!loading) {
      setShown(false)
      return
    }
    const id = setTimeout(() => setShown(true), 150)
    return () => clearTimeout(id)
  }, [loading])
  if (!shown) return null
  return (
    <div
      className="fixed inset-x-0 top-0 z-70 h-[3px] overflow-hidden bg-primary/15 before:absolute before:inset-y-0 before:left-0 before:w-[40%] before:animate-pending before:rounded-r-[3px] before:bg-primary motion-reduce:before:w-full motion-reduce:before:animate-none motion-reduce:before:opacity-60"
      role="progressbar"
      aria-label="Loading the page"
    />
  )
}

/** Only for a page that takes very long: an empty page of the usual height, under the bar. */
export function PagePending() {
  return <div className="min-h-[70vh]" aria-busy="true" />
}
