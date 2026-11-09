import { useAnalytics } from '@kitr/analytics/react'
import { useClipboard } from '@kitr/native/react'
import { cn } from '@kitr/tailwind'
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { AppEvents } from '#app/analytics'
import type { ExampleFile } from '#app/lib/examples'
import { type ExampleView, useExampleView } from '#app/stores/example-view'
import { repoUrl } from './chrome'
import { Icon, icons } from './icons'

/** Everything an example stores is namespaced, so examples never see each other's data. */
export const storagePrefix = (pkg: string, example: string) => `kitr-play:${pkg}:${example}:`

/** The small bordered buttons in the frame's bar and storage panel. */
const button =
  'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 text-[13px] font-medium text-foreground no-underline disabled:cursor-default disabled:opacity-50'

/** The borderless icon buttons beside the file tabs. */
const iconButton =
  'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent text-muted-foreground no-underline transition-[color,background-color,scale] duration-120 hover:bg-border hover:text-foreground active:scale-97'

const views: Array<{ view: ExampleView; label: string; icon: keyof typeof icons }> = [
  { view: 'demo', label: 'Demo', icon: 'demo' },
  { view: 'split', label: 'Split', icon: 'split' },
  { view: 'code', label: 'Code', icon: 'code' },
]

/**
 * A live example in a frame, with the code that runs it. The view switch shows the demo, the code
 * or both: side by side when the frame is wide enough, stacked when it is not, and on a phone the
 * demo alone. The code panel has a tab per file and one for the browser storage the example
 * writes: reload the frame to see what persists (its storage and its URL), clear its storage to
 * start fresh at the example's own URL. Switching views never reloads the demo.
 */
