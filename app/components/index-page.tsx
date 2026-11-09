import { cn } from '@kitr/tailwind'
import type { ReactNode } from 'react'
import { GroupTile } from './article-layout'

/** The title and one-paragraph intro at the top of an index page (/docs, /guides, /packages, /privacy). */
export function IndexHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-7 max-phone:mb-3">
      <h1 className="mb-2 text-[44px] max-phone:text-[34px] max-phone:leading-10">{title}</h1>
      <p className="m-0 max-w-160 text-muted-foreground max-phone:text-[15px] max-phone:leading-[23px]">
        {children}
      </p>
    </div>
  )
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/** One group of an index: its tile and title, a line on what it holds, and a grid of cards. */
export function IndexGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  const id = slugify(title)
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="mb-1 flex items-center gap-3 text-[22px] leading-7">
        <GroupTile group={title} size={32} />
        {title}
      </h2>
      {description && <p className="mb-5 max-w-160 text-muted-foreground">{description}</p>}
      <div className="mt-4.5 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {children}
      </div>
    </section>
  )
}

/** A card that is a link as a whole: its border darkens and it lifts on hover. */
export const indexCard = cn(
  'flex flex-col gap-2 rounded-lg border border-border bg-background p-4.5 text-foreground no-underline',
  'transition-[translate,border-color,box-shadow] duration-200 ease-out',
  'hover:-translate-y-px hover:border-border-strong hover:text-foreground hover:shadow-md',
  'focus-visible:-translate-y-px focus-visible:border-border-strong focus-visible:text-foreground focus-visible:shadow-md',
)

/** A card's title and its one line. */
export function CardText({ title, summary }: { title: string; summary?: string }) {
  return (
    <>
      <span className="block text-[17px] leading-6 font-semibold">{title}</span>
      {summary && (
        <span className="flex-auto text-[14.5px] leading-[21px] text-muted-foreground">
          {summary}
        </span>
      )}
    </>
  )
}
