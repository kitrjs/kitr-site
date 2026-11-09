import { Link } from '@kitr/router'
import type { ReactNode } from 'react'
import { findKit, kits } from '#app/lib/catalog'
import { Command } from '#components/command'
import { Icon, icons } from '#components/icons'
import { KitCard, KitTile, PresetCard } from '#components/kit-bits'

/** What someone is starting, mapped to the kit that starts it. */
const needs: Array<{ want: string; kit: string }> = [
  { want: 'A web app, starting small', kit: 'app' },
  { want: 'An admin for an API I already have', kit: 'dashboard' },
  { want: 'An app and its own backend', kit: 'fullstack' },
  { want: 'An API with no React', kit: 'server' },
  { want: 'A product with accounts', kit: 'saas' },
  { want: 'A marketing site', kit: 'site' },
  { want: 'Chat or live updates', kit: 'realtime' },
  { want: 'Docs from markdown', kit: 'docs' },
  { want: 'A desktop app', kit: 'desktop' },
  { want: 'iPhone and Android apps', kit: 'mobile' },
]

const sectionTitle = 'mb-1 text-[32px] max-phone:text-[26px] max-phone:leading-8'

export default function Kits() {
  const base = kits.filter((k) => !k.base)
  const presets = kits.filter((k) => k.base)
  const picks = needs.flatMap((n) => {
    const kit = findKit(n.kit)
    return kit ? [{ ...n, kit }] : []
  })

  return (
    <main className="container flex flex-col gap-(--section-gap) pt-10 max-phone:pt-6">
      <section className="grid grid-cols-[minmax(0,6fr)_minmax(0,5fr)] items-end gap-14 max-tablet:grid-cols-1 max-tablet:gap-7">
        <div className="flex max-w-190 flex-col gap-4">
          <span className="label">Kits</span>
          <h1 className="font-display text-[60px] leading-16 font-normal tracking-normal max-phone:text-[38px] max-phone:leading-11 max-[640px]:text-[40px]">
            Start from something that runs.
          </h1>
          <p className="lede">
            A kit is the first commit of a kitr project: the platforms, the packages already wired,
            and pages and tests to edit. It runs once. After that the code is yours, and{' '}
            <code>kitr add</code> grows it.
          </p>
        </div>
        <Command cmd="kitr new my-app --kit app" className="m-0" />
      </section>

      <section aria-labelledby="pick-title">
        <h2 id="pick-title" className="label mb-3.5">
          What are you starting?
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2.5 max-phone:grid-cols-1 max-phone:gap-2">
          {picks.map(({ want, kit }) => (
            <li key={want} className="flex">
              <Link
                to="/kits/$name"
                params={{ name: kit.name }}
                className="group flex flex-1 items-center gap-3 rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-2.5 text-foreground no-underline transition-[border-color,translate] duration-150 hover:-translate-y-px hover:border-foreground hover:text-foreground"
              >
                <KitTile kit={kit} size={32} />
                <span className="flex min-w-0 flex-auto flex-col">
                  <span className="text-[14.5px] leading-5">{want}</span>
                  <span className="font-mono text-[13px] leading-5 text-muted-foreground group-hover:text-link">
                    --kit {kit.name}
                  </span>
                </span>
                <Icon icon={icons.arrow} size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <KitGroup
        id="base"
        title="Base kits"
        text="The wiring for one kind of app, with a first page and a test. Pick the smallest one that fits: adding a package later is one command."
      >
        <div className="grid grid-cols-2 gap-4 max-tablet:grid-cols-1">
          {base.map((kit) => (
            <KitCard key={kit.name} kit={kit} featured={kit.name === 'app'} />
          ))}
        </div>
      </KitGroup>

      <KitGroup
        id="presets"
        title="Presets"
        text="A base kit plus a small working app that shows its packages together: sign-in, a blog, a chat room, a native shell. Start here to learn by reading, or to keep what fits."
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 max-phone:grid-cols-1">
          {presets.map((kit) => (
            <PresetCard key={kit.name} kit={kit} />
          ))}
        </div>
      </KitGroup>

      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-10 gap-y-4 rounded-[22px] bg-muted p-8 max-tablet:grid-cols-1 max-phone:px-4.5 max-phone:py-5.5">
        <div>
          <h2 className="mb-2 text-[24px] leading-8">Your own kit</h2>
          <p className="text-muted-foreground">
            A kit is a package with <code>kind: 'kit'</code>: your platforms, packages, components
            and first files. Publish it, and{' '}
            <code className="whitespace-nowrap">kitr new my-app --kit @acme/starter</code> runs it.
          </p>
        </div>
        <Link
          to="/docs/$slug"
          params={{ slug: 'kits' }}
          hash="writing-a-kit"
          className="font-semibold whitespace-nowrap no-underline"
        >
          Write a kit →
        </Link>
      </section>
    </main>
  )
}

function KitGroup({
  id,
  title,
  text,
  children,
}: {
  id: string
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-6">
      <div>
        <h2 id={`${id}-title`} className={sectionTitle}>
          {title}
        </h2>
        <p className="max-w-160 text-muted-foreground">{text}</p>
      </div>
      {children}
    </section>
  )
}
