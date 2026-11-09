import { defineConfig } from '@kitr/theme'

export default defineConfig({
  default: 'system',
  // Saved under the site's storage prefix, like every other key it keeps (see /privacy).
  storageKey: 'kitr:theme',
  // Window chrome / <meta name="theme-color">: the page background of each theme.
  colors: { light: '#ffffff', dark: '#0b121c' },
  // The new theme grows as a circle from the toggle button.
  transition: { name: 'circle', duration: 320 },
  componentsDir: 'app/components/ui',
})
