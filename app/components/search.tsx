import { BookOpen01Icon, File02Icon, MapsIcon } from '@hugeicons/core-free-icons'
import { AnimatePresence, motion, presets, useIsPresent } from '@kitr/animation'
import { useNavigate } from '@kitr/router'
import { type ComponentProps, useCallback, useEffect, useRef, useState } from 'react'
import { findPackage } from '#app/lib/catalog'
import { loadSiteSearch, type SearchEntry, search } from '#app/lib/content'
import { Icon, icons } from './icons'
import { Tile } from './package-bits'

const pageKinds: Record<string, string> = { guide: 'Guide', api: 'API' }

/** What a result row shows: the package or page it belongs to, then where in it. */
function describe(r: SearchEntry) {
  const [path = ''] = r.url.split('#')
  const [, root, name, sub] = path.split('/')
  const pkg = root === 'packages' && name ? findPackage(name) : undefined
  if (pkg)
    return {
      icon: <Tile pkg={pkg} size={32} className="rounded-[9px]" />,
      title: pkg.title,
      kind: sub ? (pageKinds[sub] ?? 'Package') : 'Package',
    }
  const glyph = root === 'guides' ? BookOpen01Icon : r.section === 'Roadmap' ? MapsIcon : File02Icon
  return {
    icon: (
      <span className="grid size-8 place-items-center rounded-[9px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--kitr-color-border)]">
        <Icon icon={glyph} size={17} />
      </span>
    ),
    title: r.title,
    kind: root === 'guides' ? 'Guide' : r.section === 'Roadmap' ? 'Roadmap' : 'Docs',
  }
}

