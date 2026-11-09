import platformsJson from '#app/generated/platforms.json'
import { findPackage } from '#app/lib/catalog'
import { guidesNav } from '#app/lib/content'
import type { MarkName } from '#components/creator-marks'

export interface PlatformEntry {
  type: string
  name: string
  shell: string
  /** The short line under the name on a tile. */
  label: string
  color: string
  side: 'client' | 'server'
  tagline: string
  summary: string
  targets: string[]
  command: string
  builtOn: string[]
  highlights: Array<{ title: string; text: string }>
  /** Highlighted at build time. */
  code: string
  run: Array<[string, string]>
  native: string[]
  nativeLabel: string
  alternative?: string
  packages: { native: string[]; other: string[] }
  kits: string[]
  docs: Array<{ title: string; url: string; description?: string }>
  guides: Array<{ title: string; description?: string; url: string }>
  resources: Array<{ title: string; url: string; text: string }>
}

export interface BuilderChoice {
  id: string
  type: string
  line: string
  cmd: string
  dev: string
  on?: boolean
  group?: string
}

export interface BuilderLine {
  html: string
  /** Shown while a choice of this platform type is on. */
  type?: string
  /** Shown while this choice is on. */
  id?: string
}

const data = platformsJson as unknown as {
  platforms: Array<Omit<PlatformEntry, 'docs' | 'guides'>>
  builder: { pre: string; lines: BuilderLine[]; choices: BuilderChoice[] }
}

/** The platform package's own pages: its guide first, then the rest. */
const docsOf = (type: string): PlatformEntry['docs'] =>
  (findPackage(type)?.pages ?? []).map((page) =>
    page.slug === ''
      ? {
          title: 'Platform guide',
          url: `/packages/${type}`,
          description: 'Install, configure, run and ship.',
        }
      : page.slug === 'api'
        ? {
            title: 'API reference',
            url: `/packages/${type}/api`,
            description: 'Every export, with its types.',
          }
        : { title: page.title, url: `/packages/${type}/${page.slug}`, description: '' },
  )

/** The guides whose frontmatter lists the platform, in the order of the guides index. */
const guidesOf = (type: string): PlatformEntry['guides'] =>
  guidesNav
    .flatMap((g) => g.items)
    .filter((g) => g.platforms.includes(type))
    .map((g) => ({ title: g.title, description: g.description, url: `/guides/${g.slug}` }))

export const platforms: PlatformEntry[] = data.platforms.map((p) => ({
  ...p,
  docs: docsOf(p.type),
  guides: guidesOf(p.type),
}))
export const builder = data.builder

export const findPlatform = (type: string) => platforms.find((p) => p.type === type)

/** Projects credited on each platform tile. */
export const platformMarks: Record<string, MarkName[]> = {
  web: ['vite', 'tanstack'],
  server: ['h3'],
  desktop: ['electron'],
  tauri: ['tauri'],
  mobile: ['capacitor'],
}
