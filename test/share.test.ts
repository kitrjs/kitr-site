import { expect, it } from 'vitest'
import { articleJsonLd, ogImage } from '#app/lib/share'

it('names share images after the page path', () => {
  expect(ogImage('/')).toBe('https://kitr.dev/og/home.png')
  expect(ogImage('/packages/query/api')).toBe('https://kitr.dev/og/packages-query-api.png')
})

it('gives an article its breadcrumb trail', () => {
  const [, crumbs] = articleJsonLd({ title: 'API', description: '', path: '/packages/query/api' })
  const items = JSON.parse(crumbs?.children ?? '{}').itemListElement
  expect(items.map((i: { name: string }) => i.name)).toEqual(['kitr', 'Packages', 'query', 'api'])
})
