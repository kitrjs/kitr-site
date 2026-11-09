import { AnimatePresence, motion, presets, transitions } from '@kitr/animation'
import { useNavigate, useRouterState } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type { Page, TocEntry } from '#app/lib/content'
import { followLink, holdLink } from '#app/lib/links'
import { Icon, icons } from './icons'
import { buttonVariants } from './ui/button'

/** The h2 a heading belongs to: itself for an h2, the h2 above it for an h3. */
export function sectionOf(toc: TocEntry[], id: string | undefined): TocEntry | undefined {
  const index = toc.findIndex((t) => t.id === id)
  for (let i = index; i >= 0; i--) if (toc[i]?.depth === 2) return toc[i]
  return undefined
}

/**
 * Opens and closes its content by sliding its height, for the section lists under the current
 * page in the sidebar. Only a change animates: what is open on the first render, including the
 * page you land on, just shows.
 */
export function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        // The padding gives focus rings room inside the clipped box.
        <motion.div className="-m-1 overflow-hidden p-1" {...presets.collapse}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** A link in the sidebar: a page, or the way back to an index. The drawer spaces them out. */
export const sidebarLink =
  '-ml-2.5 rounded-sm px-2.5 py-[3px] text-[15px] leading-[26px] text-foreground no-underline transition-colors duration-120 hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-link in-data-drawer:leading-[30px]'

/** The link back to the index at the top of the sidebar. */
export const sidebarBack = cn(
  sidebarLink,
  'inline-flex items-center gap-1.5 self-start text-[14px] leading-[26px] text-muted-foreground hover:bg-transparent hover:text-foreground aria-[current=page]:bg-transparent aria-[current=page]:font-normal aria-[current=page]:text-muted-foreground',
)

const sectionLink =
  '-ml-px block border-l-2 border-transparent py-[3px] pr-2.5 pl-[13px] text-[14px] leading-[21px] text-muted-foreground no-underline transition-colors duration-120 hover:text-foreground aria-[current=location]:border-primary aria-[current=location]:font-medium aria-[current=location]:text-link in-data-drawer:py-1.5'

/** A group of pages in the sidebar, under its small caps title. */
export function SidebarGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      {title && <span className="label mb-1.5 flex items-center gap-2">{title}</span>}
      {children}
    </div>
  )
}

/** A page in the sidebar, with its sections opening under it while it is the one you are on. */
export function SidebarPage({ children }: { children: ReactNode }) {
  return <div className="flex flex-col [&>a]:font-medium">{children}</div>
}

/** Edit and markdown links under the sidebar. */
export function SidebarFoot({ page }: { page: Pick<Page, 'editUrl' | 'markdown'> }) {
  const link = cn(
    sidebarLink,
    'inline-flex items-center gap-1.5 text-[14px] leading-[26px] text-muted-foreground',
  )
  return (
    <div className="flex flex-col gap-0.5 border-t border-border pt-3.5">
      <a href={page.editUrl} target="_blank" rel="noreferrer" className={link}>
        <Icon icon={icons.edit} size={14} /> Edit this page
      </a>
      <a href={page.markdown} className={link}>
        View as markdown
      </a>
    </div>
  )
}

/**
 * A page's sections as a list of links: every h2, plus the h3s of the section being read,
 * so a long guide reads as a short outline that opens where you are.
 */
