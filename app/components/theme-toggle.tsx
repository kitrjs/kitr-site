import { useTheme } from '@kitr/theme'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Icon, icons } from './icons'
import { buttonVariants } from './ui/button'

/**
 * Light or dark, through `useTheme()`. The new theme is revealed as a circle growing from the
 * button (motion.css), inside a view transition: `flushSync` applies the theme before the browser
 * takes the new snapshot.
 */
export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  const button = useRef<HTMLButtonElement>(null)
  const toggle = () => {
    const root = document.documentElement
    const next = resolved === 'dark' ? 'light' : 'dark'
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next)
      return
    }
    const rect = button.current?.getBoundingClientRect()
    root.style.setProperty('--theme-x', `${rect ? rect.left + rect.width / 2 : 0}px`)
    root.style.setProperty('--theme-y', `${rect ? rect.top + rect.height / 2 : 0}px`)
    root.classList.add('theme-switching')
    document
      .startViewTransition(() => {
        flushSync(() => setTheme(next))
        // Only the icon that appears in the new snapshot turns in (animate-icon-in).
        root.classList.add('theme-swapped')
      })
      .finished.finally(() => root.classList.remove('theme-switching', 'theme-swapped'))
  }
  // Both icons are rendered and CSS shows the one for the current theme, so a dark-mode visitor sees
  // the sun from the first paint instead of a moon that swaps once React hydrates.
  return (
    <button
      type="button"
      ref={button}
      className={buttonVariants({ variant: 'icon', size: 'icon' })}
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="inline-flex in-[.theme-swapped]:animate-icon-in dark:hidden">
        <Icon icon={icons.moon} />
      </span>
      <span className="hidden in-[.theme-swapped]:animate-icon-in dark:inline-flex">
        <Icon icon={icons.sun} />
      </span>
    </button>
  )
}
