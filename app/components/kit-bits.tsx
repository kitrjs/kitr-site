import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { findKit, type KitEntry } from '#app/lib/catalog'
import { repoUrl } from './chrome'
import { CommandLine } from './command'
import { Icon, icons } from './icons'
import { Tile } from './package-bits'

/** A kit's tile: the kits colour and its own glyph, like a package's. */
export function KitTile({ kit, size = 44 }: { kit: Pick<KitEntry, 'name'>; size?: number }) {
  return <Tile pkg={{ name: `kit-${kit.name}`, category: 'kits' }} size={size} />
}

/** `site: web({ mode: 'spa' })` as `site · web spa`: the name, the type and the mode if set. */
export const platformLabel = (p: KitEntry['platforms'][number]) => {
  const mode = p.options.match(/mode: '(\w+)'/)?.[1]
  return { name: p.name, type: p.type, mode }
}

const chip =
  'inline-flex h-6.5 items-center gap-1 rounded-full border border-border px-2.5 font-mono text-[12.5px] leading-none whitespace-nowrap text-foreground no-underline'
const chipLink = cn(
  chip,
  'transition-colors duration-120 hover:border-foreground hover:text-foreground',
)

/** The platforms a kit sets up, each linking to its platform page. */
export function PlatformChips({ kit }: { kit: KitEntry }) {
  if (!kit.platforms.length) return <span className={cn(chip, 'text-muted-foreground')}>none</span>
  return (
    <>
      {kit.platforms.map((p) => {
        const { name, type, mode } = platformLabel(p)
        return (
          <Link key={name} to="/platforms/$type" params={{ type }} className={chipLink}>
            <span className="text-muted-foreground">{name}:</span> {type}
            {mode && <span className="text-muted-foreground">{mode}</span>}
          </Link>
        )
      })}
    </>
  )
}

/** The packages a kit adds, each linking to its page. */
export function PackageChips({ names, max }: { names: string[]; max?: number }) {
  const shown = max ? names.slice(0, max) : names
  return (
    <>
      {shown.map((name) => (
        <Link key={name} to="/packages/$name" params={{ name }} className={chipLink}>
          {name}
        </Link>
      ))}
      {shown.length < names.length && (
        <span className={cn(chip, 'border-transparent px-1 text-muted-foreground')}>
          +{names.length - shown.length} more
        </span>
      )}
    </>
  )
}

/** "11 components · 42 files" for a card's foot. */
export const kitCounts = (kit: KitEntry) =>
  [
    kit.packages.length && `${kit.packages.length} packages`,
    kit.components.length && `${kit.components.length} components`,
    `${kit.files.length} files`,
  ]
    .filter(Boolean)
    .join(' · ')

const facts = 'grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2.5'
const factName = 'text-[13px] leading-6.5 text-muted-foreground'
const factValue = 'flex min-w-0 flex-wrap gap-1.5'

/**
 * A base kit on /kits: what it is and who it is for, what it sets up, the command, and links to
 * its page and its source. The title links to the page; the chips link on to platforms and packages.
 */
export function KitCard({ kit, featured = false }: { kit: KitEntry; featured?: boolean }) {
  return (
    <article
      id={kit.name}
      className={cn(
        'flex scroll-mt-24 flex-col gap-4 rounded-[18px] border border-border bg-background p-5.5 max-phone:p-4',
        featured && 'border-foreground',
      )}
    >
      <header className="flex items-start gap-3.5">
        <KitTile kit={kit} size={48} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[22px] leading-7">
            <Link
              to="/kits/$name"
              params={{ name: kit.name }}
              className="font-mono text-foreground no-underline hover:text-link"
            >
              {kit.name}
            </Link>
            {featured && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[12px] leading-5 font-semibold text-primary-foreground">
                Start here
              </span>
            )}
          </h3>
          <p className="text-[15px] leading-[23px] text-muted-foreground">{kit.summary}</p>
        </div>
      </header>
      <p className="rounded-md bg-muted px-3.5 py-2.5 text-[14.5px] leading-[22px]">
        <span className="font-semibold">For: </span>
        {kit.audience}
      </p>
      <dl className={facts}>
        <dt className={factName}>Platforms</dt>
        <dd className={factValue}>
          <PlatformChips kit={kit} />
        </dd>
        <dt className={factName}>Packages</dt>
        <dd className={factValue}>
          {kit.packages.length ? (
            <PackageChips names={kit.packages} max={featured ? undefined : 8} />
          ) : (
            <span className={cn(chip, 'text-muted-foreground')}>none</span>
          )}
        </dd>
        {kit.components.length > 0 && (
          <>
            <dt className={factName}>Components</dt>
            <dd className="text-[14px] leading-6.5">
              {kit.components.length} in <code className="text-[12.5px]">app/components/ui</code>
            </dd>
          </>
        )}
      </dl>
      <div className="mt-auto flex flex-col gap-3 pt-1">
        <CommandLine cmd={`kitr new my-app --kit ${kit.name}`} />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[14px]">
          <Link
            to="/kits/$name"
            params={{ name: kit.name }}
            className="inline-flex items-center gap-1.5 font-semibold no-underline"
          >
            See all {kit.files.length} files
            <Icon icon={icons.arrow} size={16} />
          </Link>
          <SourceLink kit={kit} />
        </div>
      </div>
    </article>
  )
}

/** A preset on /kits: smaller, with the kit it builds on. */
export function PresetCard({ kit }: { kit: KitEntry }) {
  const base = kit.base ? findKit(kit.base) : undefined
  return (
    <article
      id={kit.name}
      className="relative flex scroll-mt-24 flex-col gap-3 rounded-lg border border-border bg-background p-4.5 transition-[translate,border-color,box-shadow] duration-200 ease-out has-[a[data-cover]:hover]:-translate-y-px has-[a[data-cover]:hover]:border-border-strong has-[a[data-cover]:hover]:shadow-md max-phone:p-4"
    >
      <header className="flex items-center gap-3">
        <KitTile kit={kit} size={40} />
        <div className="flex min-w-0 flex-col">
          <h3 className="text-[18px] leading-6">
            <Link
              to="/kits/$name"
              params={{ name: kit.name }}
              data-cover
              className="font-mono text-foreground no-underline after:absolute after:inset-0 after:rounded-lg after:content-['']"
            >
              {kit.name}
            </Link>
          </h3>
          {base && (
            <span className="text-[13px] leading-5 text-muted-foreground">
              Built on <span className="font-mono">{base.name}</span>
            </span>
          )}
        </div>
      </header>
      <p className="flex-auto text-[14.5px] leading-[22px] text-muted-foreground">{kit.summary}</p>
      {/* The chips and the command sit above the card's cover link, so they stay usable. */}
      <span className="relative z-1 flex flex-wrap gap-1.5">
        <PlatformChips kit={kit} />
      </span>
      <CommandLine cmd={`kitr new my-app --kit ${kit.name}`} className="relative z-1" />
    </article>
  )
}

/** The kit's output in the kitr repository, on GitHub. */
export const sourceUrl = (kit: Pick<KitEntry, 'example'>, path?: string) =>
  `${repoUrl}/${path ? 'blob' : 'tree'}/main/${kit.example}${path ? `/${path}` : ''}`

export function SourceLink({ kit, className }: { kit: KitEntry; className?: string }) {
  return (
    <a
      href={sourceUrl(kit)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-muted-foreground no-underline hover:text-link',
        className,
      )}
    >
      <Icon icon={icons.github} size={16} />
      Source
    </a>
  )
}
