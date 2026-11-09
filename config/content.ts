import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type CollectionConfig, defineConfig } from '@kitr/content'

/**
 * kitr.dev's pages are the markdown in a kitrjs/kitr checkout: $KITR_DIR, or .content/kitr
 * (`npm run content:fetch` clones it there; the Dockerfile does the same).
 */
const repo = process.env.KITR_DIR ?? '.content/kitr'

/**
 * One collection per package with docs, named after the package: `pkg-mail` is
 * packages/mail/docs, served under /packages/mail. Kits have no pages of their own.
 */
function packageCollections(): Record<string, CollectionConfig> {
  const collections: Record<string, CollectionConfig> = {}
  for (const dir of readdirSync(join(repo, 'packages')).sort()) {
    const file = join(repo, 'packages', dir, 'package.json')
    if (!existsSync(file)) continue
    const manifest = JSON.parse(readFileSync(file, 'utf8'))
    const kitr = manifest.kitr
    if (!kitr || kitr.kind === 'kit') continue
    const source = join(repo, 'packages', dir, kitr.docs ?? 'docs')
    if (!existsSync(source)) continue
    collections[`pkg-${kitr.name}`] = { source, url: `/packages/${kitr.name}`, title: kitr.title }
  }
  return collections
}

export default defineConfig({
  collections: {
    // docs/handbook/*.md at /docs/<slug>; its nav.json orders the sidebar and pulls in a few
    // files from docs/ (the CLI reference, kits, the package contract).
    docs: { source: `${repo}/docs/handbook`, url: '/docs', nav: 'nav.json' },
    // Walkthroughs that span several packages, at /guides/<slug>.
    guides: { source: `${repo}/docs/guides`, url: '/guides', nav: 'nav.json' },
    ...packageCollections(),
  },
  llms: {
    title: 'kitr',
    description:
      'One way to build everything. kitr is the opinionated TypeScript framework for web, mobile, desktop and backend apps: a thin layer over TanStack, React Hook Form, Zustand, ky, h3 and Tailwind, with one import surface, one data contract and one CLI.',
    url: 'https://kitr.dev',
  },
  editUrl: 'https://github.com/kitrjs/kitr/edit/main',
})
