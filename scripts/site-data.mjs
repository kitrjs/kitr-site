// The data kitr.dev shows besides its markdown pages. A `generate` step in kitrrc.ts, so it runs
// after kitr renders config/content.ts into .kitr/content, and writes app/generated (gitignored):
// - packages.json: `kitr catalog --json`, with each package's live examples and pages,
// - examples/<package>.json: the highlighted source files of each live example,
// - kits.json: what each kit sets up, from the published @kitr/kit-* packages,
// - planned.json: packages on the roadmap that have not shipped yet,
// - platforms.json: the catalog's platform prose, highlighted, with app/content/platforms.mjs,
// - release.json: the @kitr/kitr version the site documents, for the footer,
// - changelog.json: every package's Changesets CHANGELOG.md, one entry per release, for /changelog,
// and the share images in public/og.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderMarkdown } from '@kitr/content/markdown'
import { createHighlighter } from 'shiki'
import { builder, choices, order } from '../app/content/platforms.mjs'
import { ogImage, readCatalog, touchIcon } from './og.mjs'

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(site, process.env.KITR_DIR ?? '.content/kitr')
const generated = join(site, '.kitr/content')
const out = join(site, 'app/generated')
if (!existsSync(join(repo, 'packages')))
  throw new Error(
    `${repo} is not a kitrjs/kitr checkout. Run \`npm run content:fetch\`, or point KITR_DIR at one.`,
  )
if (!existsSync(join(generated, 'index.ts')))
  throw new Error('.kitr/content is missing: run `kitr generate`.')

const catalog = JSON.parse(
  execFileSync(join(site, 'node_modules/.bin/kitr'), ['catalog', '--json'], {
    cwd: site,
    encoding: 'utf8',
  }),
)
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
/** A collection's nav from `kitr generate`, or [] when it has none. */
const navOf = (collection) => {
  const file = join(generated, `${collection}.nav.json`)
  return existsSync(file) ? readJson(file) : []
}

const themes = { light: 'github-light-high-contrast', dark: 'github-dark' }
const highlighter = await createHighlighter({ themes: Object.values(themes), langs: ['ts', 'tsx'] })
const highlight = (code, lang) =>
  highlighter
    .codeToHtml(code, { lang, themes, defaultColor: false })
    .replace('<pre ', `<pre data-lang="${lang}" `)

rmSync(out, { recursive: true, force: true })
rmSync(join(site, 'public/og'), { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const write = (file, data) => writeFileSync(join(out, file), JSON.stringify(data, null, 2))

// ---------------------------------------------------------------- packages

/**
 * A package's pages from its collection: overview.md is the package's landing page
 * (/packages/<name>), index.md its guide (/packages/<name>/guide), and any other file keeps
 * its name (api.md at /packages/<name>/api).
 */
const pagesOf = (name) =>
  navOf(`pkg-${name}`)
    .flatMap((group) => group.items)
    .map((item) =>
      item.slug === 'overview'
        ? { slug: '', title: 'Overview' }
        : item.slug === 'index'
          ? { slug: 'guide', title: 'Guide' }
          : { slug: item.slug, title: item.title },
    )

const metaBlock = /\n*export const meta = (\{[\s\S]*?\n\})\n*/

/**
 * The files behind an example, as the code panel beside its demo shows them: the example itself,
 * then every file it imports with a relative path, depth first. `path` is relative to the examples
 * folder. An example's own files live in a folder named after it, laid out as in an app
 * (`percentage-rollout/config/flags.ts`), so `name` drops that folder: `config/flags.ts`. The
 * `meta` export describes the example to the site, so the panel leaves it out.
 */
function sourcesOf(dir, entry) {
  const own = `${entry.replace(/\.tsx$/, '')}/`
  const files = []
  const visit = (path) => {
    if (files.some((f) => f.path === path)) return
    const code = readFileSync(join(dir, path), 'utf8').replace(metaBlock, '\n\n').trim()
    const name = path.startsWith(own) ? path.slice(own.length) : path
    const html = highlight(code, path.endsWith('.tsx') ? 'tsx' : 'ts')
    files.push({ path, name, code: `${code}\n`, html })
    for (const [, spec] of code.matchAll(
      /^(?:import|export)\b[^'"]*?from\s+['"](\.\.?\/[^'"]+)['"]/gm,
    )) {
      const base = join(dirname(path), spec)
      const target = ['', '.tsx', '.ts', '/index.tsx', '/index.ts']
        .map((ext) => base + ext)
        .find((p) => /\.tsx?$/.test(p) && existsSync(join(dir, p)))
      if (!target) throw new Error(`${join(dir, path)} imports ${spec}, which is not in examples/`)
      visit(target)
    }
  }
  visit(entry)
  return files
}

/** The live examples in packages/<name>/examples, each with the `meta` it exports. */
const examplesDir = (name) => join(repo, 'packages', name, 'examples')
const exampleFiles = (name) =>
  existsSync(examplesDir(name))
    ? readdirSync(examplesDir(name)).filter((f) => f.endsWith('.tsx'))
    : []
const examplesOf = (name) =>
  exampleFiles(name).map((f) => {
    const meta = readFileSync(join(examplesDir(name), f), 'utf8').match(metaBlock)
    return { slug: f.replace(/\.tsx$/, ''), ...(meta ? Function(`return ${meta[1]}`)() : {}) }
  })

const packages = [...catalog.packages, ...catalog.platforms]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ platform: _, setup: __, ...entry }) => ({
    ...entry,
    pages: pagesOf(entry.name),
    examples: examplesOf(entry.name),
  }))