export function SectionList({
  toc,
  active,
  className,
}: {
  toc: TocEntry[]
  active: string | undefined
  className?: string
}) {
  if (!toc.length) return null
  const open = sectionOf(toc, active)?.id
  const groups: Array<{ h2: TocEntry; h3: TocEntry[] }> = []
  for (const t of toc) {
    if (t.depth === 2) groups.push({ h2: t, h3: [] })
    else groups.at(-1)?.h3.push(t)
  }
  return (
    <ul className={cn('mt-1 mb-2 border-l border-border', className)}>
      {groups.map(({ h2, h3 }) => (
        <li key={h2.id}>
          <a
            href={`#${h2.id}`}
            className={sectionLink}
            aria-current={h2.id === open ? 'location' : undefined}
          >
            {h2.text}
          </a>
          <Reveal open={h2.id === open && h3.length > 0}>
            <ul className="mt-0.5 mb-1">
              {h3.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className={cn(
                      sectionLink,
                      'pl-[25px] text-[13.5px] aria-[current=location]:border-transparent',
                    )}
                    aria-current={t.id === active ? 'location' : undefined}
                  >
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

/**
 * The left-hand navigation. On wide screens it is a sticky column. On phones it collapses into a
 * sticky bar whose button opens the same navigation full-screen; the page's sections are listed
 * under the current page in there, so the bar needs no menu of its own for them.
 */
export function Sidebar({
  label,
  where,
  active,
  children,
}: {
  /** What the navigation is, for screen readers and the drawer's heading. */
  label: string
  /** The page you are on, shown in the phone bar. */
  where: ReactNode
  /** The heading being read, from useActiveHeading. */
  active?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const column = useRef<HTMLElement>(null)
  const drawer = useRef<HTMLElement>(null)
  const path = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  // A link tapped in the drawer waits here until the drawer has slid away.
  const held = useRef<string | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: close whenever the page changes
  useEffect(() => setOpen(false), [path])

  const menuButton = useRef<HTMLButtonElement>(null)
  // Closing from the keyboard or the close button hands focus back to the button that opened it;
  // otherwise it would drop to <body> when the drawer unmounts. Following a link closes it too,
  // without moving focus, because the page is about to change.
  const closeDrawer = () => {
    setOpen(false)
    menuButton.current?.focus({ preventScroll: true })
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: closeDrawer only touches state setters and refs
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    drawer.current?.querySelector<HTMLElement>('[aria-current="page"], a')?.focus({
      preventScroll: true,
    })
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // The page under the drawer stays still until the drawer has finished sliding out.
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = ''
    }
  }, [mounted])

  // Keep the link for the section being read inside the part of the sidebar on screen. Near the
  // end of a page the sticky sidebar is pushed up with the layout and its top leaves the
  // viewport, so measure against what is visible, and check again as the page scrolls.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the reader moves
  useEffect(() => {
    const box = open ? drawer.current : column.current
    if (!box) return
    const reveal = (onlyWhenPushed = false) => {
      const current =
        box.querySelector<HTMLElement>('ul ul [aria-current="location"]') ??
        box.querySelector<HTMLElement>('[aria-current="location"]') ??
        box.querySelector<HTMLElement>('[aria-current="page"]')
      if (!current || box.scrollHeight <= box.clientHeight) return
      const b = box.getBoundingClientRect()
      const header = Number.parseFloat(getComputedStyle(box).top) || 0
      // While the sidebar sits at its sticky spot, leave its scroll to the reader.
      if (onlyWhenPushed && b.top >= header - 1) return
      const visTop = Math.max(b.top, header)
      const visBottom = Math.min(b.bottom, window.innerHeight)
      if (visBottom - visTop < 80) return
      const c = current.getBoundingClientRect()
      if (c.top < visTop + 40 || c.bottom > visBottom - 40)
        box.scrollTop += c.top - (visTop + (visBottom - visTop) / 3)
    }
    reveal()
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => reveal(true))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [active, open])

  return (
    <>
      {/* `docs-bar` is a hook: the header hides above it on phones (use-hide-on-scroll). */}
      <div
        data-kitr-keep
        className="docs-bar sticky top-16 z-9 -mx-4 hidden border-b border-border bg-background/92 px-4 py-2 backdrop-blur-[10px] transition-[top] duration-200 max-phone:block in-[.header-hidden]:top-0"
      >
        <button
          type="button"
          ref={menuButton}
          className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-muted px-3 text-left text-[15px] text-foreground aria-expanded:border-primary"
          aria-expanded={open}
          aria-controls="docs-drawer"
          aria-label={`${label} navigation`}
          onClick={() => setOpen(true)}
        >
          <Icon icon={icons.menu} size={18} />
          <span className="block min-w-0 flex-[0_1_auto] truncate font-semibold">{where}</span>
        </button>
      </div>
      {/* Kept still between two pages of one section. Keyed by the section, so another section's
          sidebar is a new element and fades with the page instead of overlapping. */}
      <nav
        key={label}
        ref={column}
        data-kitr-keep
        className="sticky top-16 flex max-h-[calc(100vh-64px)] flex-col gap-5.5 overflow-x-hidden overflow-y-auto py-8 [scrollbar-width:none] hover:[scrollbar-width:thin] max-phone:hidden"
        aria-label={label}
      >
        {children}
      </nav>
      {/* On phones the same navigation opens full-screen, and slides away before the page changes
          under it. */}
      <AnimatePresence
        onExitComplete={() => {
          setMounted(false)
          const href = held.current
          held.current = null
          if (href) followLink(href, (to) => navigate({ href: to }))
        }}
      >
        {open && (
          <motion.nav
            id="docs-drawer"
            ref={drawer}
            data-drawer
            className="fixed inset-0 z-30 flex flex-col gap-5.5 overflow-y-auto overscroll-contain bg-background px-5 pb-10 phone:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: transitions.slow }}
            exit={{ x: '-100%', pointerEvents: 'none', transition: transitions.exit }}
            onAnimationStart={() => setMounted(true)}
            aria-label={label}
            onClickCapture={(e) => {
              held.current = holdLink(e)
              if ((e.target as HTMLElement).closest('a')) setOpen(false)
            }}
          >
            <div className="sticky top-0 z-1 -mx-5 flex min-h-15 items-center justify-between border-b border-border bg-background pr-3 pl-5">
              <span className="label">{label}</span>
              <button
                type="button"
                className={buttonVariants({ variant: 'icon', size: 'icon' })}
                aria-label="Close navigation"
                onClick={closeDrawer}
              >
                <Icon icon={icons.close} size={18} />
              </button>
            </div>
            <motion.div
              className="flex flex-col gap-5.5"
              {...presets.fade}
              transition={{ ...transitions.base, delay: 0.08 }}
            >
              {children}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
