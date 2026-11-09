import { defineConfig } from '@kitr/consent'

export default defineConfig({
  categories: ['analytics'],
  version: 1, // bump to ask everyone again
  analytics: 'analytics', // analytics waits for this category
  monitoring: false, // error reports are not gated
})
