import { AnimatePresence, motion, presets, presetVariants } from '@kitr/animation'
import { useConsent } from '@kitr/consent/react'
import { Link, useNavigate, useRouterState } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { useEffect, useRef, useState } from 'react'
import { useHideOnScroll } from '#app/hooks/use-hide-on-scroll'
import { useSwapped } from '#app/hooks/use-swapped'
import { release } from '#app/lib/changelog'
import { followLink, holdLink } from '#app/lib/links'
import { CreatorMark } from './creator-marks'
import { Icon, icons } from './icons'
import { Logo } from './logo'
import { Search } from './search'
import { ThemeToggle } from './theme-toggle'
import { buttonVariants } from './ui/button'

export const repoUrl = 'https://github.com/kitrjs/kitr'
export const platonUrl = 'https://platon.blue'

const navItems: Array<{
  label: string
  to: string
  /** Paths under this prefix mark the link as the current section. */
  section: string
}> = [
  { label: 'Platforms', to: '/platforms', section: '/platforms' },
  { label: 'Packages', to: '/packages', section: '/packages' },
  { label: 'Docs', to: '/docs', section: '/docs' },
  { label: 'Guides', to: '/guides', section: '/guides' },
  { label: 'About', to: '/about', section: '/about' },
]

export function Header() {
  const [menu, setMenu] = useState(false)
  const path = useRouterState({ select: (s) => s.location.pathname })
  // biome-ignore lint/correctness/useExhaustiveDependencies: close whenever the page changes
  useEffect(() => setMenu(false), [path])
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menu])
  useHideOnScroll(menu)
  const menuSwapped = useSwapped(menu)
  const navigate = useNavigate()
  // A link tapped in the menu waits here until the menu has folded away.
  const held = useRef<string | null>(null)

  return (
    // Kept still during page changes; its own transition class gets an opaque backing (motion.css).
    // Where scroll-driven animations exist, it gains a shadow as the page scrolls.
    <header
      ref={header}
      data-kitr-keep
      className="sticky [view-transition-class:kitr-keep_site-header] supports-[animation-timeline:scroll()]:animate-header-shade supports-[animation-timeline:scroll()]:[animation-range:0_64px] supports-[animation-timeline:scroll()]:[animation-timeline:scroll()] top-0 z-10 border-b border-border bg-background/88 backdrop-blur-[10px] max-phone:transition-transform max-phone:duration-200 max-phone:in-[.header-hidden]:-translate-y-full"
    >
      <nav
        className="container flex min-h-16 items-center gap-6 max-phone:gap-2.5 max-[400px]:gap-2"
        aria-label="Main"
      >
        <Link to="/" aria-label="kitr home" className="flex text-foreground">
          <Logo className="max-phone:h-[22px]! max-phone:w-[57px]!" />
        </Link>
        <div className="flex min-w-0 gap-6 overflow-x-auto [scrollbar-width:none] max-phone:hidden">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              aria-current={path.startsWith(item.section) ? 'page' : undefined}
              className="flex-none whitespace-nowrap py-1 font-medium text-foreground no-underline transition-[color,box-shadow] duration-120 aria-[current=page]:text-link aria-[current=page]:shadow-[inset_0_-2px_0_var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <Search />
        <ThemeToggle />
        <a
          href={repoUrl}
          className={cn(buttonVariants({ variant: 'icon', size: 'icon' }), 'max-phone:hidden')}
          aria-label="kitr on GitHub"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon={icons.github} />
        </a>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: 'icon', size: 'icon' }),
            'hidden max-phone:inline-flex',
          )}
          aria-label={menu ? 'Close menu' : 'Open menu'}
          aria-expanded={menu}
          aria-controls="nav-menu"
          onClick={() => setMenu((v) => !v)}
        >
          <span className={cn('inline-flex', menuSwapped && 'animate-icon-in')} key={String(menu)}>
            <Icon icon={menu ? icons.close : icons.menu} />
          </span>
        </button>
      </nav>
      <AnimatePresence
        onExitComplete={() => {
          const href = held.current
          held.current = null
          if (href) followLink(href, (to) => navigate({ href: to }))
        }}
      >
        {menu && (
          <motion.div
            id="nav-menu"
            className="absolute inset-x-0 top-full border-b border-border bg-background shadow-[0_16px_32px_rgb(0_0_0/0.18)]"
            {...presets.fadeDown}
            exit={{ ...presets.fadeDown.exit, pointerEvents: 'none' }}
            // The menu folds away before the page changes, so it is not caught in the transition.
            onClickCapture={(e) => {
              held.current = holdLink(e)
              if ((e.target as HTMLElement).closest('a')) setMenu(false)
            }}
          >
            <motion.div
              className="container flex flex-col pt-2 pb-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { delayChildren: 0.04, staggerChildren: 0.025 } },
              }}
            >
              {navItems.map((item) => (
                <MotionLink
                  key={item.label}
                  to={item.to}
                  aria-current={path.startsWith(item.section) ? 'page' : undefined}
                  className={menuLinkClass}
                  variants={menuLinkVariants}
                >
                  {item.label}
                  <Icon icon={icons.arrow} size={18} />
                </MotionLink>
              ))}
              <motion.a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className={menuLinkClass}
                variants={menuLinkVariants}
              >
                GitHub
                <Icon icon={icons.external} size={18} />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

