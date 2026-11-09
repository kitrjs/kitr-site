import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import type { CSSProperties } from 'react'
import { type Category, categories, glyph, type PackageEntry, packages } from '#app/lib/catalog'
import { type PlatformEntry, platforms } from '#app/lib/platforms'
import { Icon, icons } from '#components/icons'
import { Rich } from '#components/platform-bits'

/** What someone is trying to ship, mapped to the platform that does it. */
const needs: Array<{ want: string; type: string; why: string }> = [
  {
    want: 'A website or a web app',
    type: 'web',
    why: 'Static, single-page or server-rendered, and installable as a PWA.',
  },
  {
    want: 'An API, with or without React',
    type: 'server',
    why: 'Routes, controllers and live channels on Node, Bun, Deno or Workers.',
  },
  {
    want: 'iPhone and Android apps',
    type: 'mobile',
    why: 'Your React app in a native shell, with deep links and the back button handled.',
  },
  {
    want: 'A desktop app that looks the same everywhere',
    type: 'desktop',
    why: 'Electron ships its own Chromium, so every machine renders it identically.',
  },
  {
    want: 'A desktop app with a small download',
    type: 'tauri',
    why: 'A Rust binary on the system webview. Megabytes, not hundreds of them.',
  },
]

/** What each platform asks you to install, beyond Node 22. */
const toolchain: Record<string, string> = {
  web: 'Nothing else',
  server: 'Nothing else. Bun, Deno or Wrangler if you pick that runtime',
  desktop: 'Nothing else',
  tauri: 'The Rust toolchain',
  mobile: 'Xcode for iOS, Android Studio for Android',
}

/** Where `@kitr/storage` items are saved on each platform. */
const storage: Record<string, string> = {
  web: 'localStorage',
  server: 'Nowhere: items read their defaults. Use a database or cache',
  desktop: 'kitr-storage.json in the app data folder',
  tauri: 'kitr.json, through the Tauri store plugin',
  mobile: 'Capacitor Preferences, kept when the OS clears the webview',
}

const combos: Array<{
  title: string
  text: string
  types: string[]
  cmd: string[]
  guide: { title: string; url: string }
}> = [
  {
    title: 'A site with its own API',
    text: 'Pages and the API in one project and one set of types. The API mounts inside the site or runs as its own process.',
    types: ['web', 'server'],
    cmd: ['kitr new my-app --kit fullstack'],
    guide: { title: 'Build a full-stack app', url: '/guides/fullstack-app' },
  },
  {
    title: 'One app on every screen',
    text: 'The same routes and components build a web app, an iPhone and Android app and a desktop app.',
    types: ['web', 'mobile', 'desktop'],
    cmd: ['kitr add mobile phone', 'kitr add desktop app'],
    guide: { title: 'Ship one app everywhere', url: '/guides/one-codebase' },
  },
  {
    title: 'An API and nothing else',
    text: 'No React in the dependency graph: an h3 server with routes, a database, logs and tests.',
    types: ['server'],
    cmd: ['kitr new my-api --kit server'],
    guide: { title: 'Build an API server without React', url: '/guides/api-server' },
  },
]

const byType = (type: string) => platforms.find((p) => p.type === type) as PlatformEntry

function PlatformTile({
  p,
  size = 32,
  className,
}: {
  p: PlatformEntry
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex flex-none items-center justify-center rounded-[34%]', className)}
      style={{ width: size, height: size, background: p.color }}
    >
      <Icon icon={glyph(p.type)} size={Math.round(size * 0.56)} stroke="#0B121C" />
    </span>
  )
}

/** Which platforms each package runs on, grouped by category. */
function supportMatrix() {
  const sets = platforms.map((p) => ({
    type: p.type,
    native: new Set(p.packages.native),
    all: new Set([...p.packages.native, ...p.packages.other]),
  }))
  const rows = packages.filter(
    (pkg) => pkg.category !== 'platforms' && sets.some((s) => s.all.has(pkg.name)),
  )
  return (Object.keys(categories) as Category[])
    .map((c) => ({
      category: c,
      list: rows
        .filter((pkg) => pkg.category === c)
        .map((pkg) => ({
          pkg,
          cells: sets.map((s) =>
            s.native.has(pkg.name) ? 'native' : s.all.has(pkg.name) ? 'yes' : 'no',
          ),
        })),
    }))
    .filter((g) => g.list.length)
}

const sectionHead = 'mb-6 flex flex-wrap items-end justify-between gap-4'
const sectionTitle = 'mb-1 text-[32px]'
const chooseCmd =
  'self-start rounded-sm bg-muted px-2 py-1 text-[12.5px] break-words whitespace-nowrap'
const compareHead =
  'border-b border-border px-4 py-3.5 text-left align-bottom font-mono text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase'
