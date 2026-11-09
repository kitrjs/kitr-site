import { Search01Icon } from '@hugeicons/core-free-icons'
import { getRouteApi, Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type Category,
  categories,
  type PackageEntry,
  type PlannedEntry,
  packages,
  planned,
  plannedStatus,
  type RunsOn,
} from '#app/lib/catalog'
import { upstream } from '#app/lib/upstream'
import { Icon } from '#components/icons'
import { IndexHead } from '#components/index-page'
import { cardGrid, DirectoryCard, PlannedCard } from '#components/package-bits'

const route = getRouteApi('/_site/packages')

/** "Build a package": in the sidebar on wide screens, under the results on narrow ones. */
const buildCard =
  'flex flex-col gap-1 rounded-md bg-muted p-4 text-[14px] leading-[21px] text-foreground no-underline'
/** A text button that clears the filters. */
const clearButton =
  'cursor-pointer border-0 bg-transparent text-link underline underline-offset-[3px]'
const groupHead =
  'mb-3.5 flex scroll-mt-[150px] items-center gap-2.5 text-[18px] leading-6 font-semibold max-[900px]:scroll-mt-[130px]'

type RunsFilter = 'client' | 'server'
type Search = { q?: string; category?: Category; runs?: RunsFilter }

type Entry = PackageEntry | PlannedEntry

/** Categories in catalog order, leaving out any with no shipped package yet. */
const categoryOrder = (Object.keys(categories) as Category[]).filter((c) =>
  packages.some((p) => p.category === c),
)

/** A package that runs on both sides matches either filter. */
const matchesRuns = (value: RunsOn, runs: RunsFilter | undefined) =>
  !runs || value === runs || value === 'both'

/** Everything a search term can hit: name, summary, category and the projects it builds on. */
const haystack = new Map<Entry, string>(
  [...packages, ...planned].map((p) => [
    p,
    [
      p.name,
      'title' in p ? p.title : '',
      p.summary,
      categories[p.category].label,
      ...(p.builtOn ?? []).flatMap((b) => [b, upstream(b).name]),
    ]
      .join(' ')
      .toLowerCase(),
  ]),
)

/** 3 for an exact name, 2 for a name prefix, 1 for a match elsewhere, 0 for no match. */
function score(p: Entry, terms: string[]) {
  if (!terms.length) return 1
  const text = haystack.get(p) ?? ''
  if (!terms.every((t) => text.includes(t))) return 0
  const q = terms.join(' ')
  return p.name === q ? 3 : p.name.startsWith(q) ? 2 : 1
}