write('packages.json', packages)

// Each package's example sources in a file of their own, loaded only by its page.
mkdirSync(join(out, 'examples'))
for (const { name } of packages) {
  const files = exampleFiles(name)
  if (!files.length) continue
  write(
    `examples/${name}.json`,
    Object.fromEntries(
      files.map((f) => [f.replace(/\.tsx$/, ''), sourcesOf(examplesDir(name), f)]),
    ),
  )
}

// Planned packages from the package map; a package that has shipped wins.
const shipped = new Set(packages.map((p) => p.name))
const roadmap = readJson(join(site, 'app/content/roadmap.json'))
write(
  'planned.json',
  roadmap.packages.filter((p) => !shipped.has(p.name)),
)

// ---------------------------------------------------------------- kits

// The catalog lists the kits; each kit's built setup module says what it sets up.
const kits = [
  {
    name: 'blank',
    text: 'The wiring files and nothing else: no platform, no React, no server. kitr add brings each.',
    platforms: [],
    packages: [],
    components: 0,
  },
]
const kitOrder = [
  'app',
  'fullstack',
  'server',
  'saas',
  'site',
  'realtime',
  'desktop',
  'tauri',
  'mobile',
]
for (const name of kitOrder) {
  const entry = catalog.kits.find((k) => k.name === name)
  const dist = join(site, 'node_modules/@kitr', `kit-${name}`, 'dist/kitr.js')
  if (!entry || !existsSync(dist))
    throw new Error(`The ${name} kit is missing: npm install @kitr/kit-${name}`)
  const { kit } = (await import(pathToFileURL(dist).href)).default
  kits.push({
    name,
    text: kit.description ?? entry.summary,
    platforms: Object.entries(kit.platforms ?? {}).map(([n, p]) => `${n}: ${p.type}`),
    packages: kit.packages.map((p) => (typeof p === 'string' ? p : p.name)),
    components: kit.components?.length ?? 0,
  })
}
write('kits.json', kits)

// ---------------------------------------------------------------- platforms

/** Shiki output split into one HTML string per line, keeping the <pre> tag. */
function splitLines(html) {
  const pre = html.match(/^<pre[^>]*>/)[0]
  const inner = html
    .slice(pre.length)
    .replace(/^<code>/, '')
    .replace(/<\/code><\/pre>$/, '')
  return { pre, lines: inner.split('\n') }
}