/** The ⌘K palette. The index loads on first open, so pages don't pay for it. */
export function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<SearchEntry[]>([])
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  // Unmounting a modal dialog drops focus to <body>, so remember where it was to put it back.
  const returnTo = useRef<Element | null>(null)
  const navigate = useNavigate()

  const show = useCallback(() => {
    // Reopened while it fades out: focus is inside the dialog, so keep the original target.
    if (!dialog.current) returnTo.current = document.activeElement
    setOpen(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A page with its own "/" (the packages filter) takes the key first and claims it.
      if (e.defaultPrevented) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        show()
      } else if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

  useEffect(() => {
    if (!open) return
    const el = dialog.current
    if (el && !el.open) el.showModal()
    void loadSiteSearch().then(setEntries)
  }, [open])

  // Once the exit has played and the dialog is gone, hand focus back.
  const restore = () => {
    setQuery('')
    setActive(0)
    const target = returnTo.current
    const back =
      target instanceof HTMLElement && target.isConnected && target !== document.body
        ? target
        : button.current
    back?.focus({ preventScroll: true })
    returnTo.current = null
  }

  const results = search(entries, query)
  // The dialog stays open (and modal) while it animates out and unmounts when the exit is done.
  // The query is cleared then too, so the results don't collapse to the empty state mid-fade.
  const close = () => {
    // Drop the keyboard now, while the dialog fades, rather than after: on phones it otherwise
    // closes once the dialog has gone and the page jumps as the viewport grows back.
    const focused = document.activeElement
    if (focused instanceof HTMLElement && dialog.current?.contains(focused)) focused.blur()
    setOpen(false)
  }
  const go = (entry?: SearchEntry) => {
    if (!entry) return
    close()
    void navigate({ href: entry.url })
  }

  return (
    <>
      <button
        type="button"
        className="flex min-h-10 min-w-55 cursor-pointer items-center gap-2.5 rounded-sm border border-border bg-muted px-3 text-[14px] text-muted-foreground transition-[background-color,color,border-color,scale] duration-120 active:scale-97 max-phone:min-w-0"
        ref={button}
        onClick={show}
      >
        <Icon icon={icons.search} size={16} />
        <span className="flex-1 text-left max-phone:sr-only">Search docs</span>
        <kbd className="font-mono max-phone:hidden">⌘K</kbd>
      </button>
      <AnimatePresence onExitComplete={restore}>
        {open && (
          <Dialog
            ref={dialog}
            onClose={close}
            onCancel={(e) => {
              // Escape: run our own close so it animates too.
              e.preventDefault()
              close()
            }}
            onClick={(e) => {
              if (e.target === dialog.current) close()
            }}
            aria-label="Search"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4 text-muted-foreground">
              <Icon icon={icons.search} size={18} className="flex-none" />
              <input
                autoFocus
                type="search"
                className="min-h-14 flex-auto border-0 bg-transparent text-[18px] text-foreground outline-none"
                placeholder="Search packages and docs"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1))
                  else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
                  else if (e.key === 'Enter') go(results[active])
                  else return
                  e.preventDefault()
                }}
                aria-controls="search-results"
              />
              <button
                type="button"
                className="min-h-8 min-w-11 flex-none cursor-pointer rounded-sm border border-border bg-transparent px-2 py-1 font-mono text-[12px] text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:border-foreground focus-visible:text-foreground pointer-coarse:text-[0px] pointer-coarse:before:text-[13px] pointer-coarse:before:content-['Close']"
                onClick={close}
                aria-label="Close search"
              >
                esc
              </button>
            </div>
            <ul id="search-results" className="max-h-[60vh] overflow-y-auto p-2">
              {results.map((r, i) => {
                const d = describe(r)
                return (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2.5 text-foreground no-underline transition-[background-color] duration-120 hover:text-foreground aria-[current=true]:bg-muted max-[560px]:grid-cols-[32px_minmax(0,1fr)] max-[560px]:p-2.5"
                      aria-current={i === active ? 'true' : undefined}
                      onMouseEnter={() => setActive(i)}
                      onClick={(e) => {
                        e.preventDefault()
                        go(r)
                      }}
                    >
                      {d.icon}
                      <span className="flex min-w-0 flex-col gap-px">
                        <span className="truncate text-[15px] leading-[22px]">
                          <strong className="font-semibold">{d.title}</strong>
                          {r.heading && (
                            <span className="text-muted-foreground before:content-['_›_']">
                              {r.heading}
                            </span>
                          )}
                        </span>
                        <span className="truncate text-[13.5px] leading-5 text-muted-foreground">
                          {r.text.slice(0, 160)}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground max-[560px]:hidden">
                        {d.kind}
                      </span>
                    </a>
                  </li>
                )
              })}
              {query && !results.length && (
                <li className="px-3 py-4 text-muted-foreground">No results for “{query}”.</li>
              )}
              {!query && (
                <li className="px-3 py-4 text-muted-foreground">
                  Try “persist”, “forms”, “sign in” or “deploy”.
                </li>
              )}
            </ul>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * The palette's modal: scales in with the kitr preset, and its backdrop fades with it. On touch
 * screens it only fades: the keyboard opens and folds away at the same time, and a scale on top
 * of that reads as a flicker. `search-dialog` is a hook: while it is open, motion.css keeps page
 * transitions plain.
 */
function Dialog(props: ComponentProps<typeof motion.dialog>) {
  const present = useIsPresent()
  const [touch] = useState(() => matchMedia('(hover: none)').matches)
  return (
    <motion.dialog
      {...(touch ? presets.fade : presets.scale)}
      {...props}
      data-closing={present ? undefined : ''}
      className="search-dialog mx-auto mt-[10vh] mb-auto w-[min(640px,calc(100vw-32px))] rounded-[14px] border border-border bg-background text-foreground shadow-md backdrop:bg-[rgb(11_18_28/0.5)] backdrop:transition-opacity backdrop:duration-200 backdrop:ease-out starting:backdrop:opacity-0 data-closing:backdrop:opacity-0 data-closing:backdrop:duration-140 data-closing:backdrop:ease-in"
    />
  )
}
