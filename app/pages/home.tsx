import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { useState } from 'react'
import { useSwapped } from '#app/hooks/use-swapped'
import { categoryCounts, findPackage, glyph, kits, packages } from '#app/lib/catalog'
import { Command } from '#components/command'
import { Icon } from '#components/icons'
import { Tile } from '#components/package-bits'
import { PlatformBoard, PlatformBuilder } from '#components/platform-bits'
import { buttonVariants } from '#components/ui/button'

/** Platon's pitch, short enough to read in one glance: the only description in the hero. */
const pitch = 'The opinionated TypeScript and React framework for apps on every platform.'

/** The rest of the pitch, as the lead-in to "What you get". */
const why =
  'The tools are already chosen and wired, so you and your coding agents spend less time deciding what to use and finding where things go, and more time building.'

const terminal = [
  {
    label: 'kitr new',
    cmd: 'kitr new my-app --kit app',
    out: [
      ['ok', '✓ created my-app from the app kit'],
      ['dim', '  web · query · tailwind · theme · testing'],
      ['ok', '✓ wrote AGENTS.md'],
      ['info', '→ cd my-app && npm run dev'],
    ],
  },
  {
    label: 'kitr add',
    cmd: 'kitr add realtime',
    out: [
      ['ok', '+ @kitr/logger   (required by server)'],
      ['ok', '+ @kitr/server   (required by realtime)'],
      ['ok', '+ @kitr/realtime'],
      ['info', '~ kitrrc.ts · config/realtime.ts · AGENTS.md'],
    ],
  },
  {
    label: 'kitr doctor',
    cmd: 'kitr doctor',
    out: [
      ['ok', '✓ kitrrc.ts matches package.json'],
      ['ok', '✓ every provider resolves'],
      ['warn', '! app/routes/index.tsx imports @tanstack/react-query directly'],
      ['dim', '  use @kitr/query instead'],
    ],
  },
  {
    label: 'kitr eject',
    cmd: 'kitr eject all',
    out: [
      ['dim', 'To remove kitr, rewrite these imports:'],
      ['info', '  @kitr/router → @tanstack/react-router'],
      ['info', '  @kitr/query  → @tanstack/react-query'],
      ['dim', '  …and 10 more'],
    ],
  },
] as const

type Card = { title: string; text: string; icon: string } & (
  | { to: '/packages' | '/platforms' | '/kits' }
  | { slug: string }
  | { pkg: string }
)

/** What you get: each card is a problem and its answer in one sentence. */
const gets: Card[] = [
  {
    title: 'Start from a kit',
    text: `${kits.length} starting apps, packages already wired.`,
    icon: 'ui',
    to: '/kits',
  },
  {
    title: 'Add a package with one command',
    text: 'Installs, configures and briefs your agent.',
    icon: 'package',
    to: '/packages',
  },
  {
    title: 'One home for every file',
    text: 'Each kind of file has one fixed place.',
    icon: 'files',
    slug: 'project-structure',
  },
  {
    title: 'Typed end to end',
    text: 'Server types reach your app straight from the route table.',
    icon: 'api',
    pkg: 'api',
  },
  {
    title: 'Same code on every platform',
    text: 'Web, server, desktop and mobile share one codebase.',
    icon: 'platform',
    to: '/platforms',
  },
  {
    title: 'Agents follow the same rules',
    text: 'AGENTS.md holds the rules; packages add theirs.',
    icon: 'ai',
    slug: 'agents',
  },
]

/** Three packages a newcomer reaches for first, with the benefit in a few words. */
const examples = (
  [
    ['forms', 'Validation, and server errors on the right field.'],
    ['auth', 'Sign-in, protected pages and permissions.'],
    ['realtime', 'Live updates on every open screen.'],
  ] as const
).flatMap(([name, text]) => {
  const pkg = findPackage(name)
  return pkg ? [{ pkg, text }] : []
})

/** The headings of the compare page these chips jump to (rehype-slug ids). */
const coming = [
  { name: 'Next.js', hash: 'nextjs' },
  { name: 'Expo', hash: 'expo' },
  { name: 'TanStack Start', hash: 'tanstack-start' },
  { name: 'AdonisJS', hash: 'adonisjs' },
]

const homeTitle = 'text-[32px] leading-[38px] max-phone:text-[28px] max-phone:leading-[34px]'
const heroButton = 'max-[560px]:px-2.5'
const cardGrid =
  'grid grid-cols-3 gap-4 max-tablet:grid-cols-2 max-phone:grid-cols-1 max-phone:gap-2.5'
