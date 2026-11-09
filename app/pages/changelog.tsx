import { Link } from '@kitr/router'
import { cn } from '@kitr/tailwind'
import { changelog, type Release, type ReleasePackage } from '#app/lib/changelog'
import { repoUrl } from '#components/chrome'
import { IndexHead } from '#components/index-page'

const kindLabel = { major: 'Major', minor: 'Minor', patch: 'Patch' } as const

function PackageChip({ pkg }: { pkg: ReleasePackage }) {
  const className =
    'rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground no-underline'
  return pkg.to ? (
    <Link to={pkg.to} className={cn(className, 'hover:text-foreground')}>
      {pkg.name}
    </Link>
  ) : (
    <span className={className}>{pkg.name}</span>
  )
}

/** The packages a change touched: all of them, a few chips, or a few and a "more" list. */
function Packages({ release, packages }: { release: Release; packages: ReleasePackage[] }) {
  if (packages.length === release.published.length)
    return <p className="m-0 font-mono text-[11px] text-muted-foreground">Every package</p>
  const shown = packages.slice(0, 6)
  const rest = packages.slice(6)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((p) => (
        <PackageChip key={p.name} pkg={p} />
      ))}
      {rest.length > 0 && (
        <details className="w-full text-xs text-muted-foreground">
          <summary className="cursor-pointer">and {rest.length} more</summary>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {rest.map((p) => (
              <PackageChip key={p.name} pkg={p} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

/** /changelog: every release, newest first, from the Changesets CHANGELOG.md of each package. */
export default function Changelog() {
  return (
    <main className="container pt-12 pb-16">
      <IndexHead title="Changelog">
        What changed in each release of the <code>@kitr/*</code> packages, newest first. They are
        published at the same version; dependency updates are left out. The full notes are in each
        package's <a href={`${repoUrl}/tree/main/packages`}>CHANGELOG.md</a>.
      </IndexHead>
      <ol className="m-0 flex max-w-200 list-none flex-col gap-12 p-0">
        {changelog.map((r) => (
          <li key={r.version}>
            <section aria-labelledby={r.id}>
              <h2 id={r.id} className="m-0 scroll-mt-24 font-mono text-[26px]">
                <a href={`#${r.id}`} className="text-foreground no-underline hover:text-link">
                  {r.version}
                </a>
              </h2>
              <p className="mt-1 mb-0 text-[14px] text-muted-foreground">
                {r.published.length} packages published
                {r.entries.length === 0 && ', dependency updates only'}
              </p>
              <ul className="mt-5 flex list-none flex-col gap-4 p-0">
                {r.entries.map((e) => (
                  <li key={e.hash} className="rounded-lg border border-border p-4">
                    <span
                      className={cn(
                        'rounded-sm px-1.5 py-0.5 font-mono text-[11px] uppercase',
                        e.kind === 'patch' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                      )}
                    >
                      {kindLabel[e.kind]}
                    </span>
                    <div
                      className="prose mt-3"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered at build time from the kitr repo's changelogs
                      dangerouslySetInnerHTML={{ __html: e.html }}
                    />
                    <div className="mt-3">
                      <Packages release={r} packages={e.packages} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </li>
        ))}
      </ol>
    </main>
  )
}
