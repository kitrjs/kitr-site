import { getRouteApi } from '@kitr/router'
import { PackageLayout } from '#components/package-layout'

const route = getRouteApi('/_site/packages/$name')

export default function PackageOverview() {
  const { pkg, page } = route.useLoaderData()
  return <PackageLayout pkg={pkg} page={page} current="" />
}
