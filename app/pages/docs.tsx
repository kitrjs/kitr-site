import { Link } from '@kitr/router'
import { docsNav } from '#app/lib/content'
import { Icon, icons } from '#components/icons'
import { CardText, IndexGroup, IndexHead, indexCard } from '#components/index-page'

const tasks: Array<[want: string, to: string, label: string]> = [
  ['Understand why kitr exists', '/docs/what-is-kitr', 'What is kitr'],
  ['Create an app', '/docs/getting-started', 'Getting started'],
  ['Use a package', '/packages', 'Packages'],
  ['Configure something', '/docs/configuration', 'Configuration'],
  ['Write your own server logic or hooks', '/docs/extending', 'Add your own code'],
  ['Ship to phones or desktops', '/guides', 'Guides'],
]

/** A "you want to… go here" card: lifts on hover, and its arrow nudges forward. */
const task =
  'group flex h-full flex-col gap-1 rounded-lg border border-border bg-muted px-4.5 py-3.5 text-foreground no-underline transition-[translate,border-color,box-shadow] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-md focus-visible:border-border-strong focus-visible:shadow-md max-phone:gap-0.5 max-phone:px-3.5 max-phone:py-2.5'

/** /docs: where to start for what you want to do, then every page by group, one line each. */
export default function DocsIndex() {
  return (
    <main className="container pt-12 pb-16">
      <IndexHead title="Docs">
        How kitr works, from your first app to writing your own packages. Pick what you are trying
        to do, or browse every page below.
      </IndexHead>
      <section
        className="mb-12 max-phone:mt-2 max-phone:mb-10 max-[640px]:mt-5"
        aria-labelledby="start"
      >
        <h2 id="start" className="label mb-3">
          If you want to…
        </h2>
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 max-[900px]:grid-cols-2 max-phone:gap-2 max-[640px]:grid-cols-1">
          {tasks.map(([want, to, label]) => (
            <li key={to}>
              <Link to={to} className={task}>
                <span className="text-[14.5px] leading-[21px] text-muted-foreground">{want}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-link">
                  {label}
                  <Icon
                    icon={icons.arrow}
                    size={16}
                    className="transition-[translate] duration-150 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {docsNav.map((group) => (
        <IndexGroup key={group.title} title={group.title}>
          {group.items.map((item) => (
            <Link
              key={item.slug}
              to="/docs/$slug"
              params={{ slug: item.slug }}
              className={indexCard}
            >
              <CardText title={item.title} summary={item.description} />
            </Link>
          ))}
        </IndexGroup>
      ))}
    </main>
  )
}