const compareCell =
  'border-b border-border px-4 py-3.5 text-left align-top max-phone:block max-phone:border-0 max-phone:p-0'
/** On phones each row is a card, and every value carries its column's name. */
const compareData = cn(
  compareCell,
  'max-phone:grid max-phone:grid-cols-[120px_minmax(0,1fr)] max-phone:gap-3 max-phone:pl-11 max-phone:text-[14px] max-phone:leading-5 max-phone:before:text-[13px] max-phone:before:text-muted-foreground max-phone:before:content-[attr(data-label)]',
)
const matrixCell = 'border-b border-border px-2.5 py-[7px] text-center max-[640px]:px-1'
/** The matrix's header sticks under the site header while the long table scrolls. */
const matrixHead = cn(
  matrixCell,
  'sticky top-16 z-1 bg-background pb-3 align-bottom font-mono text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase shadow-[inset_0_-1px_0_var(--color-border)]',
)
const marks = {
  native: 'inline-block size-3 rounded-full bg-primary align-middle',
  yes: 'inline-block size-3 rounded-full border-2 border-brand-green align-middle',
  no: 'inline-block h-0.5 w-2.5 rounded-[1px] bg-border align-middle',
}

const cellLabel = { native: 'Built for this platform', yes: 'Works here', no: 'Not here' }

