import { Add01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { Fragment, useState } from 'react'
import { useSwapped } from '#app/hooks/use-swapped'
import { glyph } from '#app/lib/catalog'
import { builder, type PlatformEntry, platformMarks, platforms } from '#app/lib/platforms'
import { usePm, withManager } from '#app/stores/pm'
import { CreatorMark } from './creator-marks'
import { Icon } from './icons'

/** Text with `code` spans, as the platform prose is written. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: the split is stable
        i % 2 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}

/** A highlighted code panel: bigger type and rounder corners than a code block in the docs. */
export const codePanel =
  'min-w-0 [&_.shiki]:overflow-x-auto [&_.shiki]:rounded-[18px] [&_.shiki]:px-6 [&_.shiki]:py-5.5 [&_.shiki]:text-[14px] [&_.shiki]:leading-[23px]'

/** What every platform tile shares: it lifts and its credits brighten on hover. */
const tile =
  'group relative flex flex-col justify-between gap-3 no-underline transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-[3px] focus-visible:-translate-y-[3px]'
const coloured =
  'text-[#0b121c] shadow-[inset_0_0_0_1px_rgb(11_18_28/0.06),inset_0_1px_0_rgb(255_255_255/0.35)] hover:text-[#0b121c] hover:shadow-[inset_0_0_0_1px_rgb(11_18_28/0.08),0_14px_28px_-16px_rgb(11_18_28/0.55)] focus-visible:text-[#0b121c] focus-visible:shadow-[inset_0_0_0_1px_rgb(11_18_28/0.08),0_14px_28px_-16px_rgb(11_18_28/0.55)]'
const sizes = {
  /** On the home page's board, where it compacts on tablets. */
  lg: {
    tile: 'aspect-[1/1.08] rounded-[24px] p-4 max-tablet:rounded-[20px] max-tablet:p-3.5 max-phone:aspect-[4/3]',
    icon: 'size-14 max-phone:size-10',
    name: 'text-[19px] leading-6 max-phone:text-[17px] max-phone:leading-[22px]',
    shell: 'text-[11.5px] leading-4 max-tablet:text-[10.5px] max-phone:leading-[15px]',
  },
  /** In a row of alternatives on a platform page. */
  sm: {
    tile: 'min-h-33 flex-[1_1_170px] rounded-[20px] p-3.5 max-phone:basis-35 max-phone:p-3',
    icon: 'size-10.5',
    name: 'text-[17px] leading-6 max-phone:leading-[22px]',
    shell: 'text-[11.5px] leading-4 max-phone:text-[11px] max-phone:leading-[15px]',
  },
}
const tileTop = 'flex items-start justify-between gap-2'
const tileIcon = 'grid place-items-center rounded-[34%] max-phone:[&_svg]:size-6'
const tileName = 'font-semibold tracking-[-0.01em]'
const tileShell = 'overflow-hidden font-mono text-ellipsis whitespace-nowrap'

/** One platform as a coloured tile: icon, name, the shell it ships in and where it runs. */
export function PlatformTile({
  platform,
  size = 'lg',
}: {
  platform: PlatformEntry
  size?: 'lg' | 'sm'
}) {
  const marks = platformMarks[platform.type] ?? []
  const z = sizes[size]
  return (
    <Link
      to="/platforms/$type"
      params={{ type: platform.type }}
      className={cn(tile, coloured, z.tile)}
      style={{ background: platform.color }}
    >
      <span className={tileTop}>
        <span className={cn(tileIcon, z.icon, 'bg-white/42')}>
          <Icon icon={glyph(platform.type)} size={size === 'lg' ? 30 : 22} stroke="#0B121C" />
        </span>
        <span
          className="flex flex-col gap-2 opacity-45 transition-opacity duration-200 ease-out group-hover:opacity-75 max-phone:[&_svg]:size-3.5"
          aria-hidden="true"
        >
          {marks.map((m) => (
            <CreatorMark key={m} name={m} size={size === 'lg' ? 18 : 15} />
          ))}
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn(tileName, z.name)}>{platform.name}</span>
        <span className={cn(tileShell, z.shell, 'opacity-90')}>{platform.label}</span>
      </span>
    </Link>
  )
}

/**
 * The platform board: one tile per kind of platform, then the one you write yourself. Tauri is
 * left off because it is a second answer for desktop; the builder and /platforms still offer it.
 */
const boardPlatforms = platforms.filter((p) => p.type !== 'tauri')

export function PlatformBoard() {
  return (
    <nav
      className="grid grid-cols-3 gap-3 max-tablet:gap-2.5 max-phone:grid-cols-2"
      aria-label="Platforms"
    >
      {boardPlatforms.map((p) => (
        <PlatformTile key={p.type} platform={p} />
      ))}
      <Link
        to="/docs/$slug"
        params={{ slug: 'platforms' }}
        hash="writing-a-platform-package"
        className={cn(
          tile,
          sizes.lg.tile,
          'col-span-2 aspect-auto bg-[repeating-linear-gradient(135deg,transparent_0_10px,color-mix(in_srgb,var(--kitr-color-muted)_70%,transparent)_10px_20px)] text-muted-foreground shadow-[inset_0_0_0_1.5px_var(--kitr-color-border)] hover:text-foreground hover:shadow-[inset_0_0_0_1.5px_var(--kitr-color-foreground),0_14px_28px_-18px_rgb(11_18_28/0.4)] focus-visible:text-foreground focus-visible:shadow-[inset_0_0_0_1.5px_var(--kitr-color-foreground),0_14px_28px_-18px_rgb(11_18_28/0.4)] max-phone:aspect-auto',
        )}
      >
        <span className={tileTop}>
          <span
            className={cn(
              tileIcon,
              sizes.lg.icon,
              'bg-background shadow-[inset_0_0_0_1px_var(--kitr-color-border)]',
            )}
          >
            <Icon icon={Add01Icon} size={30} />
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn(tileName, sizes.lg.name)}>Your own</span>
          <span className={cn(tileShell, sizes.lg.shell)}>definePlatform()</span>
        </span>
      </Link>
    </nav>
  )
}

