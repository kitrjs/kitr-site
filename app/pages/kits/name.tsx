import { getRouteApi, Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { findKit, kits } from '#app/lib/catalog'
import { Command } from '#components/command'
import { Icon, icons } from '#components/icons'
import {
  KitTile,
  kitCounts,
  PackageChips,
  PlatformChips,
  PresetCard,
  SourceLink,
  sourceUrl,
} from '#components/kit-bits'
import { KitFiles } from '#components/kit-files'
import { Rich } from '#components/platform-bits'
import { buttonVariants } from '#components/ui/button'

const route = getRouteApi('/_site/kits/$name')

const split =
  'grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-12 max-tablet:grid-cols-1 max-tablet:gap-7'
const sectionTitle = 'mb-2 text-[28px] leading-[34px] max-phone:text-[24px] max-phone:leading-8'

export default function KitPage() {
  const { kit, entry } = route.useLoaderData()
  const base = kit.base ? findKit(kit.base) : undefined
  const presets = kits.filter((k) => k.base === kit.name)
  const others = kits.filter((k) => k.name !== kit.name && !presets.includes(k))

  return (
    <main className="container flex flex-col gap-(--section-gap) pt-10 max-phone:pt-6">
      <nav
        className="-mb-12 flex gap-2 font-mono text-[13px] text-muted-foreground max-phone:-mb-8"
        aria-label="Breadcrumb"
      >
        <Link to="/kits" className="text-muted-foreground hover:text-foreground">
          Kits
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{kit.name}</span>
      </nav>

      <section className="grid grid-cols-[minmax(0,6fr)_minmax(0,5fr)] items-center gap-14 max-tablet:grid-cols-1 max-tablet:gap-7 [&_code]:text-[0.9em]">
        <div className="flex min-w-0 flex-col items-start gap-4.5">
          <div className="flex items-center gap-3.5">
            <KitTile kit={kit} size={64} />
            <span className="label">
              {base ? (
                <>
                  Preset · built on{' '}
                  <Link to="/kits/$name" params={{ name: base.name }} className="font-mono">
                    {base.name}
                  </Link>
                </>
              ) : (
                'Base kit'
              )}
            </span>
          </div>
          <h1 className="font-display text-[60px] leading-16 font-normal tracking-normal max-phone:text-[38px] max-phone:leading-11 max-[640px]:text-[40px]">
            {kit.title}
          </h1>
          <p className="lede">{kit.summary}</p>
          <p className="max-w-160 border-l-[3px] border-primary pl-3.5 text-[16px] leading-6">
            <span className="font-semibold">For: </span>
            {kit.audience}
          </p>
          <Command cmd={`kitr new my-app --kit ${kit.name}`} className="m-0 w-full max-w-140" />
          <div className="flex flex-wrap gap-3">
            <a href="#files" className={buttonVariants({ variant: 'primary' })}>
              Browse the files
            </a>
            <a
              href={sourceUrl(kit)}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants(), 'gap-2')}
            >
              <Icon icon={icons.github} size={16} />
              Source
            </a>
          </div>
        </div>
        <dl className="rounded-[14px] border border-[#243244] bg-[#0b121c] py-2 font-mono text-[13.5px] leading-[22px] text-[#eef2f7]">
          {kit.run.map(([cmd, what]) => (
            <div
              key={cmd}
              className="grid grid-cols-[minmax(150px,auto)_minmax(0,1fr)] gap-5 px-5.5 py-2 max-phone:grid-cols-1 max-phone:gap-0 max-phone:px-4"
            >
              <dt className="before:text-[#9aa7b8] before:content-['$_']">{cmd}</dt>
              <dd className="text-[#9aa7b8] [&_code]:text-[#eef2f7]">
                <Rich text={what} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="grid grid-cols-4 gap-8 border-t border-border pt-8 max-tablet:grid-cols-2 max-phone:grid-cols-1 max-phone:gap-6"
        aria-label={`What the ${kit.name} kit gives you`}
      >
        {kit.highlights.map((h) => (
          <div key={h.title}>
            <h2 className="mb-2 text-[18px] leading-6">{h.title}</h2>
            <p className="text-[15px] leading-6 text-muted-foreground [&_code]:text-[0.9em]">
              <Rich text={h.text} />
            </p>
          </div>
        ))}
      </section>

      <section className={split} aria-labelledby="inside-title">
        <div>
          <h2 id="inside-title" className={sectionTitle}>
            What's inside
          </h2>
          <p className="text-muted-foreground">
            Read from the kit's output in the kitr repository, so it matches what{' '}
            <code>kitr new</code> writes today. {kitCounts(kit)}.
          </p>
        </div>
        <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-5 gap-y-4 max-phone:grid-cols-1 max-phone:gap-y-2">
          <dt className="pt-0.5 text-[14px] text-muted-foreground max-phone:mt-2">Platforms</dt>
          <dd className="flex flex-wrap gap-1.5">
            <PlatformChips kit={kit} />
          </dd>
          <dt className="pt-0.5 text-[14px] text-muted-foreground max-phone:mt-2">Packages</dt>
          <dd className="flex flex-wrap gap-1.5">
            {kit.packages.length ? (
              <PackageChips names={kit.packages} />
            ) : (
              <span className="text-[14px] text-muted-foreground">
                None yet. Add each with <code>kitr add</code>.
              </span>
            )}
          </dd>
          {kit.components.length > 0 && (
            <>
              <dt className="pt-0.5 text-[14px] text-muted-foreground max-phone:mt-2">
                Components
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {kit.components.map((c) => (
                  <span
                    key={c}
                    className="inline-flex h-6.5 items-center rounded-full bg-muted px-2.5 font-mono text-[12.5px] leading-none"
                  >
                    {c}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby="files-title" id="files" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="files-title" className={sectionTitle}>
              Every file it writes
            </h2>
            <p className="text-muted-foreground">
              {kit.entry ? (
                <>
                  Start with <code>{kit.entry}</code>. Pick any file to read it.
                </>
              ) : (
                'Pick any file to read it.'
              )}
            </p>
          </div>
          <SourceLink kit={kit} className="text-[15px]" />
        </div>
        <KitFiles key={kit.name} kit={kit} entry={entry} />
      </section>

      {presets.length > 0 && (
        <section aria-labelledby="presets-title">
          <h2 id="presets-title" className={sectionTitle}>
            Presets built on {kit.name}
          </h2>
          <p className="mb-6 text-muted-foreground">
            The same base with a small working app on top, to read or to keep.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 max-phone:grid-cols-1">
            {presets.map((k) => (
              <PresetCard key={k.name} kit={k} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="others-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="others-title" className={sectionTitle}>
            Other kits
          </h2>
          <Link to="/kits">All kits →</Link>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 max-phone:grid-cols-1">
          {others.map((k) => (
            <li key={k.name} className="flex">
              <Link
                to="/kits/$name"
                params={{ name: k.name }}
                className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-background p-3 text-foreground no-underline transition-[border-color,translate] duration-150 hover:-translate-y-px hover:border-foreground hover:text-foreground"
              >
                <KitTile kit={k} size={36} />
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-[15px] font-semibold">{k.name}</span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {k.platforms.map((p) => p.type).join(' + ') || 'no platform'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
