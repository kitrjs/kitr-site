import { expect, it } from 'vitest'
import { loadDoc, loadPackagePage, loadSiteSearch, search } from '#app/lib/content'

it('loads a handbook page with links to GitHub and its markdown copy', async () => {
  const page = await loadDoc('getting-started')
  expect(page).toMatchObject({ url: '/docs/getting-started', markdown: '/docs/getting-started.md' })
  expect(page?.editUrl).toBe(
    'https://github.com/kitrjs/kitr/edit/main/docs/handbook/getting-started.md',
  )
})

it('serves a package overview at the package and its guide at /guide', async () => {
  expect((await loadPackagePage('forms', ''))?.url).toBe('/packages/forms')
  expect((await loadPackagePage('forms', 'guide'))?.markdown).toBe('/packages/forms/index.md')
  expect(await loadPackagePage('forms', 'overview')).toBeNull()
  expect(await loadPackagePage('no-such-package', '')).toBeNull()
})

it('finds a package by its short name, at its own address', async () => {
  const [hit] = search(await loadSiteSearch(), 'i18n')
  expect(hit?.url).toBe('/packages/i18n')
})
