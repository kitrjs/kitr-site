import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { kitr } from '@kitr/vite'
import { defineConfig, type Plugin } from 'vite'

const site = dirname(fileURLToPath(import.meta.url))
/** The kitrjs/kitr checkout config/content.ts reads: its packages' live examples render at /play. */
const kitrDir = resolve(site, process.env.KITR_DIR ?? '.content/kitr')
const packagesDir = join(kitrDir, 'packages')

/**
 * Package examples live in <kitr>/packages/<pkg>/examples and import `@kitr/*` like any app would.
 * Resolve those imports from this site, which installs every package they use from npm.
 */
function examplesResolve(): Plugin {
  return {
    name: 'kitr-site:examples',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer?.includes('/examples/') || !importer.startsWith(packagesDir)) return null
      if (source.startsWith('.') || source.startsWith('/')) return null
      return this.resolve(source, join(site, 'app/app.ts'), { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [examplesResolve(), kitr()],
  server: { fs: { allow: [site, kitrDir] } },
})
