import { expect, it } from 'vitest'
import { withManager } from '#app/stores/pm'

it('runs kitr through the chosen package manager', () => {
  expect(withManager('kitr add forms', 'kitr')).toBe('kitr add forms')
  expect(withManager('kitr add forms', 'npm')).toBe('npx kitr add forms')
  expect(withManager('kitr add forms', 'pnpm')).toBe('pnpm kitr add forms')
})

it('creates a project with dlx, since kitr is not installed yet', () => {
  expect(withManager('kitr new my-app --kit app', 'pnpm')).toBe(
    'pnpm dlx @kitr/kitr new my-app --kit app',
  )
  expect(withManager('kitr new my-app\ncd my-app', 'npm')).toBe(
    'npx @kitr/kitr new my-app\ncd my-app',
  )
})
