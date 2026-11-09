import { getRouteApi } from '@kitr/router'
import { PackageLayout } from '#components/package-layout'

const route = getRouteApi('/_site/packages/$name/$page')

export default function PackagePage() {
  const { pkg, page } = route.useLoaderData()
  const { page: slug } = route.useParams()
  return <PackageLayout pkg={pkg} page={page} current={slug} />
}
