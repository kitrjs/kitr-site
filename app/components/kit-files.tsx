import { useClipboard } from '@kitr/native/react'
import { cn } from '@kitr/tailwind'
import { useMemo, useRef, useState } from 'react'
import { type KitEntry, type KitFile, loadKitFiles } from '#app/lib/catalog'
import { Icon, icons } from './icons'
import { sourceUrl } from './kit-bits'

type Folder = { name: string; path: string; folders: Folder[]; files: string[] }

/** Paths as a tree: folders first, then files, each in name order. */
function treeOf(paths: string[]): Folder {
  const root: Folder = { name: '', path: '', folders: [], files: [] }
  for (const path of paths) {
    const parts = path.split('/')
    let at = root
    for (const part of parts.slice(0, -1)) {
      const next = at.path ? `${at.path}/${part}` : part
      let folder = at.folders.find((f) => f.name === part)
      if (!folder) {
        folder = { name: part, path: next, folders: [], files: [] }
        at.folders.push(folder)
      }
      at = folder
    }
    at.files.push(path)
  }
  const sort = (f: Folder) => {
    f.folders.sort((a, b) => a.name.localeCompare(b.name))
    f.files.sort((a, b) => a.localeCompare(b))
    f.folders.forEach(sort)
  }
  sort(root)
  return root
}

/** The folders holding a path: `app/pages/home.tsx` is in `app` and `app/pages`. */
const parentsOf = (path: string) =>
  path
    .split('/')
    .slice(0, -1)
    .map((_, i, parts) => parts.slice(0, i + 1).join('/'))

const row =
  'flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-sm border-0 bg-transparent py-1 pr-2 text-left font-mono text-[13px] leading-5 text-foreground transition-colors duration-120 hover:bg-border'

const iconButton =
  'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent text-muted-foreground no-underline transition-[color,background-color,scale] duration-120 hover:bg-border hover:text-foreground active:scale-97'

/**
 * Every file a kit writes: the tree on the left, the picked file highlighted on the right. It
 * opens on the kit's entry file, which comes with the page; the rest load on the first pick.
 * On a phone the tree sits above the code, in a shorter scroll box.
 */
export function KitFiles({ kit, entry }: { kit: KitEntry; entry?: KitFile }) {
  const tree = useMemo(() => treeOf(kit.files), [kit.files])
  const [files, setFiles] = useState<Record<string, KitFile>>(() =>
    entry ? { [entry.path]: entry } : {},
  )
  const [current, setCurrent] = useState(entry?.path ?? kit.files[0] ?? '')
  const [open, setOpen] = useState(
    () => new Set([...tree.folders.map((f) => f.path), ...parentsOf(current)]),
  )
  const code = useRef<HTMLDivElement>(null)
  const { copy, copied } = useClipboard()

  const pick = async (path: string) => {
    setCurrent(path)
    if (files[path]) return
    const all = await loadKitFiles(kit.name)
    setFiles(Object.fromEntries(all.map((f) => [f.path, f])))
  }
  const toggle = (path: string) =>
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const renderFolder = (folder: Folder, depth: number) => (
    <ul className="flex flex-col">
      {folder.folders.map((f) => (
        <li key={f.path}>
          <button
            type="button"
            className={row}
            style={{ paddingLeft: 8 + depth * 14 }}
            aria-expanded={open.has(f.path)}
            onClick={() => toggle(f.path)}
          >
            <Icon
              icon={icons.chevronDown}
              size={14}
              className={cn(
                'flex-none text-muted-foreground transition-transform duration-120',
                !open.has(f.path) && '-rotate-90',
              )}
            />
            <Icon
              icon={open.has(f.path) ? icons.folderOpen : icons.folder}
              size={16}
              className="flex-none text-muted-foreground"
            />
            <span className="truncate">{f.name}</span>
          </button>
          {open.has(f.path) && renderFolder(f, depth + 1)}
        </li>
      ))}
      {folder.files.map((path) => (
        <li key={path}>
          <button
            type="button"
            className={cn(
              row,
              'aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground',
            )}
            style={{ paddingLeft: 8 + depth * 14 + 20 }}
            aria-current={path === current}
            onClick={() => pick(path)}
          >
            <Icon icon={icons.file} size={16} className="flex-none opacity-70" />
            <span className="truncate">{path.split('/').pop()}</span>
          </button>
        </li>
      ))}
    </ul>
  )

  const file = files[current]
  return (
    <div className="grid h-[640px] grid-cols-[280px_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-border bg-muted max-tablet:grid-cols-[230px_minmax(0,1fr)] max-[760px]:h-auto max-[760px]:grid-cols-1">
      <nav
        className="min-h-0 overflow-auto border-r border-border p-2 max-[760px]:max-h-64 max-[760px]:border-r-0 max-[760px]:border-b"
        aria-label={`Files in the ${kit.name} kit`}
      >
        {renderFolder(tree, 0)}
      </nav>
      <div className="flex min-h-0 min-w-0 flex-col bg-code">
        <div className="flex items-center gap-1 border-b border-border py-1 pr-1.5 pl-4">
          <span className="min-w-0 flex-auto truncate font-mono text-[12.5px] text-muted-foreground">
            {current}
          </span>
          <button
            type="button"
            className={cn(iconButton, 'data-copied:[&_svg]:animate-pop')}
            data-copied={copied || undefined}
            disabled={!file}
            onClick={() => copy(code.current?.textContent ?? '')}
            aria-label={`Copy ${current}`}
          >
            <Icon key={String(copied)} icon={copied ? icons.check : icons.copy} size={16} />
          </button>
          <a
            href={sourceUrl(kit, current)}
            target="_blank"
            rel="noreferrer"
            className={iconButton}
            aria-label={`${current} on GitHub`}
          >
            <Icon icon={icons.github} size={16} />
          </a>
        </div>
        <div
          ref={code}
          className="example-code min-h-0 flex-auto overflow-auto max-[760px]:max-h-[70vh]"
          aria-busy={!file}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted at build time
          dangerouslySetInnerHTML={{ __html: file?.html ?? '' }}
        />
      </div>
    </div>
  )
}
