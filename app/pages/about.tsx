import { Link } from '@kitr/router'
import mark from '#app/assets/mark.svg?url'
import { kits, packages } from '#app/lib/catalog'
import { guidesNav } from '#app/lib/content'
import { platforms } from '#app/lib/platforms'
import { platonUrl, repoUrl } from '#components/chrome'
import { CreatorMark } from '#components/creator-marks'
import { buttonVariants } from '#components/ui/button'

const ideas = [
  {
    title: 're-export',
    color: 'var(--kitr-color-primary)',
    text: '@kitr/router is TanStack Router. @kitr/forms is React Hook Form. Their docs still apply, and leaving is a find-and-replace.',
  },
  {
    title: 'one data layer',
    color: 'var(--kitr-color-brandGreen)',
    text: 'REST, your own API, server actions and live channels all load and save data the same way.',
  },
  {
    title: 'no magic',
    color: 'var(--kitr-color-brandRed)',
    text: 'One file lists everything your app loads. Every command runs without prompts, for people, CI and agents alike.',
  },
]

const why = [
  {
    title: 'The problem',
    text: 'A new app means choosing and wiring twenty libraries. Every project ends up with a different layout.',
  },
  {
    title: 'The answer',
    text: 'kitr chooses them once and one CLI wires them. The choices are written down in one file.',
  },
  {
    title: 'Who it is for',
    text: 'Teams, solo developers and coding agents. Anyone who wants one set of conventions across every app.',
  },
]

/** Six rows of the "built on" table in What is kitr, in plain words. */
const builtOn = [
  ['@kitr/router', 'TanStack Router', 'Every page listed in one file, sign-in checks on pages'],
  ['@kitr/query', 'TanStack Query', 'One way to load and save data from any source'],
  ['@kitr/forms', 'React Hook Form', 'Validation, and server errors next to the right field'],
  ['@kitr/state', 'Zustand', 'Stores that are safe with server rendering'],
  ['@kitr/web', 'Vite and TanStack Start', 'Static, single-page, server-rendered or installable'],
  ['@kitr/server', 'h3 and srvx', 'An API your app calls with full types'],
] as const

const guideCount = guidesNav.reduce((n, g) => n + g.items.length, 0)

/** Every section heading on the page. */
const h2 = 'mb-5 text-[32px] leading-[38px] max-phone:text-[28px] max-phone:leading-[34px]'
const display = 'font-display font-normal tracking-normal'
/** The maker and brand panels side by side. */
const panel =
  'flex flex-[1_1_400px] flex-col items-start gap-2.5 rounded-[18px] p-8 max-phone:basis-full max-phone:p-6'
const cell =
  'border-b border-border pt-3 pr-4 pb-3 pl-0 text-left align-top max-phone:border-0 max-phone:p-0'
/** A count that links to the list it counts. */
const stat =
  'flex flex-col gap-0.5 rounded-lg border border-border px-6 py-5 text-foreground no-underline transition-[border-color,translate] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground max-phone:px-4.5 max-phone:py-4'
const statNumber = `${display} text-[48px] leading-[52px] max-phone:text-[40px] max-phone:leading-11`
const linkCard =
  'flex flex-col rounded-md border border-border p-6 text-foreground no-underline transition-[translate,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:text-foreground [&_h3]:mb-1 [&_h3]:text-[18px]'