/**
 * Mix and match: toggle named platforms and watch kitrrc.ts and the commands follow. Electron
 * and Tauri share the `shell` group, because a project keeps one desktop shell.
 */
export function PlatformBuilder({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const [on, setOn] = useState(() => new Set(builder.choices.filter((c) => c.on).map((c) => c.id)))
  const pm = usePm((s) => s.pm)
  const chosen = builder.choices.filter((c) => on.has(c.id))
  const types = new Set(chosen.map((c) => c.type))
  const picked = [...on].sort().join()
  const pickedSwapped = useSwapped(picked)
  const code = `${builder.pre}<code>${builder.lines
    .filter((l) => (l.id ? on.has(l.id) : l.type ? types.has(l.type) : true))
    .map((l) => l.html)
    .join('\n')}</code></pre>`

  const toggle = (id: string) => {
    const choice = builder.choices.find((c) => c.id === id)!
    setOn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        if (choice.group)
          for (const other of builder.choices)
            if (other.group === choice.group && other.id !== id) next.delete(other.id)
      }
      return next
    })
  }

  const Heading = headingLevel
  return (
    <section
      className="grid scroll-mt-24 grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-14 max-tablet:grid-cols-1 max-tablet:gap-7"
      aria-labelledby="builder-title"
      id="mix"
    >
      <div className="flex flex-col items-start gap-3.5">
        <Heading
          id="builder-title"
          className="text-[36px] leading-[42px] max-phone:text-[38px] max-phone:leading-11"
        >
          One app. As many platforms as you need.
        </Heading>
        <p className="text-[18px] leading-[30px] text-muted-foreground max-phone:text-[16px] max-phone:leading-[26px]">
          Each platform is one line in your config. Toggle one to see the file and the commands
          change.
        </p>
        <fieldset className="mt-1.5 grid w-full max-w-130 grid-cols-2 gap-2 border-0 max-[560px]:gap-1.5">
          <legend className="sr-only">Platforms in this project</legend>
          {builder.choices.map((c) => {
            const platform = platforms.find((p) => p.type === c.type)!
            const pressed = on.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                className="group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-background pr-3.5 pl-1.5 text-[14px] text-muted-foreground transition-[background-color,color,border-color,scale] duration-120 hover:border-muted-foreground hover:text-foreground active:scale-97 aria-pressed:border-foreground aria-pressed:bg-muted aria-pressed:text-foreground max-phone:gap-1.5 max-phone:pr-2 max-phone:text-[12.5px]"
                aria-pressed={pressed}
                onClick={() => toggle(c.id)}
              >
                <span
                  className="grid size-7 scale-86 place-items-center rounded-full opacity-45 grayscale [transition:filter_120ms,opacity_120ms,scale_200ms_cubic-bezier(0.34,1.56,0.64,1)] group-aria-pressed:scale-100 group-aria-pressed:opacity-100 group-aria-pressed:grayscale-0"
                  style={{ background: platform.color }}
                >
                  <Icon icon={glyph(c.type)} size={14} stroke="#0B121C" strokeWidth={1.8} />
                </span>
                <span className="font-mono">
                  {c.line.split(':')[0]}
                  <span className="text-muted-foreground">: {c.type}</span>
                </span>
              </button>
            )
          })}
        </fieldset>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div
          key={picked}
          className={cn(
            codePanel,
            '[&_.shiki]:min-h-0 [&_.shiki]:leading-[21px]',
            pickedSwapped && 'animate-swap-in',
          )}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: lines highlighted at build time
          dangerouslySetInnerHTML={{ __html: code }}
        />
        <div
          className="overflow-x-auto rounded-[14px] border border-[#243244] bg-[#0b121c] px-5 py-4 font-mono text-[13.5px] leading-[21px] whitespace-pre text-[#eef2f7]"
          aria-live="polite"
        >
          {chosen.length ? (
            <>
              {chosen.map((c) => (
                <div key={c.id}>
                  <span className="text-[#9aa7b8]">$</span> {withManager(c.cmd, pm)}
                </div>
              ))}
              <div className="mt-2.5">
                <span className="text-[#9aa7b8]">$</span> {withManager('kitr dev', pm)}
              </div>
              {chosen.map((c) => (
                <div key={c.id} className="text-[#5fd58c]">
                  {'  '}✓ {(c.line.split(':')[0] ?? '').padEnd(6)}{' '}
                  <span className="text-[#7fa6ff]">{c.dev}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="text-[#9aa7b8]">
              Pick a platform. A project with none is a plain TypeScript package.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
