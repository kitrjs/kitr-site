import { jsonLd } from '@kitr/seo'

/** The canonical origin. config/seo.ts holds the same value for the build (sitemap, robots). */
export const siteUrl = 'https://kitr.dev'

/** The page's canonical URL, for `seo({ url })`. */
export const pageUrl = (path: string) => `${siteUrl}${path}`

/**
 * The share image scripts/site-data.mjs draws for a page: `/` → `og/home.png`,
 * `/packages/query/api` → `og/packages-query-api.png`.
 */
export const ogImage = (path: string) =>
  `${siteUrl}/og/${path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')}.png`

const sections: Record<string, string> = {
  docs: 'Docs',
  guides: 'Guides',
  packages: 'Packages',
  platforms: 'Platforms',
}

/**
 * TechArticle and BreadcrumbList structured data for a docs, guide, package or platform page, so
 * search results can show the section path: kitr › Packages › query › api. Two scripts, for
 * `head().scripts`.
 */
export function articleJsonLd({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  const crumbs = [{ name: 'kitr', url: `${siteUrl}/` }]
  let url = siteUrl
  for (const part of path.split('/').filter(Boolean)) {
    url += `/${part}`
    crumbs.push({ name: sections[part] ?? part, url })
  }
  return [
    jsonLd({
      '@type': 'TechArticle',
      headline: title,
      description,
      url: pageUrl(path),
      image: ogImage(path),
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: 'kitr', url: `${siteUrl}/` },
      publisher: { '@type': 'Organization', name: 'kitr', url: `${siteUrl}/` },
    }),
    jsonLd({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    }),
  ]
}
