import { cn } from '@kitr/tailwind'
import type { ReactNode } from 'react'

/** The two columns of a docs, guide or package page: the sidebar and the page. */
export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <div className="container grid grid-cols-[240px_minmax(0,1fr)] items-start gap-12 max-tablet:grid-cols-[200px_minmax(0,1fr)] max-phone:block">
      {children}
    </div>
  )
}

export function DocsMain({ children }: { children: ReactNode }) {
  return <main className="min-w-0 py-10">{children}</main>
}

/**
 * The top of a docs, guide or package page: a tile, then a small caps label and the title. A
 * package's overview is the large version, with its summary and badges under the title.
 */
export function PageHead({
  tile,
  large,
  children,
}: {
  /** The tile, sized 88 when large and 44 otherwise. */
  tile: (className: string) => ReactNode
  large?: boolean
  children: ReactNode
}) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center',
        large ? 'mb-7 gap-6 max-phone:gap-4' : 'mb-5 gap-4',
      )}
    >
      {tile(
        large
          ? 'max-phone:size-14! max-phone:[&_svg]:size-7.5'
          : 'max-phone:size-11! max-phone:[&_svg]:size-6',
      )}
      <div className={cn('flex flex-[1_1_360px] flex-col', large ? 'gap-1.5' : 'gap-0.5')}>
        {children}
      </div>
    </header>
  )
}

/** The last thing on a page: the one before and the one after. */
export function Pager({ children }: { children: ReactNode }) {
  return (
    <nav
      className="mt-14 flex justify-between gap-4 border-t border-border pt-6"
      aria-label="Previous and next"
    >
      {children}
    </nav>
  )
}

export const pagerLink = (next: boolean) =>
  cn(
    'flex min-w-0 flex-[0_1_280px] flex-col gap-0.5 rounded-md border border-border px-4.5 py-3.5 font-semibold text-foreground no-underline wrap-anywhere',
    next && 'ml-auto text-right',
  )