/** A bordered card that is a link as a whole, and lifts on hover. */
const cardLink =
  'flex flex-1 items-start gap-3.5 rounded-lg border border-border p-4.5 text-foreground no-underline transition-[border-color,translate] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground max-phone:p-3.5'
const pill =
  'inline-flex items-center gap-2 rounded-full border border-border text-foreground no-underline transition-[border-color] duration-150 hover:border-foreground hover:text-foreground'
/** The terminal's line colours. */
const tones = {
  dim: 'text-[#9aa7b8]',
  ok: 'text-[#5fd58c]',
  info: 'text-[#7fa6ff]',
  warn: 'text-[#ff8080]',
}

/** A "What you get" card: the whole card is the link. */
function GetCard({ card }: { card: Card }) {
  const body = (
    <>
      <span
        className="grid size-10 flex-none place-items-center rounded-md bg-muted text-foreground"
        aria-hidden="true"
      >
        <Icon icon={glyph(card.icon)} size={22} strokeWidth={1.7} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 text-[15px] leading-[23px]">
        <strong className="text-[17px] leading-6 font-semibold">{card.title}</strong>
        <span className="text-muted-foreground">{card.text}</span>
      </span>
    </>
  )
  if ('to' in card)
    return (
      <Link to={card.to} className={cardLink}>
        {body}
      </Link>
    )
  if ('pkg' in card)
    return (
      <Link to="/packages/$name" params={{ name: card.pkg }} className={cardLink}>
        {body}
      </Link>
    )
  return (
    <Link to="/docs/$slug" params={{ slug: card.slug }} className={cardLink}>
      {body}
    </Link>
  )
}