export default function Packages() {
  const urlSearch = route.useSearch()
  const navigate = route.useNavigate()
  // The page is prerendered without filters, so the first client render matches that and the
  // filters in the URL apply right after hydration.
  const [hydrated, setHydrated] = useState(false)
  const [query, setQuery] = useState('')
  const search: Search = hydrated ? urlSearch : {}
  const { category, runs } = search
  const input = useRef<HTMLInputElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: read the URL once, on mount.
  useEffect(() => {
    setQuery(urlSearch.q ?? '')
    setHydrated(true)
  }, [])

  const set = (next: Search) =>
    navigate({ search: (s) => ({ ...s, ...next }), replace: true, resetScroll: false })

  // "/" jumps to the filter, the way it does on most package directories.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key !== '/' || e.metaKey || e.ctrlKey || t.closest('input, textarea, select')) return
      if (t.isContentEditable) return
      e.preventDefault()
      input.current?.focus()
    }
    // Capture, so this runs before the site-wide "/" that opens the search dialog.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  const searchBox = useRef<HTMLDivElement>(null)
  // Keep the chosen category chip in view when the chips are one scrolling row (phones).
  const chips = useRef<HTMLDivElement>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the category changes.
  useEffect(() => {
    const list = chips.current
    const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!list || !chip || list.scrollWidth <= list.clientWidth) return
    const left = chip.offsetLeft - list.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [category])

  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query])

  const view = useMemo(() => {
    const scored = (list: Entry[]) =>
      list.map((p) => ({ p, s: score(p, terms) })).filter((x) => x.s > 0)
    const all = scored([...packages, ...planned])
    const inRuns = all.filter((x) => matchesRuns(x.p.runsOn, runs))
    const inCategory = (x: { p: Entry }) => !category || x.p.category === category
    // Facet counts: each filter counts what the others leave, so a chip never promises
    // results it cannot show. Counts are shipped packages only; roadmap entries sit below.
    const shipped = (x: { p: Entry }) => !('status' in x.p)
    const categoryCounts = new Map<Category, number>()
    for (const x of inRuns.filter(shipped))
      categoryCounts.set(x.p.category, (categoryCounts.get(x.p.category) ?? 0) + 1)
    const built = all.filter((x) => shipped(x) && inCategory(x))
    const runsCounts = {
      any: built.length,
      client: built.filter((x) => matchesRuns(x.p.runsOn, 'client')).length,
      server: built.filter((x) => matchesRuns(x.p.runsOn, 'server')).length,
    }
    const shown = inRuns.filter(inCategory)
    const ranked = [...shown].sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
    return {
      categoryCounts,
      runsCounts,
      total: inRuns.filter(shipped).length,
      built: ranked.filter((x) => !('status' in x.p)).map((x) => x.p as PackageEntry),
      upcoming: ranked
        .filter((x) => 'status' in x.p)
        .map((x) => x.p as PlannedEntry)
        .sort(
          (a, b) =>
            Object.keys(plannedStatus).indexOf(a.status) -
            Object.keys(plannedStatus).indexOf(b.status),
        ),
    }
  }, [terms, category, runs])

  const filtered = Boolean(terms.length || category || runs)
  const count = view.built.length
  const anything = count + view.upcoming.length
  // Browsing everything reads best by category; a search reads best as one ranked list.
  const groups: Array<{ category?: Category; list: PackageEntry[] }> = terms.length
    ? [{ list: view.built }]
    : categoryOrder
        .map((c) => ({ category: c, list: view.built.filter((p) => p.category === c) }))
        .filter((g) => g.list.length)

  const clear = () => {
    setQuery('')
    set({ q: undefined, category: undefined, runs: undefined })
    input.current?.focus()
  }

  return (
    <main className="container pt-12 pb-12 max-phone:pt-7">
      <IndexHead title="Packages">
        Pick the pieces your app needs. Each one is a single <code>kitr add</code> away, and every
        page shows what that command changes and how to use the result.
      </IndexHead>

      <div className="grid grid-cols-[228px_minmax(0,1fr)] grid-rows-[auto_1fr] items-start gap-x-10 [grid-template-areas:'cats_search'_'cats_results'] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto] max-[900px]:[grid-template-areas:'search'_'cats'_'results']">
        <div
          ref={searchBox}
          className="sticky top-16 z-5 bg-background py-3 [grid-area:search] max-[900px]:py-2"
        >
          <label className="group flex min-h-12 items-center gap-2.5 rounded-md border border-border bg-background pr-3 pl-3.5 text-muted-foreground transition-[border-color,box-shadow] duration-150 focus-within:border-link focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--kitr-color-link)_18%,transparent)]">
            <Icon icon={Search01Icon} size={18} />
            <span className="sr-only">Filter packages</span>
            <input
              ref={input}
              type="search"
              className="h-11.5 min-w-0 flex-auto border-0 bg-transparent text-[16px] text-foreground outline-0"
              placeholder="Search packages: login, forms, zustand…"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                set({ q: e.target.value.trim() ? e.target.value : undefined })
              }}
              onFocus={() => {
                // On a phone the keyboard takes half the screen: lift the box to the top so
                // the results show in what is left.
                const box = searchBox.current
                if (!box || !window.matchMedia('(max-width: 900px)').matches) return
                const top = box.getBoundingClientRect().top + window.scrollY - 65
                if (window.scrollY < top - 4) window.scrollTo({ top, behavior: 'smooth' })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) {
                  e.preventDefault()
                  setQuery('')
                  set({ q: undefined })
                }
              }}
            />
            <span
              className="inline-grid size-5.5 flex-none place-items-center rounded-[5px] border border-border font-mono text-[12px] leading-none text-muted-foreground group-focus-within:hidden max-[900px]:hidden"
              aria-hidden="true"
            >
              /
            </span>
          </label>
        </div>

        <nav
          className="sticky top-[77px] flex max-h-[calc(100vh-96px)] flex-col gap-6 overflow-y-auto pt-3 pb-6 [grid-area:cats] [scrollbar-width:thin] max-[900px]:static max-[900px]:max-h-none max-[900px]:overflow-visible max-[900px]:pt-1 max-[900px]:pb-3.5"
          aria-label="Categories"
        >
          <span className="label mb-2 ml-3 block max-[900px]:hidden">Category</span>
          <div
            className="flex flex-col gap-0.5 max-[900px]:-mx-6 max-[900px]:flex-row max-[900px]:gap-2 max-[900px]:overflow-x-auto max-[900px]:overscroll-x-contain max-[900px]:px-6 max-[900px]:py-0.5 max-[900px]:[scrollbar-width:none] max-phone:-mx-4 max-phone:px-4 max-[900px]:[&::-webkit-scrollbar]:hidden"
            ref={chips}
          >
            <CategoryButton
              active={!category}
              onClick={() => set({ category: undefined })}
              color="var(--kitr-color-border)"
              label="All"
              count={view.total}
            />
            {categoryOrder.map((c) => (
              <CategoryButton
                key={c}
                active={category === c}
                onClick={() => set({ category: category === c ? undefined : c })}
                color={categories[c].color}
                label={categories[c].label}
                count={view.categoryCounts.get(c) ?? 0}
              />
            ))}
          </div>
          <Link
            to="/docs/$slug"
            params={{ slug: 'building-packages' }}
            className={cn(buildCard, 'max-[900px]:hidden')}
          >
            <strong>Build a package</strong>
            <span className="text-muted-foreground">
              Add a kitr block and a docs folder, then publish with the kitr-package keyword.
            </span>
          </Link>
        </nav>

        <div className="min-w-0 [grid-area:results] max-[900px]:min-h-screen">
          <div className="mt-1 mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 max-phone:mb-3.5">
            <p className="text-[15px] leading-[22px] text-muted-foreground" aria-live="polite">
              <strong className="text-foreground">{count}</strong>{' '}
              {count === 1 ? 'package' : 'packages'}
              {category && <> in {categories[category].label}</>}
              {terms.length > 0 && <> for “{query.trim()}”</>}
              {view.upcoming.length > 0 && <>, plus {view.upcoming.length} planned</>}
              {filtered && (
                <button type="button" className={cn(clearButton, 'ml-2.5')} onClick={clear}>
                  Clear
                </button>
              )}
            </p>
            <fieldset className="inline-flex gap-0.5 rounded-[8px] border border-border p-[3px]">
              <legend className="sr-only">Runs on</legend>
              {(
                [
                  ['any', undefined, 'Anywhere'],
                  ['client', 'client', 'Client'],
                  ['server', 'server', 'Server'],
                ] as const
              ).map(([key, value, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={runs === value}
                  onClick={() => set({ runs: value })}
                  className="inline-flex min-h-7.5 cursor-pointer items-center gap-1.5 rounded-[5px] border-0 bg-transparent px-2.5 text-[14px] leading-none text-muted-foreground hover:text-foreground aria-pressed:bg-muted aria-pressed:font-semibold aria-pressed:text-foreground"
                  title={
                    value
                      ? `Packages that run on the ${value} (including ones that run on both)`
                      : 'Packages that run anywhere'
                  }
                >
                  {label}
                  <span className="font-mono text-[12px]">{view.runsCounts[key]}</span>
                </button>
              ))}
            </fieldset>
          </div>

          {anything === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-8 text-center">
              <p>
                No package matches{terms.length ? <> “{query.trim()}”</> : ' these filters'}
                {category && <> in {categories[category].label}</>}.
              </p>
              <p className="mt-1.5 text-[15px] leading-[22px] text-muted-foreground">
                Try a broader word, or{' '}
                <button type="button" className={clearButton} onClick={clear}>
                  clear the filters
                </button>
                . Missing something? You can{' '}
                <Link to="/docs/$slug" params={{ slug: 'building-packages' }}>
                  build it as a package
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              {groups.map((g) => (
                <section
                  key={g.category ?? 'matches'}
                  className="[&+&]:mt-10"
                  aria-labelledby={g.category ? `cat-${g.category}` : undefined}
                  aria-label={g.category ? undefined : 'Matches'}
                >
                  {g.category && !category && (
                    <h2 className={groupHead} id={`cat-${g.category}`}>
                      <Dot color={categories[g.category].color} />
                      {categories[g.category].label}
                    </h2>
                  )}
                  <div className={cardGrid}>
                    {g.list.map((p) => (
                      <DirectoryCard key={p.name} pkg={p} showCategory={!g.category} />
                    ))}
                  </div>
                </section>
              ))}

              {view.upcoming.length > 0 && (
                <section className="[&+&]:mt-10" aria-labelledby="planned">
                  <h2 className={groupHead} id="planned">
                    Not built yet
                    <span className="font-mono text-[13px] font-normal text-muted-foreground">
                      {view.upcoming.length}
                    </span>
                  </h2>
                  <p className="-mt-2 mb-4 text-[15px] leading-[22px] text-muted-foreground">
                    On the roadmap. Nothing here can be installed yet, and the details may change.
                  </p>
                  <div className={cardGrid}>
                    {view.upcoming.map((p) => (
                      <PlannedCard key={p.name} pkg={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
          {anything > 0 && (
            <Link
              to="/docs/$slug"
              params={{ slug: 'building-packages' }}
              className={cn(buildCard, 'mt-10 hidden max-[900px]:flex')}
            >
              <strong>Build a package</strong>
              <span className="text-muted-foreground">
                Add a kitr block and a docs folder, then publish with the kitr-package keyword.
              </span>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

/** A category's colour, as a small rounded square. */
function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 flex-none rounded-[3px] max-[900px]:size-2.5"
      style={{ background: color }}
    />
  )
}

function CategoryButton(props: {
  active: boolean
  onClick: () => void
  color: string
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      className="group flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm border-0 bg-transparent px-3 text-left text-[15px] leading-5 whitespace-nowrap text-foreground transition-[background-color,color,border-color,scale] duration-120 hover:bg-muted active:scale-97 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:bg-muted aria-pressed:font-semibold max-[900px]:flex-none max-[900px]:gap-2 max-[900px]:rounded-full max-[900px]:border max-[900px]:border-border max-[900px]:text-[14px] max-[900px]:hover:bg-transparent max-[900px]:disabled:hidden max-[900px]:aria-pressed:border-foreground max-[900px]:aria-pressed:bg-foreground max-[900px]:aria-pressed:text-background"
      aria-pressed={props.active}
      disabled={!props.active && props.count === 0}
      onClick={props.onClick}
    >
      <Dot color={props.color} />
      <span className="flex-1">{props.label}</span>
      <span className="font-mono text-[13px] text-muted-foreground max-[900px]:group-aria-pressed:text-inherit">
        {props.count}
      </span>
    </button>
  )
}
