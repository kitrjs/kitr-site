import { cn } from '@kitr/tailwind'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, icons } from './icons'

/** Everything an example stores is namespaced, so examples never see each other's data. */
export const storagePrefix = (pkg: string, example: string) => `kitr-play:${pkg}:${example}:`

/**
 * A live example in a frame, beside the browser storage it writes. Reload the frame to see what
 * persists (its storage and its URL); clear its storage to start fresh at the example's own URL. An example that stores nothing (`storage: false` in
 * its meta) gets the whole width.
 */
/** The small bordered buttons in the frame's bar and storage panel. */
const button =
  'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 text-[13px] font-medium text-foreground no-underline disabled:cursor-default disabled:opacity-50'

export function LiveExample({
  pkg,
  example,
  title,
  description,
  storage,
  height,
  width,
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
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [nonce, setNonce] = useState(0)
  const [entries, setEntries] = useState<Array<[string, string]>>([])
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

  return (
    <figure className="mb-8 overflow-hidden rounded-[14px] border border-border bg-muted">
      <div className="flex items-center gap-2.5 border-b border-border py-2 pr-2.5 pl-3.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-border" />
          ))}
        </span>
        <span className="flex-auto overflow-hidden font-mono text-[12px] text-ellipsis whitespace-nowrap text-muted-foreground">
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
        className={cn(
          'grid min-h-75 grid-cols-[minmax(0,1fr)_260px] max-phone:grid-cols-1',
          storage === false && 'grid-cols-1',
          width && 'justify-items-center',
        )}
        style={height ? { minHeight: height } : undefined}
      >
        <iframe
          ref={frame}
          key={nonce}
          src={src}
          title={title ?? `${pkg} example`}
          className={cn(
            'h-full min-h-75 w-full border-0 bg-background',
            width && 'max-w-full border-x border-border',
          )}
          style={{ ...(height ? { minHeight: height } : {}), ...(width ? { width } : {}) }}
          allow="clipboard-write"
          onLoad={read}
        />
        {storage !== false && (
          <aside
            className="flex min-w-0 flex-col gap-2.5 border-l border-border px-3.5 py-3 max-phone:border-t max-phone:border-l-0"
            aria-label="Browser storage"
          >
            <div className="flex items-center justify-between">
              <span className="label">localStorage</span>
              <button type="button" className={button} onClick={clear} disabled={!entries.length}>
                <Icon icon={icons.trash} size={14} /> Clear
              </button>
            </div>
            {entries.length ? (
              entries.map(([key, value]) => (
                <div key={key}>
                  <span className="font-mono text-[12px] text-link">{key}</span>
                  <pre className="mt-1 max-h-50 overflow-auto font-mono text-[12px] leading-[18px] break-all whitespace-pre-wrap">
                    {pretty(value)}
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-[13px] leading-5 text-muted-foreground">
                Nothing stored yet. Interact with the example.
              </p>
            )}
          </aside>
        )}
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
