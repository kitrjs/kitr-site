import { defineKitrConfig } from '@kitr/kitr/app'
import { web } from '@kitr/web'

/**
 * Explicit wiring, the Adonis way: every provider is listed here as a lazy import and every
 * platform by name. `kitr add`, `kitr remove` and `kitr config` edit this file; so can you.
 */
export default defineKitrConfig({
  packages: [
    '@kitr/react',
    '@kitr/router',
    '@kitr/testing',
    '@kitr/vite',
    '@kitr/web',
    '@kitr/analytics',
    '@kitr/storage',
    '@kitr/consent',
    '@kitr/state',
    '@kitr/seo',
    '@kitr/theme',
    '@kitr/animation',
    '@kitr/tailwind',
    '@kitr/platform',
    '@kitr/native',
    '@kitr/content',
  ],
  providers: [
    () => import('@kitr/web/provider'),
    () => import('@kitr/analytics/provider'),
    () => import('@kitr/storage/provider'),
    () => import('@kitr/consent/provider'),
    () => import('@kitr/theme/provider'),
    () => import('@kitr/animation/provider'),
    () => import('@kitr/platform/provider'),
    () => import('@kitr/native/provider'),
  ],
  platforms: {
    site: web({ mode: 'static' }),
  },
  // The catalog, kits and platform data the pages import (app/generated), and the share images.
  generate: [
    {
      name: 'site-data',
      run: 'node scripts/site-data.mjs',
      watch: ['app/content/**', 'app/lib/catalog.ts', 'scripts/**'],
    },
  ],
  directories: {
    app: 'app',
    routes: 'app/routes',
    config: 'config',
    components: 'app/components',
    server: 'server',
    platforms: 'platforms',
  },
})
