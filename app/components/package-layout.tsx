import { useActiveHeading } from '@kitr/content/react'
import { Link, useNavigate } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { useEffect } from 'react'
import { type PackageEntry, packageOrder } from '#app/lib/catalog'
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
import { Icon, icons } from './icons'
import { LiveExample } from './live-example'
import { BuiltOn, CategoryBadge, RunsOnBadge, Tile } from './package-bits'

/**
 * Every package has three parts: an Overview (what it is, what it is built on, what it solves,
 * further reading), the Guide (how to use it) and the API reference. The sidebar is that outline,
 * with the sections of the part you are on, and a way back to every package; the pager at the
 * end walks on to the next part or package.
 */
export function PackageLayout({
  pkg,
  page,
  current,
}: {
  pkg: PackageEntry
  page: Page | null
  current: string
}) {
  const overview = current === ''
  const examples = overview ? pkg.examples : []
  const toc = page?.toc ?? []
  const active = useActiveHeading(toc, 140)
  const navigate = useNavigate()

  // A section anchor at the package root that the overview doesn't have
  // (/packages/mail#attach-a-file) opens the guide, where the package's sections are.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per package
  useEffect(() => {
    if (!overview || !pkg.pages.some((p) => p.slug === 'guide')) return
    const toGuide = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id || document.getElementById(id)) return
      navigate({
        to: '/packages/$name/$page',
        params: { name: pkg.name, page: 'guide' },
        hash: id,
        replace: true,
      })
    }
    toGuide()
    window.addEventListener('hashchange', toGuide)
    return () => window.removeEventListener('hashchange', toGuide)
  }, [pkg.name, overview])

  return (
    <DocsShell>
      <Sidebar
        label={`${pkg.title} docs`}
        where={
          <>
            <span className="font-mono">{pkg.name}</span>
            <span className="ml-1.5 font-medium text-muted-foreground">
              {titleOf(pkg, current)}
            </span>
          </>
        }
        active={active}
      >
        <PackageNav pkg={pkg} page={page} toc={toc} current={current} active={active} />
      </Sidebar>
      <DocsMain>
        {overview ? (
          <PackageHead pkg={pkg} />
        ) : (
          <PageHead tile={(className) => <Tile pkg={pkg} size={44} className={className} />}>
            <span className="label">{titleOf(pkg, current)}</span>
            <h1 className="font-mono text-[32px] leading-[38px] font-medium">{pkg.name}</h1>
          </PageHead>
        )}

        {examples.map((example) => (
          <LiveExample
            key={example.slug}
            pkg={pkg.name}
            example={example.slug}
            title={example.title}
            description={example.description}
            storage={example.storage}
            height={example.height}
            width={example.width}
          />
        ))}

        {page && <DocBody page={page} />}
        <PackagePager pkg={pkg} current={current} />
      </DocsMain>
    </DocsShell>
  )
}

function PackageHead({ pkg }: { pkg: PackageEntry }) {
  return (
    <PageHead large tile={(className) => <Tile pkg={pkg} size={88} className={className} />}>
      <h1 className="font-mono text-[44px] leading-[50px] font-medium max-phone:text-[34px] max-phone:leading-10">
        {pkg.name}
      </h1>
      <p className="text-[19px] leading-[29px]">{pkg.summary}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryBadge category={pkg.category} />
        <RunsOnBadge value={pkg.runsOn} />
        {pkg.builtOn?.length ? <BuiltOn keys={pkg.builtOn} /> : null}
      </div>
    </PageHead>
  )
}

/** What a package page is called in navigation. */
const titleOf = (pkg: PackageEntry, slug: string) =>
  pkg.pages.find((p) => p.slug === slug)?.title ?? 'Overview'

function PackageNav({
  pkg,
  page,
  toc,
  current,
  active,
}: {
  pkg: PackageEntry
  page: Page | null
  toc: Page['toc']
  current: string
  active: string | undefined
}) {
  const pages = pkg.pages.length ? pkg.pages : [{ slug: '', title: 'Overview', order: 0 }]
  return (
    <>
      <Link to="/packages" className={sidebarBack} activeOptions={{ exact: true }}>
        <Icon icon={icons.back} size={16} />
        All packages
      </Link>
      <Link
        to="/packages/$name"
        params={{ name: pkg.name }}
        className={cn(
          sidebarLink,
          '-mt-2 flex items-center gap-2.5 text-[17px] leading-[26px] font-semibold aria-[current=page]:bg-transparent aria-[current=page]:text-foreground',
        )}
        activeOptions={{ exact: true }}
      >
        <Tile pkg={pkg} size={28} className="rounded-[8px]" />
        <span className="font-mono">{pkg.name}</span>
      </Link>
      <SidebarGroup>
        {pages.map((p) => (
          <SidebarPage key={p.slug || 'overview'}>
            {p.slug ? (
              <Link
                to="/packages/$name/$page"
                params={{ name: pkg.name, page: p.slug }}
                className={sidebarLink}
                aria-current={current === p.slug ? 'page' : undefined}
              >
                {p.title}
              </Link>
            ) : (
              <Link
                to="/packages/$name"
                params={{ name: pkg.name }}
                activeOptions={{ exact: true }}
                className={sidebarLink}
                aria-current={current === '' ? 'page' : undefined}
              >
                {p.title}
              </Link>
            )}
            <Reveal open={current === p.slug}>
              <SectionList toc={toc} active={active} />
            </Reveal>
          </SidebarPage>
        ))}
      </SidebarGroup>
      {page && <SidebarFoot page={page} />}
    </>
  )
}

type Stop = { pkg: PackageEntry; slug: string; title: string }

/** Every package page in sidebar order: each package's overview, guide, then API reference. */
const stops: Stop[] = packageOrder.flatMap((pkg) =>
  pkg.pages.length
    ? pkg.pages.map((p) => ({ pkg, slug: p.slug, title: p.title }))
    : [{ pkg, slug: '', title: 'Overview' }],
)

function PackagePager({ pkg, current }: { pkg: PackageEntry; current: string }) {
  const index = stops.findIndex((s) => s.pkg.name === pkg.name && s.slug === current)
  if (index < 0) return null
  const prev = stops[index - 1]
  const next = stops[index + 1]
  const link = (stop: Stop, dir: 'Previous' | 'Next') => {
    const same = stop.pkg.name === pkg.name
    const body = (
      <>
        <span className="label">{dir}</span>
        {same ? stop.title : <span className="font-mono">{stop.pkg.name}</span>}
      </>
    )
    const className = pagerLink(dir === 'Next')
    return stop.slug ? (
      <Link
        to="/packages/$name/$page"
        params={{ name: stop.pkg.name, page: stop.slug }}
        className={className}
      >
        {body}
      </Link>
    ) : (
      <Link to="/packages/$name" params={{ name: stop.pkg.name }} className={className}>
        {body}
      </Link>
    )
  }
  return (
    <Pager>
      {prev ? link(prev, 'Previous') : <span />}
      {next && link(next, 'Next')}
    </Pager>
  )
}