const platforms = order.map((type) => {
  const entry = catalog.platforms.find((p) => p.name === type)
  if (!entry) throw new Error(`kitr catalog has no ${type} platform`)
  const { snippet, ...prose } = entry.platform
  const own = choices[type]
  const sides = entry.runsOn === 'server' ? ['server', 'both'] : ['client', 'both']
  const eligible = packages.filter(
    (e) => !e.kind && !e.included && sides.includes(e.runsOn) && !own.exclude.includes(e.name),
  )
  const native = own.native.filter((n) => eligible.some((e) => e.name === n))
  return {
    ...prose,
    type,
    name: entry.title,
    side: entry.runsOn === 'server' ? 'server' : 'client',
    summary: entry.summary,
    builtOn: entry.builtOn ?? [],
    code: highlight(snippet, snippet.includes('</') ? 'tsx' : 'ts'),
    native: own.native,
    nativeLabel: own.nativeLabel,
    kits: own.kits,
    packages: {
      native,
      other: eligible.filter((e) => !native.includes(e.name)).map((e) => e.name),
    },
  }
})

// The kitrrc.ts the mix-and-match builder shows, one highlighted line per entry.
const source = [
  ['// kitrrc.ts', null],
  ["import { defineKitrConfig } from '@kitr/kitr/app'", null],
  ...['desktop', 'mobile', 'server', 'tauri', 'web'].map((t) => [
    `import { ${t} } from '@kitr/${t}'`,
    { type: t },
  ]),
  ['', null],
  ['export default defineKitrConfig({', null],
  ['  platforms: {', null],
  ...builder.choices.map((c) => [`    ${c.line}`, { id: c.id }]),
  ['  },', null],
  ['})', null],
]
const { pre, lines } = splitLines(highlight(source.map(([l]) => l).join('\n'), 'ts'))
write('platforms.json', {
  platforms,
  builder: {
    pre,
    lines: source.map(([, show], i) => ({ html: lines[i], ...(show ?? {}) })),
    choices: builder.choices,
  },
})

// ---------------------------------------------------------------- share images (og:image)

const icons = readCatalog(site)
const tileFor = (name, category) => ({
  icon: icons.glyphs[name] ?? 'Package01Icon',
  color: icons.colors[category]?.color ?? '#94A3B8',
})
const seoPages = [
  {
    path: '/',
    title: 'One way to build everything',
    description: 'The opinionated TypeScript framework for web, mobile, desktop and backend apps.',
    display: true,
  },
  {
    path: '/packages',
    title: 'Packages',
    description: `${packages.length} packages and platforms, each a single kitr add away.`,
  },
  {
    path: '/guides',
    title: 'Guides',
    description:
      'Step-by-step walkthroughs: build an app, add sign-in and live updates, test and deploy it, write a package, and move to kitr.',
    kind: 'Guides',
  },
  {
    path: '/platforms',
    title: 'Platforms',
    description: 'Web, server, desktop and mobile from one app. Mix them in one project.',
    kind: 'Platforms',
  },
  ...platforms.map((p) => ({
    path: `/platforms/${p.type}`,
    title: p.type === 'desktop' ? 'Desktop with Electron' : p.name,
    description: p.tagline,
    kind: `Platform · ${p.targets.join(', ')}`,
    tile: { icon: icons.glyphs[p.type] ?? 'Package01Icon', color: p.color },
  })),
  {
    path: '/about',
    title: 'A box of parts that fit together',
    description: 'Why kitr exists, the ideas behind it, the brand and who makes it.',
    kind: 'About',
  },
  {
    path: '/changelog',
    title: 'Changelog',
    description: 'What changed in each release of kitr, newest first.',
    kind: 'Releases',
  },
]
for (const entry of packages) {
  const kind = `Package · ${icons.colors[entry.category]?.label ?? entry.category}`
  const tile = tileFor(entry.name, entry.category)
  seoPages.push({
    path: `/packages/${entry.name}`,
    title: entry.title,
    description: entry.summary,
    kind,
    tile,
  })
  for (const page of entry.pages.filter((p) => p.slug))
    seoPages.push({
      path: `/packages/${entry.name}/${page.slug}`,
      title: `${entry.title} ${page.title}`,
      description: entry.summary,
      kind,
      tile,
    })
}
for (const [collection, label] of [
  ['docs', 'Docs'],
  ['guides', 'Guide'],
])
  for (const group of navOf(collection))
    for (const item of group.items)
      seoPages.push({
        path: `/${collection}/${item.slug}`,
        title: item.title,
        description: item.description,
        kind: `${label} · ${group.title}`,
      })

