import { useTheme } from '@kitr/theme'
import { Icon, icons } from './icons'
import { buttonVariants } from './ui/button'

/**
 * Light or dark, through `useTheme()`. The new theme grows as a circle from the button
 * (`transition` in config/theme.ts), and the icon it brings turns in.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  // Both icons are rendered and CSS shows the one for the current theme, so a dark-mode visitor sees
  // the sun from the first paint instead of a moon that swaps once React hydrates.
  return (
    <button
      type="button"
      className={buttonVariants({ variant: 'icon', size: 'icon' })}
      onClick={(e) => toggle({ from: e.currentTarget })}
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="inline-flex in-data-kitr-theme-transition:animate-icon-in dark:hidden">
        <Icon icon={icons.moon} />
      </span>
      <span className="hidden in-data-kitr-theme-transition:animate-icon-in dark:inline-flex">
        <Icon icon={icons.sun} />
      </span>
    </button>
  )
}