export default function Home() {
  const [tab, setTab] = useState(0)
  const tabSwapped = useSwapped(tab)
  const current = terminal[tab]!
  return (
    <main className="container flex flex-col gap-(--section-gap) pt-16 max-phone:pt-8">
      <section className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-16 max-tablet:gap-10 max-[880px]:grid-cols-1 max-[880px]:gap-12">
        <div className="flex min-w-0 flex-col gap-4.5 first-load:*:animate-rise first-load:*:nth-[-n+2]:animate-rise-slide first-load:*:nth-2:[animation-delay:40ms] first-load:*:nth-3:[animation-delay:80ms] first-load:*:nth-4:[animation-delay:120ms] first-load:*:nth-5:[animation-delay:160ms] first-load:*:nth-6:[animation-delay:200ms] first-load:*:nth-7:[animation-delay:240ms]">
          <h1 className="font-display text-[clamp(40px,4.6vw,64px)] leading-[1.08] font-normal tracking-normal max-phone:text-[38px] max-phone:leading-[44px]">
            One way to build everything.
          </h1>
          <p className="lede">{pitch}</p>
          <Command cmd="kitr new my-app --kit app" className="my-1 max-w-130" />
          <div className="flex flex-wrap gap-3 max-[560px]:grid max-[560px]:grid-cols-3 max-[560px]:gap-2 max-[359px]:grid-cols-2">
            <Link
              to="/docs/$slug"
              params={{ slug: 'getting-started' }}
              className={cn(
                buttonVariants({ variant: 'primary' }),
                heroButton,
                'max-[359px]:col-span-full',
              )}
            >
              Get started
            </Link>
            <Link to="/kits" className={cn(buttonVariants(), heroButton)}>
              Kits
            </Link>
            <Link to="/packages" className={cn(buttonVariants(), heroButton)}>
              Packages
            </Link>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <span className="label">Ships to</span>
          <PlatformBoard />
          <a href="#mix" className="self-end text-[14px] leading-5 max-phone:self-start">
            Mix them in one project ↓
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="gets-title">
        <div>
          <h2 id="gets-title" className={homeTitle}>
            What you get
          </h2>
          <p className="mt-2 max-w-160 text-[17px] leading-[26px] text-muted-foreground">{why}</p>
        </div>
        <ul className={cardGrid}>
          {gets.map((card) => (
            <li key={card.title} className="flex">
              <GetCard card={card} />
            </li>
          ))}
        </ul>
      </section>

      <PlatformBuilder />

      <section className="flex flex-col items-start gap-5" aria-labelledby="packages-title">
        <div className="flex w-full flex-wrap items-baseline justify-between gap-4">
          <h2 id="packages-title" className={cn(homeTitle, 'mb-1')}>
            Add what you need, one command at a time.
          </h2>
          <Link to="/packages" className="font-medium">
            Browse all {packages.length} packages →
          </Link>
        </div>
        <ul
          className="flex flex-wrap gap-2 max-phone:-mx-4 max-phone:w-[calc(100%+32px)] max-phone:flex-nowrap max-phone:overflow-x-auto max-phone:overscroll-x-contain max-phone:px-4 max-phone:py-0.5 max-phone:[scrollbar-width:none]"
          aria-label="Package categories"
        >
          {categoryCounts.map((c) => (
            <li key={c.category} className="max-phone:flex-none">
              <Link
                to="/packages"
                search={{ category: c.category }}
                className={cn(pill, 'min-h-10 px-3.5 text-[14px] max-phone:min-h-11')}
              >
                <span
                  className="inline-block size-3 flex-none rounded-[3px] max-[900px]:size-2.5"
                  style={{ background: c.color }}
                />
                {c.label}
                <span className="font-mono text-[12px] text-muted-foreground">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className={cn(cardGrid, 'w-full')}>
          {examples.map(({ pkg, text }) => (
            <li key={pkg.name}>
              <Link
                to="/packages/$name"
                params={{ name: pkg.name }}
                className={cn(cardLink, 'h-full')}
              >
                <Tile pkg={pkg} size={40} />
                <span className="flex min-w-0 flex-col gap-1 text-[15px] leading-[23px]">
                  <code className="text-[14px] font-semibold">kitr add {pkg.name}</code>
                  <span className="text-muted-foreground">{text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="overflow-hidden rounded-[14px] border border-[#243244] bg-[#0b121c] text-[#eef2f7]"
        aria-label="The kitr CLI"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-[#243244] px-4 py-3 max-phone:grid max-phone:grid-cols-2 max-phone:gap-2 max-phone:p-3">
          <span className="flex gap-1.5 max-phone:hidden" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </span>
          {terminal.map((t, i) => (
            <button
              key={t.label}
              type="button"
              className="min-h-8 cursor-pointer rounded-sm border border-[#243244] bg-transparent px-3 font-mono text-[13px] text-[#9aa7b8] transition-[color,background-color,border-color,scale] duration-120 active:scale-97 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground max-phone:px-2"
              aria-pressed={i === tab}
              onClick={() => setTab(i)}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[12px] text-[#9aa7b8] max-phone:hidden">
            No prompts. Agents and CI run every command.
          </span>
        </div>
        <pre
          className={cn(
            'min-h-42.5 overflow-x-auto p-6 font-mono text-[15px] leading-[26px] max-phone:px-4 max-phone:py-5 max-phone:text-[13.5px] max-phone:leading-6',
            tabSwapped && 'animate-swap-in',
          )}
          key={tab}
        >
          <span className={tones.dim}>~/code $</span> {current.cmd}
          {'\n'}
          {current.out.map(([tone, line]) => (
            <span key={line} className={tones[tone]}>
              {line}
              {'\n'}
            </span>
          ))}
        </pre>
      </section>

      <section
        className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5"
        aria-labelledby="coming-title"
      >
        <div>
          <h2 id="coming-title" className={homeTitle}>
            Coming from…
          </h2>
          <p className="mt-1 text-muted-foreground">What stays the same and what changes.</p>
        </div>
        <ul className="flex flex-wrap gap-2.5 max-phone:grid max-phone:w-full max-phone:grid-cols-2">
          {coming.map((c) => (
            <li key={c.hash}>
              <Link
                to="/docs/$slug"
                params={{ slug: 'compare' }}
                hash={c.hash}
                className={cn(
                  pill,
                  'min-h-11 px-4.5 font-medium max-phone:w-full max-phone:justify-center max-phone:px-3',
                )}
              >
                {c.name} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="grid grid-cols-2 items-center gap-10 rounded-[28px] bg-primary p-12 text-primary-foreground max-tablet:grid-cols-1 max-tablet:gap-7 max-phone:rounded-[22px] max-phone:px-5.5 max-phone:py-7"
        aria-labelledby="cta-title"
      >
        <div>
          <h2
            id="cta-title"
            className="mb-2.5 font-display text-[44px] leading-[48px] font-normal tracking-normal max-phone:text-[32px] max-phone:leading-9"
          >
            your first app, five minutes from now
          </h2>
          <p className="text-[18px] text-primary-foreground">
            Install the CLI once, pick a kit, and add the rest as you need it.
          </p>
        </div>
        <div className="flex flex-col gap-3.5 text-foreground">
          {/* The closing call to action repeats the hero's command; its first-time note is in the hero. */}
          <Command
            cmd="kitr new my-app --kit app"
            note={false}
            className="bg-background text-foreground"
          />
          <Link
            to="/docs/$slug"
            params={{ slug: 'getting-started' }}
            className={cn(buttonVariants({ variant: 'inverse' }), 'self-start')}
          >
            Read the getting started guide
          </Link>
        </div>
      </section>
    </main>
  )
}
