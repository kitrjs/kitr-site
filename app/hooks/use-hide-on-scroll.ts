import { useEffect } from 'react'

/**
 * On phones, on a page with the docs bar, the header slides away while you scroll down and comes
 * back as soon as you scroll up, so the bar has the top of the screen to itself. Other pages keep
 * the header: their own sticky bars (the package search) sit under it.
 */
export function useHideOnScroll(paused: boolean) {
  useEffect(() => {
    const root = document.documentElement
    if (paused) {
      root.classList.remove('header-hidden')
      return
    }
    const phone = window.matchMedia('(max-width: 760px)')
    let last = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      if (!phone.matches || y < 120 || !document.querySelector('.docs-bar'))
        root.classList.remove('header-hidden')
      else if (y > last + 6) root.classList.add('header-hidden')
      else if (y < last - 6) root.classList.remove('header-hidden')
      else return
      last = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
      root.classList.remove('header-hidden')
    }
  }, [paused])
}
