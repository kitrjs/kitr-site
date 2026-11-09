import type { MouseEvent } from 'react'

/**
 * For `onClickCapture` on a menu or drawer that animates out. A plain click on a link inside it is
 * held back and its address returned, so the panel can close first and the page change once its
 * exit is done (from `<AnimatePresence onExitComplete>`). Navigating at once would swap the page
 * while the panel is still on screen and catch it in the page transition. New tabs, modified
 * clicks, other sites and a link to the page already open are let through, and give null.
 */
export function holdLink(e: MouseEvent): string | null {
  const a = (e.target as HTMLElement).closest('a')
  if (!a) return null
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return null
  if ((a.target && a.target !== '_self') || a.origin !== window.location.origin) return null
  const samePage = a.pathname === window.location.pathname && a.search === window.location.search
  if (samePage && !a.hash) return null
  e.preventDefault()
  return a.pathname + a.search + a.hash
}

/**
 * Goes where a held link pointed. A section of the current page is scrolled to the way a click
 * would (smoothly unless reduced motion is on, stopping under the sticky header, with the hash in
 * the address bar); anything else goes through the router.
 */
export function followLink(href: string, navigate: (href: string) => void) {
  const url = new URL(href, window.location.href)
  if (url.pathname !== window.location.pathname || url.search !== window.location.search)
    return navigate(href)
  // A frame later, so a drawer's scroll lock is off before the page scrolls.
  requestAnimationFrame(() => {
    if (window.location.hash !== url.hash) window.location.hash = url.hash
    else document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView()
  })
}