// ---------------------------------------------------------------- release and changelog

/** The CLI's version: the release the site documents, shown in the footer. */
const release = {
  name: '@kitr/kitr',
  version: readJson(join(repo, 'packages/kitr/package.json')).version,
}
write('release.json', release)

/**
 * A Changesets CHANGELOG.md as releases: `- abc1234: text` entries under `### Major|Minor|Patch
 * Changes`, with their indented continuation lines. Dependency bumps ("Updated dependencies",
 * "- @kitr/x@1.0.0") are not entries.
 */
function parseChangelog(source) {
  const releases = []
  let current
  let kind
  let entry
  for (const line of source.split('\n')) {
    const version = line.match(/^## (\d+\.\d+\.\d+\S*)/)
    const heading = line.match(/^### (Major|Minor|Patch) Changes/)
    const item = line.match(/^- ([0-9a-f]{7,}): (.*)$/)
    if (version) {
      current = { version: version[1], entries: [] }
      releases.push(current)
      entry = undefined
    } else if (heading) {
      kind = heading[1].toLowerCase()
      entry = undefined
    } else if (item && current) {
      entry = { hash: item[1], kind, text: item[2] }
      current.entries.push(entry)
    } else if (/^- /.test(line) || /^#/.test(line)) entry = undefined
    else if (entry && /^ {2}/.test(line) && !/^ {2}- /.test(line))
      entry.text += `\n${line.slice(2)}`
  }
  return releases
}

const semverDesc = (a, b) => {
  const pa = a.split(/[.-]/).map(Number)
  const pb = b.split(/[.-]/).map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i]
  return 0
}
const kindRank = { major: 0, minor: 1, patch: 2 }
const entryHtml = async (text) =>
  (await renderMarkdown(text.trim())).blocks
    .map((b) => (b.type === 'html' ? b.html : `<pre><code>${b.cmd}</code></pre>`))
    .join('')

const releases = new Map()
for (const dir of readdirSync(join(repo, 'packages')).sort()) {
  const file = join(repo, 'packages', dir, 'CHANGELOG.md')
  const manifest = join(repo, 'packages', dir, 'package.json')
  if (!existsSync(file) || !existsSync(manifest)) continue
  const name = readJson(manifest).name
  const short = name.replace(/^@kitr\//, '')
  const pkg = { name, to: shipped.has(short) ? `/packages/${short}` : undefined }
  for (const r of parseChangelog(readFileSync(file, 'utf8'))) {
    if (!releases.has(r.version)) releases.set(r.version, { published: [], entries: new Map() })
    const rel = releases.get(r.version)
    rel.published.push(pkg)
    // One changeset often touches several packages: list the change once, with all of them.
    for (const e of r.entries) {
      if (!rel.entries.has(e.hash))
        rel.entries.set(e.hash, { hash: e.hash, kind: e.kind, text: e.text, packages: [] })
      const known = rel.entries.get(e.hash)
      if (kindRank[e.kind] < kindRank[known.kind]) known.kind = e.kind
      known.packages.push(pkg)
    }
  }
}
const changelog = []
for (const [version, r] of [...releases].sort(([a], [b]) => semverDesc(a, b))) {
  const entries = [...r.entries.values()].sort((a, b) => kindRank[a.kind] - kindRank[b.kind])
  changelog.push({
    version,
    id: `v${version.replace(/\./g, '-')}`,
    published: r.published,
    entries: await Promise.all(
      entries.map(async ({ text, ...e }) => ({ ...e, html: await entryHtml(text) })),
    ),
  })
}
write('changelog.json', changelog)

mkdirSync(join(site, 'public/og'), { recursive: true })
const ogId = (path) => (path === '/' ? 'home' : path.slice(1).replace(/\//g, '-'))
await Promise.all(
  seoPages.map(async (p) =>
    writeFileSync(join(site, 'public/og', `${ogId(p.path)}.png`), await ogImage(p, site)),
  ),
)
writeFileSync(join(site, 'public/apple-touch-icon.png'), await touchIcon(site))

console.log(
  `kitr.dev data: ${packages.length} packages, ${platforms.length} platforms, ${kits.length} kits, ${seoPages.length} share images`,
)
