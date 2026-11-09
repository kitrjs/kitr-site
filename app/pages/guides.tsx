import { Link } from '@kitr/router'
import { guidesNav } from '#app/lib/content'
import { CardText, IndexGroup, IndexHead, indexCard } from '#components/index-page'

/** /guides: each group, and each guide as its title and one sentence. */
export default function Guides() {
  return (
    <main className="container pt-12 pb-16">
      <IndexHead title="Guides">
        Step by step, from an empty folder to an app in production, on the web, on phones and on
        desktops. For one package in depth, open its page under <Link to="/packages">Packages</Link>
        .
      </IndexHead>
      {guidesNav.map((group) => (
        <IndexGroup key={group.title} title={group.title} description={group.description}>
          {group.items.map((guide) => (
            <Link
              key={guide.slug}
              to="/guides/$slug"
              params={{ slug: guide.slug }}
              className={indexCard}
            >
              <CardText title={guide.title} summary={guide.description} />
            </Link>
          ))}
        </IndexGroup>
      ))}
    </main>
  )
}