const menuLinkClass =
  'flex min-h-[52px] items-center justify-between border-b border-border text-[18px] font-medium text-foreground no-underline last:border-b-0 aria-[current=page]:text-link [&_svg]:text-muted-foreground'
// Rows of the phone menu drop in one after another as it opens.
const menuLinkVariants = presetVariants('fadeDown')
const MotionLink = motion.create(Link)

const footerLinks: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Learn',
    links: [
      { label: 'Getting started', to: '/docs/getting-started' },
      { label: 'Guides', to: '/guides' },
      { label: 'Project structure', to: '/docs/project-structure' },
      { label: 'Platforms', to: '/docs/platforms' },
      { label: 'CLI reference', to: '/docs/cli' },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'Platforms', to: '/platforms' },
      { label: 'All packages', to: '/packages' },
      { label: 'Forms', to: '/packages/forms' },
      { label: 'Build a package', to: '/docs/building-packages' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Changelog', to: '/changelog' },
      { label: 'GitHub', to: repoUrl },
      { label: 'npm', to: 'https://www.npmjs.com/package/@kitr/kitr' },
      { label: 'llms.txt', to: '/llms.txt' },
      { label: 'Privacy', to: '/privacy' },
    ],
  },
]

/** Opens the cookie question again (the banner comes back). */
function CookieSettings() {
  const { reset } = useConsent()
  return (
    <button type="button" className={footerLinkClass} onClick={reset}>
      Cookie settings
    </button>
  )
}

/** The newest release on /changelog: `v0-6-0`. */
const releaseAnchor = `v${release.version.replace(/\./g, '-')}`

const footerLinkClass =
  'cursor-pointer text-left text-foreground no-underline transition-colors duration-120 hover:text-link hover:underline'

export function Footer() {
  return (
    <footer className="mt-(--section-gap) border-t border-border">
      <div className="container grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-8 pt-12 pb-14 text-[15px] text-muted-foreground max-phone:grid-cols-2">
        <div className="flex max-w-[320px] flex-col gap-3.5 max-phone:col-span-full">
          <Link to="/" aria-label="kitr home" className="inline-flex text-foreground">
            <Logo />
          </Link>
          <p className="leading-6 text-muted-foreground">
            One way to build everything. MIT licensed, built with kitr.
          </p>
          <a
            className="bg-plate-grid inline-flex h-6 items-center gap-1.5 self-start rounded-sm bg-[#002fa7] pr-[9px] pl-[7px] font-mono text-[11px] leading-none tracking-[0.02em] text-white no-underline shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] transition-transform duration-120 hover:-translate-y-px hover:text-white"
            href={platonUrl}
            target="_blank"
            rel="noreferrer"
          >
            <CreatorMark name="platon" size={12} />
            <span>made by platon</span>
          </a>
          <Link
            to="/changelog"
            hash={releaseAnchor}
            className="self-start font-mono text-xs text-muted-foreground no-underline hover:text-link"
            title="What changed in this release"
          >
            {release.name} {release.version}
          </Link>
        </div>
        {footerLinks.map((group) => (
          <nav key={group.title} className="flex flex-col gap-2.5" aria-label={group.title}>
            <span className="label mb-1">{group.title}</span>
            {group.links.map((l) =>
              l.to.startsWith('http') || l.to.endsWith('.txt') ? (
                <a
                  key={l.label}
                  href={l.to}
                  className={footerLinkClass}
                  {...(l.to.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.to} className={footerLinkClass}>
                  {l.label}
                </Link>
              ),
            )}
            {group.title === 'Project' && <CookieSettings />}
          </nav>
        ))}
      </div>
    </footer>
  )
}
