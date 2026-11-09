import { useAnalytics } from '@kitr/analytics/react'
import { useClipboard } from '@kitr/native/react'
import { cn } from '@kitr/tailwind'
import type { AppEvents } from '#app/analytics'
import { type Manager, managers, usePm, withManager } from '#app/stores/pm'
import { Icon, icons } from './icons'

/** A copyable `kitr ...` command with the package-manager picker. The choice is remembered site-wide. */
export function Command({
  cmd,
  note = true,
  className,
}: {
  cmd: string
  /** The first-time install hint under the `kitr` tab. */
  note?: boolean
  className?: string
}) {
  const pm = usePm((s) => s.pm)
  const setPm = usePm((s) => s.setPm)
  const { copy: write, copied } = useClipboard()
  const analytics = useAnalytics<AppEvents>()
  const text = withManager(cmd, pm)
  const copy = async () => {
    await write(text)
    analytics.track('command.copied', { command: cmd.split(' ').slice(0, 2).join(' '), pm })
  }
  return (
    // `command` is a hook: Markdown callouts and steps place the commands inside them.
    <div
      className={cn('command overflow-hidden rounded-md border border-border bg-code', className)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border pt-1.5 pr-1.5 pl-2">
        <div className="flex gap-0.5 overflow-x-auto" role="tablist" aria-label="Package manager">
          {(Object.keys(managers) as Manager[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === pm}
              className="cursor-pointer border-b-2 border-transparent bg-transparent px-2.5 pt-1.5 pb-2 font-mono text-[13px] text-muted-foreground transition-colors duration-120 aria-selected:border-primary aria-selected:text-foreground"
              onClick={() => setPm(m)}
            >
              {managers[m].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mb-1.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm bg-transparent text-muted-foreground transition-[color,background-color,scale] duration-120 hover:bg-border hover:text-foreground active:scale-97 data-copied:[&_svg]:animate-pop"
          data-copied={copied || undefined}
          onClick={copy}
          aria-label="Copy command"
        >
          <Icon key={String(copied)} icon={copied ? icons.check : icons.copy} size={16} />
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[14px] leading-[22px]">
        <code>{text}</code>
      </pre>
      {note && pm === 'kitr' && (
        <p className="px-4 pb-3 text-[13px] leading-5 text-muted-foreground [&_code]:text-[12px]">
          First time? Run <code>npm i -g @kitr/kitr</code> once. Inside a project, the global{' '}
          <code>kitr</code> runs your project's own version.
        </p>
      )}
    </div>
  )
}
