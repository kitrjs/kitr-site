import { getRouteApi } from '@kitr/router'
import { docsNav } from '#app/lib/content'
import { ArticleLayout } from '#components/article-layout'

const route = getRouteApi('/_site/docs/$slug')

export default function DocsPage() {
  const page = route.useLoaderData()
  const { slug } = route.useParams()
  return <ArticleLayout section="docs" nav={docsNav} page={page} slug={slug} label={page.section} />
}