export default function Platforms() {
  const groups = supportMatrix()
  const everywhere = groups.reduce(
    (n, g) => n + g.list.filter((r) => r.cells.every((c) => c !== 'no')).length,
    0,
  )
  const total = groups.reduce((n, g) => n + g.list.length, 0)

  return (
    <main className="container flex flex-col gap-(--section-gap) pt-10 max-phone:pt-6">
      <section className="flex max-w-190 flex-col gap-4">
        <span className="label">Platforms</span>
        <h1 className="font-display text-[60px] leading-16 font-normal tracking-normal max-phone:text-[38px] max-phone:leading-11 max-[640px]:text-[40px]">
          Pick the platform, not the framework.
        </h1>
        <p className="lede">
          A platform is where your app runs. Start with one and add the rest later with a single
          command: they all share your code, your packages and the CLI. This page helps you choose.
        </p>
      </section>

      <section aria-labelledby="choose-title">
        <h2 id="choose-title" className="label mb-3.5">
          What are you building?
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {needs.map((n) => {
            const p = byType(n.type)
            return (
              <li key={n.type} className="flex">
                <Link
                  to="/platforms/$type"
                  params={{ type: p.type }}
                  className="group flex flex-1 flex-col gap-2.5 rounded-lg border border-t-[3px] border-border border-t-(--platform) bg-background p-4.5 text-foreground no-underline transition-[border-color,box-shadow,translate] duration-150 hover:-translate-y-px hover:shadow-md"
                  style={{ '--platform': p.color } as CSSProperties}
                >
                  <span className="text-[15px] leading-[21px] text-muted-foreground">{n.want}</span>
                  <span className="flex items-center gap-2.5 text-[20px] font-bold">
                    <PlatformTile p={p} size={28} />
                    <span className="group-hover:text-link">{p.name}</span>
                    <Icon icon={icons.arrow} size={16} />
                  </span>
                  <span className="flex-1 text-[14px] leading-[21px] text-muted-foreground">
                    {n.why}
                  </span>
                  <code className={chooseCmd}>{p.command.split(' --')[0]}</code>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="compare-title">
        <div className={sectionHead}>
          <div>
            <h2 id="compare-title" className={sectionTitle}>
              Side by side
            </h2>
            <p className="text-muted-foreground">
              What each platform runs on, what it needs on your machine and what a build gives you.
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="w-full border-collapse text-[15px] leading-[22px]">
            <thead className="max-phone:hidden">
              <tr>
                <th className={compareHead}>Platform</th>
                <th className={compareHead}>Runs on</th>
                <th className={compareHead}>You also install</th>
                <th className={compareHead}>Saved items live in</th>
                <th className={compareHead}>
                  <code className="text-[12px] tracking-normal normal-case">kitr build</code> gives
                  you
                </th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr
                  key={p.type}
                  className="max-phone:grid max-phone:grid-cols-1 max-phone:gap-2 max-phone:border-b max-phone:border-border max-phone:py-4"
                >
                  <th scope="row" className={compareCell}>
                    <Link
                      to="/platforms/$type"
                      params={{ type: p.type }}
                      className="inline-flex items-start gap-3 font-semibold whitespace-nowrap text-foreground no-underline hover:text-link"
                    >
                      <PlatformTile p={p} />
                      <span>
                        {p.name}
                        <span className="block text-[13px] font-normal whitespace-normal text-muted-foreground">
                          {p.shell}
                        </span>
                      </span>
                    </Link>
                  </th>
                  <td data-label="Runs on" className={compareData}>
                    {p.targets.join(', ')}
                  </td>
                  <td data-label="You also install" className={compareData}>
                    {toolchain[p.type]}
                  </td>
                  <td data-label="Saved items live in" className={compareData}>
                    {storage[p.type]}
                  </td>
                  <td data-label="Build gives you" className={compareData}>
                    {p.run[1]?.[1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="combos-title">
        <div className={sectionHead}>
          <div>
            <h2 id="combos-title" className={sectionTitle}>
              Mix them in one project
            </h2>
            <p className="text-muted-foreground">
              Platforms are named entries in <code>kitrrc.ts</code>, so one project can hold
              several. These are the usual mixes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {combos.map((c) => (
            <div
              key={c.title}
              className="flex flex-col gap-2.5 rounded-lg border border-border bg-muted p-5.5"
            >
              <span className="flex gap-1.5">
                {c.types.map((t) => (
                  <PlatformTile key={t} p={byType(t)} size={36} />
                ))}
              </span>
              <h3 className="mt-1 text-[19px]">{c.title}</h3>
              <p className="flex-1 text-[15px] leading-[22px] text-muted-foreground">{c.text}</p>
              <span className="flex flex-col items-start gap-1.5">
                {c.cmd.map((line) => (
                  <code key={line} className={cn(chooseCmd, 'bg-background')}>
                    {line}
                  </code>
                ))}
              </span>
              <Link to={c.guide.url} className="font-semibold no-underline">
                {c.guide.title} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="matrix-title">
        <div className={sectionHead}>
          <div>
            <h2 id="matrix-title" className={sectionTitle}>
              Which packages run where
            </h2>
            <p className="text-muted-foreground">
              {everywhere} of {total} packages run on every platform. On desktop and phones, the
              marked ones switch to native APIs underneath with no change to your code.
            </p>
          </div>
          <Link to="/packages">All packages →</Link>
        </div>
        <p className="mb-1 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-muted-foreground [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2">
          <span>
            <Mark kind="native" /> Built for or native on this platform
          </span>
          <span>
            <Mark kind="yes" /> Works here
          </span>
          <span>
            <Mark kind="no" /> Not available
          </span>
        </p>
        <div className="table-wrap mt-2 overflow-visible">
          <table className="w-full border-collapse text-[15px] leading-[22px]">
            <thead>
              <tr>
                <th className={cn(matrixHead, 'text-left')}>Package</th>
                {platforms.map((p) => (
                  <th key={p.type} title={p.name} className={matrixHead}>
                    <span className="inline-flex flex-col items-center gap-1.5">
                      <PlatformTile p={p} size={24} />
                      <span className="tracking-[0.04em] max-[640px]:hidden">{p.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.category}>
                <tr>
                  <th
                    colSpan={platforms.length + 1}
                    scope="colgroup"
                    className={cn(
                      matrixCell,
                      'pt-5 text-left font-mono max-[640px]:pt-[7px] text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase',
                    )}
                  >
                    <span
                      className="mr-2 inline-block size-[9px] rounded-full"
                      style={{ background: categories[g.category].color }}
                    />
                    {categories[g.category].label}
                  </th>
                </tr>
                {g.list.map(({ pkg, cells }) => (
                  <MatrixRow key={pkg.name} pkg={pkg} cells={cells} />
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <p className="text-[15px] text-muted-foreground">
          <Rich text="Need something else, like a kiosk or a browser extension? A platform is a package with a `definePlatform()` factory, so you can write your own." />{' '}
          <Link to="/docs/$slug" params={{ slug: 'platforms' }} hash="writing-a-platform-package">
            Write a platform →
          </Link>
        </p>
      </section>
    </main>
  )
}

function Mark({ kind }: { kind: 'native' | 'yes' | 'no' }) {
  return (
    <>
      <span className={marks[kind]} aria-hidden="true" />
      <span className="sr-only">{cellLabel[kind]}</span>
    </>
  )
}

function MatrixRow({ pkg, cells }: { pkg: PackageEntry; cells: string[] }) {
  return (
    <tr className="hover:bg-muted">
      <th scope="row" className={cn(matrixCell, 'text-left')}>
        <Link
          to="/packages/$name"
          params={{ name: pkg.name }}
          className="font-mono text-[14px] text-foreground no-underline hover:text-link max-[640px]:text-[13px]"
        >
          {pkg.name}
        </Link>
      </th>
      {cells.map((c, i) => (
        <td
          key={platforms[i]?.type}
          className={matrixCell}
          title={`${platforms[i]?.name}: ${cellLabel[c as 'yes']}`}
        >
          <Mark kind={c as 'native' | 'yes' | 'no'} />
        </td>
      ))}
    </tr>
  )
}
