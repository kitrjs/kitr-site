import { getRouteApi, Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import type { CSSProperties } from 'react'
import { type Category, categories, findPackage, glyph, type PackageEntry } from '#app/lib/catalog'
import { type PlatformEntry, platforms } from '#app/lib/platforms'
import { Command } from '#components/command'
import { Icon, icons } from '#components/icons'
import { BuiltOn, cardGrid, DirectoryCard, Tile } from '#components/package-bits'
import { codePanel, PlatformTile, Rich } from '#components/platform-bits'
import { buttonVariants } from '#components/ui/button'

/** Two columns: the words, then a command, a table or a terminal. */
const split =
  'grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-12 max-tablet:grid-cols-1 max-tablet:gap-7'
const sectionTitle = 'mb-2 text-[28px] leading-[34px]'
const sectionHead = 'mb-2 flex flex-wrap items-end justify-between gap-4'
const learnLink =
  'flex flex-col gap-0.5 rounded-[14px] border border-border px-4 py-3.5 text-foreground no-underline transition-[translate,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground hover:text-foreground [&_code]:text-[0.9em] [&_span]:text-[14px] [&_span]:leading-[21px] [&_strong]:inline-flex [&_strong]:items-center [&_strong]:gap-1.5 [&_strong]:text-[16px] [&_strong]:leading-6 [&_strong]:font-semibold'
const cell = 'border-b border-border px-4 py-3 text-left align-middle'
const head = 'font-mono text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase'
/** The column of the platform this page is about. */
const thisColumn = 'bg-muted text-foreground'

const route = getRouteApi('/_site/platforms/$type')

const resolve = (names: string[]) =>
  names.map(findPackage).filter((p): p is PackageEntry => Boolean(p))

/** Electron and Tauri side by side, on both desktop pages. */
const shells = [
  ['Ships with', 'Its own Chromium', 'The OS webview'],
  ['Installer size', 'Larger (a browser inside)', 'Small'],
  ['Rendering', 'Identical on every OS', 'Can differ between OSes'],
  ['Native side', 'Node, over typed IPC', 'Rust commands and events'],
  ['Build needs', 'Node only', 'The Rust toolchain'],
] as const

export default function PlatformPage() {
  const { platform: p } = route.useLoaderData()
  const native = resolve(p.packages.native)
  const other = resolve(p.packages.other)
  const groups = (Object.keys(categories) as Category[])
    .map((c) => ({ category: c, list: other.filter((pkg) => pkg.category === c) }))
    .filter((g) => g.list.length)
  const others = platforms.filter((x) => x.type !== p.type)
  const kits = p.kits
  const lower = p.type === 'tauri' ? p.name : p.name.toLowerCase()

  return (
    <main
      className="container flex flex-col gap-(--section-gap) pt-10 max-phone:pt-6"
      style={{ '--platform': p.color } as CSSProperties}
    >
      <nav
        className="-mb-12 flex gap-2 font-mono text-[13px] text-muted-foreground max-phone:-mb-8"
        aria-label="Breadcrumb"
      >
        <Link to="/platforms" className="text-muted-foreground hover:text-foreground">
          Platforms
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <section className="grid grid-cols-[minmax(0,6fr)_minmax(0,5fr)] items-center gap-14 max-tablet:grid-cols-1 max-tablet:gap-7 [&_code]:text-[0.9em]">
        <div className="flex min-w-0 flex-col items-start gap-4.5">
          <div className="flex items-center gap-3.5">
            <span
              className="inline-flex size-16 flex-none items-center justify-center rounded-[34%]"
              style={{ background: p.color }}
            >
              <Icon icon={glyph(p.type)} size={34} stroke="#0B121C" />
            </span>
            <span className="label">
              Platform · <span className="font-mono">{p.type}</span>
            </span>
          </div>
          <h1 className="font-display text-[60px] leading-16 font-normal tracking-normal max-phone:text-[38px] max-phone:leading-11 max-[640px]:text-[40px]">
            {p.name}
          </h1>
          <p className="lede">{p.tagline}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Runs on">
            {p.targets.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border px-3 py-0.5 font-mono text-[13px] leading-6"
              >
                {t}
              </li>
            ))}
          </ul>
          <Command cmd={p.command} className="m-0 w-full max-w-140" />
          <div className="flex flex-wrap gap-3">
            <Link
              to="/packages/$name"
              params={{ name: p.type }}
              className={buttonVariants({ variant: 'primary' })}
            >
              Read the {lower} guide
            </Link>
            <a href="#packages" className={buttonVariants()}>
              What works here
            </a>
          </div>
          <BuiltOn keys={p.builtOn} />
        </div>
        <div
          className={cn(codePanel, '[&_.shiki]:text-[13.5px] [&_.shiki]:leading-[22px]')}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted at build time
          dangerouslySetInnerHTML={{ __html: p.code }}
        />
      </section>

      <section
        className="grid grid-cols-4 gap-8 border-t border-border pt-8 max-tablet:grid-cols-2 max-phone:grid-cols-1"
        aria-label={`What ${p.name} gives you`}
      >
        {p.highlights.map((h) => (
          <div key={h.title}>
            <h2 className="mb-2 text-[18px] leading-6">{h.title}</h2>
            <p className="text-[15px] leading-6 text-muted-foreground [&_code]:text-[0.9em]">
              <Rich text={h.text} />
            </p>
          </div>
        ))}
      </section>

      <section className={split} aria-labelledby="run-title">
        <div>
          <h2 id="run-title" className={sectionTitle}>
            Same commands as every platform
          </h2>
          <p className="mb-3 text-muted-foreground">
            Every platform answers to <code>kitr dev</code>, <code>kitr build</code> and{' '}
            <code>kitr start</code>, by the name you gave it. Leave the name off to run them all.
          </p>
        </div>
        <dl className="rounded-[14px] border border-[#243244] bg-[#0b121c] py-2 font-mono text-[13.5px] leading-[22px] text-[#eef2f7]">
          {p.run.map(([cmd, what]) => (
            <div
              key={cmd}
              className="grid grid-cols-[minmax(150px,auto)_minmax(0,1fr)] gap-5 px-5.5 py-2 max-phone:grid-cols-1 max-phone:gap-0 max-phone:px-4"
            >
              <dt className="before:text-[#9aa7b8] before:content-['$_']">{cmd}</dt>
              <dd className="text-[#9aa7b8]">{what}</dd>
            </div>
          ))}
        </dl>
      </section>

      {p.alternative && <ShellCompare current={p} />}

      <section id="packages" aria-labelledby="packages-title">
        <div className={sectionHead}>
          <div>
            <h2 id="packages-title" className={sectionTitle}>
              Packages that work here
            </h2>
            <p className="text-muted-foreground">
              {native.length + other.length} packages run on {lower}. Each one is a single{' '}
              <code>kitr add</code> away.
            </p>
          </div>
          <Link to="/packages">All packages →</Link>
        </div>
        {native.length > 0 && (
          <div className="mt-8 rounded-[22px] bg-muted p-6 shadow-[inset_4px_0_0_var(--platform,var(--color-border))] max-phone:px-3.5 max-phone:py-4.5">
            <h3 className="mb-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[18px] leading-6">
              {p.nativeLabel}
              <span className="text-[15px] font-normal text-muted-foreground">
                {p.side === 'server'
                  ? 'Server-only packages for your API.'
                  : p.type === 'web'
                    ? 'Only meaningful where pages are HTML.'
                    : 'Their drivers switch to the native APIs underneath, with no code change.'}
              </span>
            </h3>
            <div className={cardGrid}>
              {native.map((pkg) => (
                <DirectoryCard key={pkg.name} pkg={pkg} showCategory />
              ))}
            </div>
          </div>
        )}
        <div className="mt-9 columns-[3_300px] gap-x-10">
          {groups.map((g) => (
            <div key={g.category} className="mb-7 break-inside-avoid">
              <h3 className="label mb-2 flex items-center gap-2">
                <span
                  className="size-[9px] rounded-full"
                  style={{ background: categories[g.category].color }}
                />
                {categories[g.category].label}
              </h3>
              <ul>
                {g.list.map((pkg) => (
                  <li key={pkg.name}>
                    <Link
                      to="/packages/$name"
                      params={{ name: pkg.name }}
                      className="-mx-2.5 flex items-start gap-3 rounded-lg px-2.5 py-2 text-foreground no-underline hover:bg-muted hover:text-foreground"
                    >
                      <Tile pkg={pkg} size={32} />
                      <span className="flex min-w-0 flex-col text-[14px] leading-5">
                        <span className="font-mono text-[15px] leading-[22px] font-medium">
                          {pkg.name}
                        </span>
                        <span className="text-muted-foreground">{pkg.summary}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="learn-title">
        <h2 id="learn-title" className={sectionTitle}>
          Learn more
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-6 max-phone:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="label">Guides</span>
            {p.guides.length ? (
              <>
                {p.guides.slice(0, 4).map((g) => (
                  <Link key={g.url} to={g.url} className={learnLink}>
                    <strong>{g.title}</strong>
                    {g.description && (
                      <span className="text-muted-foreground">{g.description}</span>
                    )}
                  </Link>
                ))}
                {p.guides.length > 4 && (
                  <Link to="/guides" className="mt-1 self-start text-[14px]">
                    All {p.guides.length} guides →
                  </Link>
                )}
              </>
            ) : (
              <p className="rounded-[14px] border border-dashed border-border px-4 py-3.5 text-[14px] leading-[21px] text-muted-foreground">
                A step-by-step guide for {lower} is being written. Until then the platform guide
                below walks through it.
              </p>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="label">Docs</span>
            {p.docs.map((d) => (
              <Link key={d.url} to={d.url} className={learnLink}>
                <strong>{d.title}</strong>
                {d.description && <span className="text-muted-foreground">{d.description}</span>}
              </Link>
            ))}
            <Link to="/docs/$slug" params={{ slug: 'platforms' }} className={learnLink}>
              <strong>Platforms reference</strong>
              <span className="text-muted-foreground">
                Every option, command and the platform contract.
              </span>
            </Link>
          </div>
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="label">Resources</span>
            {p.resources.map((r) => (
              <a key={r.url} href={r.url} className={learnLink} target="_blank" rel="noreferrer">
                <strong>
                  {r.title} <Icon icon={icons.external} size={14} />
                </strong>
                <span className="text-muted-foreground">
                  <Rich text={r.text} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {kits.length > 0 && (
        <section
          className={cn(split, 'rounded-[22px] bg-muted p-8 max-phone:px-4.5 max-phone:py-5.5')}
          aria-labelledby="kits-title"
        >
          <div>
            <h2 id="kits-title" className={sectionTitle}>
              Start from a kit
            </h2>
            <p className="mb-3 text-muted-foreground">
              A kit sets up the platforms, the packages and a first page in one command.{' '}
              {kits.length > 1 && (
                <>
                  Kits with {lower}:{' '}
                  {kits.map((k, i) => (
                    <span key={k}>
                      {i > 0 && ', '}
                      <code>{k}</code>
                    </span>
                  ))}
                  .
                </>
              )}
            </p>
          </div>
          <Command cmd={`kitr new my-app --kit ${kits[0]}`} className="m-0 bg-background" />
        </section>
      )}

      <section aria-labelledby="combine-title">
        <div className={cn(sectionHead, 'mb-6')}>
          <div>
            <h2 id="combine-title" className={sectionTitle}>
              Add another platform
            </h2>
            <p className="text-muted-foreground">
              Platforms share the <code>app/</code> folder, so adding one is a command, not a
              rewrite.
            </p>
          </div>
          <Link to="/platforms" hash="mix">
            Mix and match →
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {others.map((o) => (
            <PlatformTile key={o.type} platform={o} size="sm" />
          ))}
        </div>
      </section>
    </main>
  )
}

function ShellCompare({ current }: { current: PlatformEntry }) {
  const electron = current.type === 'desktop'
  return (
    <section className={split} aria-labelledby="compare-title">
      <div>
        <h2 id="compare-title" className={sectionTitle}>
          Electron or Tauri?
        </h2>
        <p className="mb-3 text-muted-foreground">
          Both run the same <code>app/</code> and register the same <code>platform</code> and{' '}
          <code>storage</code> drivers, so switching is one line in <code>kitrrc.ts</code>. A
          project keeps one of the two. Electron is the default we recommend.
        </p>
        <Link to="/platforms/$type" params={{ type: electron ? 'tauri' : 'desktop' }}>
          {electron ? 'See Tauri →' : 'See Electron →'}
        </Link>
      </div>
      <div className="table-wrap my-0">
        <table className="w-full border-collapse text-[15px] leading-[23px]">
          <thead>
            <tr>
              <th className={cn(cell, head)} />
              <th className={cn(cell, head, electron && thisColumn)}>Electron</th>
              <th className={cn(cell, head, !electron && thisColumn)}>Tauri</th>
            </tr>
          </thead>
          <tbody>
            {shells.map(([row, e, t]) => (
              <tr key={row}>
                <th
                  scope="row"
                  className={cn(cell, 'font-medium whitespace-nowrap text-muted-foreground')}
                >
                  {row}
                </th>
                <td className={cn(cell, electron && thisColumn)}>{e}</td>
                <td className={cn(cell, !electron && thisColumn)}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
