import { Link } from '@kitr/router'
import { findPackage } from '#app/lib/catalog'
import { Tile } from './package-bits'

/** Under a guide's title: how long it takes and the packages it uses, each linked. */
export function GuideMeta({ packages, time }: { packages: string[]; time?: string }) {
  const used = packages.map(findPackage).filter((p) => p !== undefined)
  if (!used.length && !time) return null
  return (
    <div className="-mt-2 mb-7 flex flex-wrap items-center gap-3">
      {time && <span className="font-mono text-muted-foreground">{time}</span>}
      {used.length > 0 && (
        <ul
          className="m-0 flex list-none flex-wrap gap-1.5 p-0"
          aria-label="Packages this guide uses"
        >
          {used.map((p) => (
            <li key={p.name}>
              <Link
                to="/packages/$name"
                params={{ name: p.name }}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border pr-2.5 pl-[5px] font-mono text-[12.5px] text-foreground no-underline transition-[border-color] duration-120 hover:border-foreground hover:text-foreground"
              >
                <Tile pkg={p} size={16} />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