export function LiveExample({
  pkg,
  example,
  title,
  description,
  storage,
  height,
  width,
  files,
}: {
  pkg: string
  example: string
  title?: string
  description?: string
  storage?: boolean
  /** Frame height in pixels, for examples that need more than the default 300. */
  height?: number
  /** Frame width in pixels, to show a narrow screen; the frame stays centered and never overflows. */
  width?: number
  /** The example's source files, the example itself first. */
  files: ExampleFile[]
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const id = useId()
  const [nonce, setNonce] = useState(0)
  const [entries, setEntries] = useState<Array<[string, string]>>([])
  const view = useExampleView((s) => s.view)
  const setView = useExampleView((s) => s.setView)
  const [tab, setTab] = useState(0)
  const [split, setSplit] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const { copy: write, copied } = useClipboard()
  const analytics = useAnalytics<AppEvents>()
  const prefix = storagePrefix(pkg, example)

  const read = useCallback(() => {
    try {
      const out: Array<[string, string]> = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix))
          out.push([key.slice(prefix.length), localStorage.getItem(key) ?? ''])
      }
      setEntries(out)
    } catch {}
  }, [prefix])

  useEffect(() => {
    read()
    // Fires here when the frame (same origin, another document) writes to localStorage.
    const onStorage = () => read()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [read])

  const restart = () => setNonce((n) => n + 1)
  /**
   * Reload the frame like a browser refresh: same document URL, so an example that keeps state in
   * its URL (a table's `?sort=`) gets it back. Falls back to a fresh frame if it can't be reached.
   */
  const reload = () => {
    try {
      const win = frame.current?.contentWindow
      if (win) return win.location.reload()
    } catch {}
    restart()
  }
  const clear = () => {
    try {
      for (const [key] of entries) localStorage.removeItem(prefix + key)
    } catch {}
    read()
    restart()
  }
  const src = `/play/${pkg}/${example}`

  // A tab per file, then the storage tab.
  const tabs = storage === false ? files.length : files.length + 1
  const file = files[tab]
  const onTabKey = (e: KeyboardEvent) => {
    const to =
      e.key === 'ArrowRight'
        ? (tab + 1) % tabs
        : e.key === 'ArrowLeft'
          ? (tab - 1 + tabs) % tabs
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? tabs - 1
              : null
    if (to === null) return
    e.preventDefault()
    setTab(to)
    document.getElementById(`${id}-tab-${to}`)?.focus()
  }

  /** Where the divider between demo and code sits, as the demo's share of the width. */
  const resize = (share: number) => setSplit(Math.min(0.75, Math.max(0.25, share)))
  const dragTo = (x: number) => {
    const rect = body.current?.getBoundingClientRect()
    if (rect) resize((x - rect.left) / rect.width)
  }

  const copy = async () => {
    if (!file) return
    await write(file.code)
    analytics.track('example.copied', { example: `${pkg}/${example}`, file: file.path })
  }

  return (
    <figure className="@container mb-8 overflow-hidden rounded-[14px] border border-border bg-muted">
      <div className="flex items-center gap-2.5 border-b border-border py-2 pr-2.5 pl-2">
        {/* biome-ignore lint/a11y/useSemanticElements: a segmented control of toggle buttons */}
        <div
          className="inline-flex shrink-0 gap-0.5 rounded-sm border border-border bg-background p-0.5"
          role="group"
          aria-label="Show"
        >
          {views.map((v) => (
            <button
              key={v.view}
              type="button"
              aria-pressed={view === v.view}
              className={cn(
                'inline-flex min-h-7 cursor-pointer items-center gap-1.5 rounded-[5px] bg-transparent px-2 text-[13px] font-medium text-muted-foreground transition-colors duration-120 hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground',
                // A phone has no room for both, so Split shows the demo there.
                v.view === 'split' && 'max-phone:hidden',
                v.view === 'demo' &&
                  view === 'split' &&
                  'max-phone:bg-muted max-phone:text-foreground',
              )}
              onClick={() => setView(v.view)}
            >
              <Icon icon={icons[v.icon]} size={15} />
              {v.label}
            </button>
          ))}
        </div>
        <span className="flex-auto overflow-hidden font-mono text-[12px] text-ellipsis whitespace-nowrap text-muted-foreground max-phone:invisible">
          {src}
        </span>
        <button type="button" className={button} onClick={reload}>
          <Icon icon={icons.refresh} size={15} /> Reload
        </button>
        <a
          className={button}
          href={src}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the example in a new tab"
        >
          <Icon icon={icons.external} size={15} />
        </a>
      </div>

      <div
        ref={body}
        className={cn(
          'grid grid-cols-1',
          view === 'split' &&
            '@min-[52rem]:min-h-110 @min-[52rem]:grid-cols-[minmax(0,var(--demo))_1px_minmax(0,var(--code))]',
        )}
        style={
          {
            '--demo': `${split}fr`,
            '--code': `${1 - split}fr`,
            ...(height ? { minHeight: height } : {}),
          } as CSSProperties
        }
      >
        <div
          className={cn(
            'grid min-h-75 min-w-0',
            width && 'justify-items-center',
            view === 'code' && 'hidden',
          )}
        >
          <iframe
            ref={frame}
            key={nonce}
            src={src}
            title={title ?? `${pkg} example`}
            className={cn(
              'h-full min-h-75 w-full border-0 bg-background',
              width && 'max-w-full border-x border-border',
              // The divider keeps the pointer while it is dragged across the frame.
              dragging && 'pointer-events-none',
            )}
            style={{ ...(height ? { minHeight: height } : {}), ...(width ? { width } : {}) }}
            allow="clipboard-write"
            onLoad={read}
          />
        </div>

        {view === 'split' && (
          // biome-ignore lint/a11y/useSemanticElements: a draggable divider, which <hr> cannot be
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the demo and the code"
            aria-valuenow={Math.round(split * 100)}
            aria-valuemin={25}
            aria-valuemax={75}
            tabIndex={0}
            className={cn(
              'relative z-10 hidden cursor-col-resize touch-none bg-border outline-none transition-colors duration-120 after:absolute after:inset-y-0 after:-right-1.5 after:-left-1.5 after:content-[""] hover:bg-link focus-visible:bg-link @min-[52rem]:block',
              dragging && 'bg-link',
            )}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragging(true)
            }}
            onPointerMove={(e) => dragging && dragTo(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onDoubleClick={() => setSplit(0.5)}
            onKeyDown={(e) => {
              const step = e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? 0.05 : 0
              if (!step) return
              e.preventDefault()
              resize(split + step)
            }}
          />
        )}

        <div
          className={cn(
            'flex min-w-0 flex-col bg-code',
            view === 'demo' && 'hidden',
            view === 'split' && 'border-t border-border max-phone:hidden @min-[52rem]:border-t-0',
          )}
        >
          <div className="flex items-center gap-0.5 border-b border-border pr-1.5">
            <div
              className="flex min-w-0 flex-auto overflow-x-auto"
              role="tablist"
              aria-label="Files"
              onKeyDown={onTabKey}
            >
              {Array.from({ length: tabs }, (_, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: the tabs are fixed for an example
                  key={i}
                  id={`${id}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  aria-controls={`${id}-panel`}
                  tabIndex={i === tab ? 0 : -1}
                  className="-mb-px inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 border-transparent bg-transparent px-3.5 pt-2.5 pb-2 font-mono text-[12.5px] whitespace-nowrap text-muted-foreground transition-colors duration-120 hover:text-foreground aria-selected:border-primary aria-selected:text-foreground"
                  onClick={() => setTab(i)}
                >
                  {files[i] ? (
                    files[i].path
                  ) : (
                    <>
                      <Icon icon={icons.storage} size={14} />
                      localStorage
                      {entries.length > 0 && (
                        <span className="rounded-full bg-border px-1.5 text-[11px] leading-4 text-foreground">
                          {entries.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
            {file ? (
              <>
                <button
                  type="button"
                  className={cn(iconButton, 'data-copied:[&_svg]:animate-pop')}
                  data-copied={copied || undefined}
                  onClick={copy}
                  aria-label={`Copy ${file.path}`}
                >
                  <Icon key={String(copied)} icon={copied ? icons.check : icons.copy} size={16} />
                </button>
                <a
                  className={iconButton}
                  href={`${repoUrl}/blob/main/packages/${pkg}/examples/${file.path}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${file.path} on GitHub`}
                >
                  <Icon icon={icons.github} size={16} />
                </a>
              </>
            ) : (
              <button
                type="button"
                className={cn(button, 'min-h-7')}
                onClick={clear}
                disabled={!entries.length}
              >
                <Icon icon={icons.trash} size={14} /> Clear
              </button>
            )}
          </div>
          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${tab}`}
            className="relative min-h-0 flex-auto"
          >
            <div
              className={cn(
                'overflow-auto',
                view === 'split' &&
                  'max-h-110 @min-[52rem]:absolute @min-[52rem]:inset-0 @min-[52rem]:max-h-none',
              )}
            >
              {file ? (
                <div
                  className="example-code"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted at build time
                  dangerouslySetInnerHTML={{ __html: file.html }}
                />
              ) : (
                <div className="flex flex-col gap-2.5 px-4 py-3.5">
                  {entries.length ? (
                    entries.map(([key, value]) => (
                      <div key={key}>
                        <span className="font-mono text-[12px] text-link">{key}</span>
                        <pre className="mt-1 font-mono text-[12px] leading-[18px] break-all whitespace-pre-wrap">
                          {pretty(value)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-[13px] leading-5 text-muted-foreground">
                      Nothing stored yet. Interact with the example, then reload it to see what
                      persists.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {description && (
        <figcaption className="border-t border-border px-3.5 py-2.5 text-[14px] leading-[21px] text-muted-foreground">
          {description}
        </figcaption>
      )}
    </figure>
  )
}

function pretty(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}
