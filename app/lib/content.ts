import type { Page as ContentPage, SearchEntry } from '@kitr/content'
import { findPackage, planned } from '#app/lib/catalog'
import { type Collection, loadPage, loadSearch, nav } from '#kitr/content'

export type { SearchEntry, TocEntry } from '@kitr/content'
export { search } from '@kitr/content'

/** A rendered page, with the address of its markdown copy for "View as markdown". */
export interface Page extends ContentPage {
  markdown: string
}

/**
 * The pages come from a kitrjs/kitr checkout in .content/kitr, so the edit link `kitr generate`
 * builds carries that folder; on GitHub the file is at the repo root.
 */
const repoPath = (url: string | undefined) =>
  url?.replace('/edit/main/.content/kitr/', '/edit/main/')

async function load(collection: Collection, slug: string, url?: string): Promise<Page | null> {
  const page = await loadPage(collection, slug)
  if (!page) return null
  return {
    ...page,
    url: url ?? page.url,
    markdown: `${page.url}.md`,
    editUrl: repoPath(page.editUrl),
  }
}

export const loadDoc = (slug: string) => load('docs', slug)
export const loadGuide = (slug: string) => load('guides', slug)

/**
 * A package page by its address on the site: '' is the overview (overview.md), `guide` the
 * guide (index.md), and anything else the file of that name (`api` is api.md).
 */
export function loadPackagePage(name: string, page: string) {
  const collection = `pkg-${name}` as Collection
  if (!(collection in nav)) return Promise.resolve(null)
  const file = page === '' ? 'overview' : page === 'guide' ? 'index' : page
  // overview and index have their own addresses; /packages/x/overview is not one.
  if (page === 'overview' || page === 'index') return Promise.resolve(null)
  return load(collection, file, page ? `/packages/${name}/${page}` : `/packages/${name}`)
}

/** What a guide's frontmatter says besides its title: the packages it uses, where it ships, how long it takes. */
export interface GuideMeta {
  packages: string[]
  /** Platform types the guide ships to: web, server, desktop, tauri, mobile. */
  platforms: string[]
  time?: string
}

export interface GuideItem extends GuideMeta {
  slug: string
  title: string
  description?: string
}

const list = (value: string | number | undefined) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/** Only the `data` (frontmatter) of each guide's JSON: Vite drops the rendered body from the bundle. */
const guideData = import.meta.glob<ContentPage['data']>('../../.kitr/content/guides/*.json', {
  eager: true,
  import: 'data',
})

export function guideMeta(slug: string): GuideMeta {
  const data = guideData[`../../.kitr/content/guides/${slug}.json`] ?? {}
  return {
    packages: list(data.packages),
    platforms: list(data.platforms),
    time: data.time ? String(data.time) : undefined,
  }
}

/** The guides sidebar and index: nav.json's groups, each guide with its frontmatter. */
export const guidesNav = nav.guides.map((group) => ({
  ...group,
  items: group.items.map((item): GuideItem => ({ ...item, ...guideMeta(item.slug) })),
}))

export const docsNav = nav.docs

/**
 * The search index from `kitr generate`, with each package page at its address and named after
 * its package ("Mail: API reference", not "API reference"), plus the packages still on the roadmap.
 */
export async function loadSiteSearch(): Promise<SearchEntry[]> {
  const index = await loadSearch()
  const pages = index.map((entry) => {
    const m = entry.url.match(/^\/packages\/([\w-]+)\/([\w-]+)(#.*)?$/)
    const pkg = m && findPackage(m[1] ?? '')
    if (!m || !pkg) return entry
    const [, name, file, hash = ''] = m
    const page = file === 'overview' ? '' : file === 'index' ? 'guide' : file
    const title = pkg.pages.find((p) => p.slug === page)?.title
    return {
      ...entry,
      url: `/packages/${name}${page ? `/${page}` : ''}${hash}`,
      // The search dialog shows the package's tile and title; this is what the query matches.
      title: page ? `${pkg.title}: ${title}` : hash ? pkg.title : `${pkg.title} ${name}`,
    }
  })
  const roadmap = planned.map((p) => ({
    url: `/packages#${p.name}`,
    title: p.name,
    section: p.status === 'later' ? 'Roadmap' : 'Coming soon',
    heading: '',
    text: p.summary,
  }))
  return [...pages, ...roadmap]
}