export default function About() {
  return (
    <main className="container flex flex-col gap-(--section-gap) pt-16 max-phone:pt-10">
      <section className="flex flex-wrap items-center gap-14 max-phone:gap-6">
        <img
          src={mark}
          alt="The kitr mark: a tile cut by the letter K"
          width={240}
          height={240}
          className="max-phone:size-22"
        />
        <div className="flex flex-[1_1_460px] flex-col gap-4.5">
          <span className="label">About kitr</span>
          <h1
            className={`${display} text-[60px] leading-16 max-phone:text-[40px] max-phone:leading-[46px]`}
          >
            a box of parts that fit together
          </h1>
          <p className="lede">
            kitr is an opinionated TypeScript and React framework for apps on every platform, with
            the tools already chosen and wired. Every app remakes the same thirty decisions, and
            every coding agent remakes them again.
          </p>
        </div>
      </section>

      <section aria-labelledby="why-title">
        <h2 id="why-title" className={h2}>
          Why kitr exists
        </h2>
        <div className="grid grid-cols-3 gap-10 border-t border-border max-phone:grid-cols-1 max-phone:gap-0">
          {why.map((w) => (
            <div
              key={w.title}
              className="pt-5 max-phone:border-b max-phone:border-border max-phone:py-4 max-phone:last:border-b-0"
            >
              <h3 className="mb-1.5 text-[18px]">{w.title}</h3>
              <p className="text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 max-phone:grid-cols-1">
        {ideas.map((i) => (
          <div
            key={i.title}
            className="flex min-h-55 flex-col gap-2.5 rounded-[18px] p-8 text-primary-foreground max-phone:min-h-0 max-phone:p-6"
            style={{ background: i.color }}
          >
            <span className={`${display} text-[30px] leading-[34px]`}>{i.title}</span>
            <p>{i.text}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="built-title">
        <h2 id="built-title" className={h2}>
          Built on libraries you know
        </h2>
        <table className="w-full border-collapse text-[16px] leading-6">
          <thead className="max-phone:sr-only">
            <tr>
              {['kitr piece', 'Built on', 'What kitr adds'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className={`${cell} font-mono text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {builtOn.map(([piece, upstream, adds]) => (
              <tr
                key={piece}
                className="max-phone:grid max-phone:grid-cols-[auto_minmax(0,1fr)] max-phone:gap-x-2.5 max-phone:border-b max-phone:border-border max-phone:py-3"
              >
                <th scope="row" className={`${cell} font-medium whitespace-nowrap`}>
                  <code className="text-[14px]">{piece}</code>
                </th>
                <td className={`${cell} max-phone:text-muted-foreground`}>{upstream}</td>
                <td
                  className={`${cell} text-muted-foreground max-phone:col-span-full max-phone:text-[15px] max-phone:leading-[23px]`}
                >
                  {adds}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3.5 text-muted-foreground">
          Their docs still apply. Leaving kitr is a find-and-replace.
        </p>
      </section>

      <section aria-labelledby="box-title">
        <h2 id="box-title" className={h2}>
          What's in the box
        </h2>
        <ul className="grid grid-cols-4 gap-4 max-tablet:grid-cols-2">
          <li>
            <Link to="/packages" className={stat}>
              <span className={statNumber}>{packages.length}</span>
              <span className="text-muted-foreground">packages</span>
            </Link>
          </li>
          <li>
            <Link to="/platforms" className={stat}>
              <span className={statNumber}>{platforms.length}</span>
              <span className="text-muted-foreground">platforms</span>
            </Link>
          </li>
          <li>
            <Link to="/docs/$slug" params={{ slug: 'kits' }} className={stat}>
              <span className={statNumber}>{kits.length}</span>
              <span className="text-muted-foreground">kits</span>
            </Link>
          </li>
          <li>
            <Link to="/guides" className={stat}>
              <span className={statNumber}>{guideCount}</span>
              <span className="text-muted-foreground">guides</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="flex flex-wrap gap-6">
        <div className={`${panel} bg-muted`}>
          <a
            className="mb-3.5 grid size-22 place-items-center rounded-[18px] bg-[#002fa7] bg-plate-grid text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] [--plate-cell:11px] [--plate-line:rgb(255_255_255/0.12)] transition-[translate] duration-160 hover:-translate-y-0.5 hover:text-white"
            href={platonUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="platon.blue"
          >
            <CreatorMark name="platon" size={44} />
          </a>
          <span className="label">Made by</span>
          <h2 className={h2}>Platon</h2>
          <p className="text-muted-foreground">
            kitr is built and maintained by Platon Podkopov, a senior UI/UX developer in Guildford,
            UK. It is the decisions he remade for every new React app, written down once.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <a href={`${platonUrl}/kitr`} target="_blank" rel="noreferrer">
              platon.blue
            </a>
            <a href="https://github.com/PodkopovP" target="_blank" rel="noreferrer">
              github.com/PodkopovP
            </a>
          </div>
        </div>
        <div className={`${panel} border border-border`}>
          <h2 className={h2}>Brand</h2>
          <p className="text-muted-foreground">
            The mark is a tile cut by the letter K. Its three pieces are the brand colours.
          </p>
          <div className="flex gap-2.5">
            {['#2368EE', '#208046', '#D62D2C', '#0F1B2B'].map((c) => (
              <span
                key={c}
                title={c}
                className="size-11 rounded-md border border-border"
                style={{ background: c }}
              />
            ))}
          </div>
          <a className={buttonVariants()} href="/favicon.svg" download="kitr-mark.svg">
            Download the mark
          </a>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href={`${repoUrl}/issues`} target="_blank" rel="noreferrer" className={linkCard}>
          <h3>Roadmap</h3>
          <span className="text-muted-foreground">What's planned next.</span>
        </a>
        <a href={`${repoUrl}/releases`} target="_blank" rel="noreferrer" className={linkCard}>
          <h3>Changelog</h3>
          <span className="text-muted-foreground">Every release and its tested versions.</span>
        </a>
        <Link to="/docs/$slug" params={{ slug: 'what-is-kitr' }} className={linkCard}>
          <h3>What is kitr</h3>
          <span className="text-muted-foreground">The problems it solves, in plain words.</span>
        </Link>
        <Link to="/docs/$slug" params={{ slug: 'building-packages' }} className={linkCard}>
          <h3>Contribute</h3>
          <span className="text-muted-foreground">Fix a doc or write a package.</span>
        </Link>
        <a href="/llms.txt" className={linkCard}>
          <h3>For agents</h3>
          <span className="text-muted-foreground">Every doc as plain text, for coding agents.</span>
        </a>
      </section>
    </main>
  )
}
