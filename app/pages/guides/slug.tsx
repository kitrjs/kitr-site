import { getRouteApi } from '@kitr/router'
import { guideMeta, guidesNav } from '#app/lib/content'
import { ArticleLayout } from '#components/article-layout'
import { GuideMeta } from '#components/guide-bits'

const route = getRouteApi('/_site/guides/$slug')

export default function GuidePage() {
  const page = route.useLoaderData()
  const { slug } = route.useParams()
  const meta = guideMeta(slug)
  return (
    <ArticleLayout
      section="guides"
      nav={guidesNav}
      page={page}
      slug={slug}
      label={`Guide · ${page.section}`}
      meta={<GuideMeta packages={meta.packages} time={meta.time} />}
    />
  )
}
