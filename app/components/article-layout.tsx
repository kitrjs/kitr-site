import {
  ArrowDataTransferHorizontalIcon,
  Book02Icon,
  Idea01Icon,
  Layers01Icon,
  PuzzleIcon,
  Rocket01Icon,
  SmartPhone01Icon,
  TestTube01Icon,
} from '@hugeicons/core-free-icons'
import { useActiveHeading } from '@kitr/content/react'
import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import type { ReactNode } from 'react'
import type { Page } from '#app/lib/content'
import { DocBody } from './doc-body'
import {
  Reveal,
  SectionList,
  Sidebar,
  SidebarFoot,
  SidebarGroup,
  SidebarPage,
  sidebarBack,
  sidebarLink,
} from './docs-nav'
import { DocsMain, DocsShell, PageHead, Pager, pagerLink } from './docs-page'
import { Icon, type IconSvgElement, icons } from './icons'

/**
 * Each docs and guides group gets a tile like a package's: a colour from the package palette and
 * an icon, so a handbook page, a guide and a package page share one header and one sidebar.
 */
const groupTiles: Record<string, { icon: IconSvgElement; color: string }> = {
  'Start here': { icon: Rocket01Icon, color: '#38BDF8' },
  Concepts: { icon: Idea01Icon, color: '#FACC15' },
  Extend: { icon: PuzzleIcon, color: '#A78BFA' },
  Reference: { icon: Book02Icon, color: '#94A3B8' },
  'Build an app': { icon: Layers01Icon, color: '#34D399' },
  'Organise, test and deploy': { icon: TestTube01Icon, color: '#FB923C' },
  'Ship to phones and desktops': { icon: SmartPhone01Icon, color: '#2DD4BF' },
  'Extend and migrate': { icon: ArrowDataTransferHorizontalIcon, color: '#F472B6' },
}
const fallbackTile = { icon: Book02Icon, color: '#94A3B8' }

export function GroupTile({
  group,
  size = 44,
  className,
}: {
  group: string
  size?: number
  className?: string
}) {
  const tile = groupTiles[group] ?? fallbackTile
  return (
    <span
      className={cn('inline-flex flex-none items-center justify-center rounded-[34%]', className)}
      style={{ width: size, height: size, background: tile.color }}
    >
      <Icon icon={tile.icon} size={Math.round(size * 0.55)} stroke="#0B121C" strokeWidth={1.6} />
    </span>
  )
}

type Section = 'docs' | 'guides'
type NavGroup = { title: string; items: Array<{ slug: string; title: string }> }

const homes = {
  docs: { to: '/docs', back: 'All docs', label: 'Docs', name: 'docs' },
  guides: { to: '/guides', back: 'All guides', label: 'Guides', name: 'guides' },
} as const

/**
 * A handbook page or a guide, laid out like a package page: the sidebar is the outline (back to
 * the index, every page by group, the sections of the one you are on, edit links), and the page
 * opens with its group's tile, label and title.
 */
export function ArticleLayout({
  section,
  nav,
  page,
  slug,
  label,
  meta,
}: {
  section: Section
  nav: NavGroup[]
  page: Page
  slug: string
  /** The small caps line above the title. */
  label: string
  /** Under the lede: a guide's time and packages. */
  meta?: ReactNode
}) {
  const home = homes[section]
  const active = useActiveHeading(page.toc, 140)
  const flat = nav.flatMap((g) => g.items)
  const index = flat.findIndex((i) => i.slug === slug)
  const prev = flat[index - 1]
  const next = flat[index + 1]
  const group = page.section
  const to = section === 'docs' ? '/docs/$slug' : '/guides/$slug'
  return (
    <DocsShell>
      <Sidebar
        label={home.label}
        where={
          <>
            <span className="font-mono">{home.name}</span>
            <span className="ml-1.5 font-medium text-muted-foreground">{page.title}</span>
          </>
        }
        active={active}
      >
        <Link to={home.to} className={sidebarBack} activeOptions={{ exact: true }}>
          <Icon icon={icons.back} size={16} />
          {home.back}
        </Link>
        {nav.map((g) => (
          <SidebarGroup key={g.title} title={g.title}>
            {g.items.map((item) => (
              <SidebarPage key={item.slug}>
                <Link
                  to={to}
                  params={{ slug: item.slug }}
                  className={sidebarLink}
                  aria-current={item.slug === slug ? 'page' : undefined}
                >
                  {item.title}
                </Link>
                <Reveal open={item.slug === slug}>
                  <SectionList toc={page.toc} active={active} />
                </Reveal>
              </SidebarPage>
            ))}
          </SidebarGroup>
        ))}
        <SidebarFoot page={page} />
      </Sidebar>
      <DocsMain>
        <PageHead tile={(className) => <GroupTile group={group} className={className} />}>
          <span className="label">{label}</span>
          <h1 className="text-[32px] leading-[38px] font-bold tracking-[-0.01em] max-phone:text-[28px] max-phone:leading-[34px]">
            {page.title}
          </h1>
        </PageHead>
        {page.description && (
          <p className="lede mb-6 max-phone:text-[18px] max-phone:leading-7">{page.description}</p>
        )}
        {meta}
        <DocBody page={page} />
        <Pager>
          {prev ? (
            <Link to={to} params={{ slug: prev.slug }} className={pagerLink(false)}>
              <span className="label">Previous</span>
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={to} params={{ slug: next.slug }} className={pagerLink(true)}>
              <span className="label">Next</span>
              {next.title}
            </Link>
          )}
        </Pager>
      </DocsMain>
    </DocsShell>
  )
}
