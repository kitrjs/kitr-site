/**
 * Every internal link on the site resolves: a page that exists and, for `#anchors`, a heading on
 * it. Reads what `kitr generate` wrote (.kitr/content and app/generated) and the site's own source
 * in app/, so a renamed doc or heading fails here instead of on a reader.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const site = resolve(__dirname, '..')
const content = join(site, '.kitr/content')
const generated = join(site, 'app/generated')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8'))

interface ContentPage {
  blocks: Array<{ type: string; html?: string }>
  toc: Array<{ id: string }>
}

/** Each page of the site, with the ids a `#hash` on it may point to (undefined: not checked). */
const pages = new Map<string, Set<string> | undefined>()
/** The rendered HTML of each markdown page, by its address. */
const rendered = new Map<string, string>()

function addPage(path: string, file: string) {
  const page = readJson<ContentPage>(file)
  const html = page.blocks.map((b) => b.html ?? '').join('')
  const ids = new Set(page.toc.map((t) => t.id))
  for (const [, id = ''] of html.matchAll(/\sid="([^"]+)"/g)) ids.add(id)
  pages.set(path, ids)
  rendered.set(path, html)
}

const jsonFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.json'))

for (const collection of ['docs', 'guides'])
  for (const f of jsonFiles(join(content, collection)))
    addPage(`/${collection}/${f.slice(0, -5)}`, join(content, collection, f))

// A package's overview.md is the package page, index.md its guide, anything else keeps its name.
for (const dir of readdirSync(content, { withFileTypes: true })) {
  if (!dir.isDirectory() || !dir.name.startsWith('pkg-')) continue
  const name = dir.name.slice(4)
  for (const f of jsonFiles(join(content, dir.name))) {
    const slug = f.slice(0, -5)
    const path =
      slug === 'overview'
        ? `/packages/${name}`
        : `/packages/${name}/${slug === 'index' ? 'guide' : slug}`
    addPage(path, join(content, dir.name, f))
  }
}

for (const path of ['/', '/docs', '/guides', '/packages', '/platforms', '/about', '/privacy'])
  pages.set(path, undefined)
const changelog = readJson<Array<{ id: string; entries: Array<{ html: string }> }>>(
  join(generated, 'changelog.json'),
)
pages.set('/changelog', new Set(changelog.map((r) => r.id)))
const packages = readJson<Array<{ name: string }>>(join(generated, 'packages.json'))
for (const p of packages)
  if (!pages.has(`/packages/${p.name}`)) pages.set(`/packages/${p.name}`, undefined)
for (const p of readJson<{ platforms: Array<{ type: string }> }>(join(generated, 'platforms.json'))
  .platforms)
  pages.set(`/platforms/${p.type}`, undefined)

/** Why a link does not resolve, or undefined when it does. */
function check(href: string): string | undefined {
  const [pathAndQuery = '', hash] = href.split('#')
  const path = (pathAndQuery.split('?')[0] ?? '').replace(/(.)\/$/, '$1')
  // Files in public/, and every page's markdown copy at <url>.md.
  if (path !== '/' && existsSync(join(site, 'public', path))) return undefined
  if (path.endsWith('.md') && pages.has(path.slice(0, -3))) return undefined
  if (path === '/llms.txt' || path === '/llms-full.txt') return undefined
  if (path.startsWith('/play/')) return undefined
  if (!pages.has(path)) return 'no such page'
  const ids = pages.get(path)
  if (hash && ids && !ids.has(hash)) return `no heading #${hash}`
  return undefined
}

/** `href="/..."` in rendered HTML. */
const hrefs = (html: string) =>
  [...html.matchAll(/href="(\/[^"]*)"/g)].map(([, h = '']) => h).filter((h) => !h.startsWith('//'))

/** Literal site paths in the app's own source, including `<Link to="/docs/$slug" params hash>`. */
function sourceLinks(file: string) {
  const source = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  const links = [
    ...source.matchAll(
      /['"`](\/(?:docs|guides|packages|platforms|changelog|about|privacy)(?:[/#?][^'"`\s]*)?)['"`]/g,
    ),
  ]
    .map(([, h = '']) => h)
    .filter((h) => !h.includes('$'))
  for (const m of source.matchAll(
    /to="\/(docs|guides|packages|platforms)\/\$(?:slug|name|type)"\s+params=\{\{ \w+: '([^']+)' \}\}(?:\s+hash="([^"]+)")?/g,
  ))
    links.push(`/${m[1]}/${m[2]}${m[3] ? `#${m[3]}` : ''}`)
  // Data arrays that pair a page with a hash.
  for (const m of source.matchAll(/to: '(\/[^']+)', hash: '([^']+)'/g))
    links.push(`${m[1]}#${m[2]}`)
  return links
}

const appFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name)
    if (e.isDirectory()) return e.name === 'generated' ? [] : appFiles(path)
    return /\.(tsx?|mjs|json)$/.test(e.name) && !e.name.includes('.test.') ? [path] : []
  })

describe('internal links', () => {
  it('in the docs, guides and package pages', () => {
    expect(rendered.size).toBeGreaterThan(50)
    const broken = [...rendered].flatMap(([from, html]) =>
      hrefs(html).flatMap((h) => {
        const why = check(h)
        return why ? [`${from} → ${h} (${why})`] : []
      }),
    )
    expect(broken).toEqual([])
  })

  it('in the changelog', () => {
    const broken = changelog.flatMap((r) =>
      r.entries.flatMap((e) => hrefs(e.html).filter((h) => check(h))),
    )
    expect(broken).toEqual([])
  })

  it("in the site's own pages and components", () => {
    const files = appFiles(join(site, 'app'))
    expect(files.length).toBeGreaterThan(10)
    const broken = files.flatMap((file) =>
      sourceLinks(file).flatMap((h) => {
        const why = check(h)
        return why ? [`${relative(site, file)} → ${h} (${why})`] : []
      }),
    )
    expect(broken).toEqual([])
  })
})
