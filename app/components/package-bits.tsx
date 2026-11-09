import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import {
  categories,
  glyph,
  type PackageEntry,
  type PlannedEntry,
  plannedStatus,
  type RunsOn,
  runsOn,
} from '#app/lib/catalog'
import { creditsFor, upstream } from '#app/lib/upstream'
import { CreatorMark } from './creator-marks'
import { Icon } from './icons'

export function Tile({
  pkg,
  size = 44,
  className,
}: {
  pkg: Pick<PackageEntry, 'name' | 'category'>
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex flex-none items-center justify-center rounded-[34%]', className)}
      style={{ width: size, height: size, background: categories[pkg.category].color }}
    >
      <Icon
        icon={glyph(pkg.name)}
        size={Math.round(size * 0.55)}
        stroke="#0B121C"
        strokeWidth={1.6}
      />
    </span>
  )
}

/** A rounded label. On a directory card it is a size smaller (`in-data-card:`). */
const badge =
  'inline-flex h-6 items-center gap-[5px] rounded-full px-[9px] text-[12px] leading-none font-semibold whitespace-nowrap text-[#0b121c] in-data-card:h-5.5 in-data-card:text-[11.5px]'

export function CategoryBadge({ category }: { category: PackageEntry['category'] }) {
  return (
    <span className={badge} style={{ background: categories[category].color }}>
      {categories[category].label}
    </span>
  )
}

const runsTone = {
  client: 'bg-client text-client-foreground',
  server: 'bg-server text-server-foreground',
} as const

/**
 * Where a package runs: a tinted Client or Server badge. Packages that run on both get one badge
 * with a Client half and a Server half that meet on a diagonal seam between the words.
 */
export function RunsOnBadge({ value }: { value: RunsOn }) {
  if (value === 'both')
    return (
      <span
        className={cn(badge, 'gap-0 overflow-hidden px-0 font-medium')}
        title="Runs on the client and the server"
      >
        <span className={cn(runsTone.client, 'inline-flex h-full items-center pr-[11px] pl-[9px]')}>
          Client
        </span>
        <span className="sr-only"> and </span>
        <span
          className={cn(
            runsTone.server,
            '-ml-[7px] inline-flex h-full items-center pr-[9px] pl-3 [clip-path:polygon(7px_0,100%_0,100%_100%,0_100%)]',
          )}
        >
          Server
        </span>
      </span>
    )
  return (
    <span className={cn(badge, 'font-medium', runsTone[value])} title={`Runs on the ${value}`}>
      {runsOn[value].label}
    </span>
  )
}

/** Credits on a directory card: the marks of the projects a package is built on. */
function Credits({ builtOn }: { builtOn?: string[] }) {
  const credits = creditsFor(builtOn).filter((c) => c.mark && c.mark !== 'kitr')
  if (!credits.length) return null
  const by = credits.map((c) => c.name).join(' and ')
  return (
    <span
      className="inline-flex flex-none gap-1.5 text-foreground opacity-55"
      title={`Built on ${by}`}
    >
      <span className="sr-only">Built on {by}</span>
      {credits.map((c) => (
        <CreatorMark key={c.name} name={c.mark!} size={18} />
      ))}
    </span>
  )
}

/** The grid of directory cards on /packages and the platform pages. */
export const cardGrid =
  'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 max-phone:grid-cols-1 max-phone:gap-2.5'

const card =
  'flex items-start gap-3.5 rounded-lg border border-border bg-background p-4 text-foreground no-underline max-phone:p-3.5'
const cardTop = 'flex min-h-6 items-center gap-2'
const cardName =
  'min-w-0 flex-auto overflow-hidden font-mono text-[16px] leading-[22px] font-semibold text-ellipsis'
const cardSummary = 'line-clamp-3 text-[14.5px] leading-[21px] text-muted-foreground'
const badges = 'mt-1 flex flex-wrap items-center gap-1.5'

/** One package in the directory: tile, name, a three-line summary, then where it runs. */
export function DirectoryCard({
  pkg,
  showCategory = false,
}: {
  pkg: PackageEntry
  showCategory?: boolean
}) {
  return (
    <Link
      to="/packages/$name"
      params={{ name: pkg.name }}
      data-card
      className={cn(
        card,
        'transition-[translate,border-color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-border-strong hover:text-foreground hover:shadow-md focus-visible:-translate-y-px focus-visible:border-border-strong focus-visible:text-foreground focus-visible:shadow-md',
      )}
    >
      <Tile pkg={pkg} size={40} />
      <span className="flex min-w-0 flex-auto flex-col gap-1.5">
        <span className={cardTop}>
          <span className={cardName}>{pkg.name}</span>
          <Credits builtOn={pkg.builtOn} />
        </span>
        <span className={cardSummary}>{pkg.summary}</span>
        <span className={badges}>
          {showCategory && <CategoryBadge category={pkg.category} />}
          <RunsOnBadge value={pkg.runsOn} />
        </span>
      </span>
    </Link>
  )
}

/** Not built yet: no link, a status badge, and what it will replace. */
export function PlannedCard({ pkg }: { pkg: PlannedEntry }) {
  return (
    <article
      className={cn(card, 'scroll-mt-[150px] border-dashed bg-muted')}
      id={pkg.name}
      data-card
    >
      <Tile pkg={pkg} size={40} className="opacity-75" />
      <span className="flex min-w-0 flex-auto flex-col gap-1.5">
        <span className={cardTop}>
          <span className={cardName}>{pkg.name}</span>
          <span
            className={cn(
              badge,
              'border border-border bg-transparent text-muted-foreground',
              pkg.status === 'building' && 'border-link text-link',
            )}
          >
            {plannedStatus[pkg.status].label}
          </span>
        </span>
        <span className={cardSummary}>{pkg.summary}</span>
        {pkg.replaces?.length ? (
          <span className="text-[13.5px] leading-5 text-muted-foreground">
            Replaces{' '}
            {pkg.replaces.map((r, i) => (
              <span key={r}>
                {i > 0 && (i === pkg.replaces!.length - 1 ? ' and ' : ', ')}
                <code>{r}</code>
              </span>
            ))}
          </span>
        ) : null}
        <span className={badges}>
          <CategoryBadge category={pkg.category} />
          <RunsOnBadge value={pkg.runsOn} />
        </span>
      </span>
    </article>
  )
}

/** "Built on" and a pill for each upstream library, linking to its site. */
export function BuiltOn({ keys }: { keys: string[] }) {
  const pill =
    'inline-flex min-h-6.5 items-center gap-1.5 rounded-full border border-border px-2.5 font-medium text-foreground no-underline transition-[border-color] duration-150'
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 pl-1 text-[13px]">
      <span className="text-muted-foreground">Built on</span>
      {keys.map((key) => {
        const u = upstream(key)
        const inner = (
          <>
            {u.mark && <CreatorMark name={u.mark} size={14} />}
            {u.name}
          </>
        )
        return u.url ? (
          <a
            key={key}
            className={cn(pill, 'hover:border-foreground hover:text-foreground')}
            href={u.url}
            target="_blank"
            rel="noreferrer"
          >
            {inner}
          </a>
        ) : (
          <span key={key} className={pill}>
            {inner}
          </span>
        )
      })}
    </span>
  )
}
