import { defineConfig } from '@kitr/theme'

export default defineConfig({
  default: 'system',
  // Saved under the site's storage prefix, like every other key it keeps (see /privacy).
  storageKey: 'kitr:theme',
  // Window chrome / <meta name="theme-color">: the page background of each theme.
  colors: { light: '#ffffff', dark: '#0b121c' },
  // The new theme grows as a circle from the toggle button. The circle ends far past the page's
  // corners, so it needs the time to be seen: 700ms on kitr's ease-in-out leaves about half a
  // second of it on screen.
  transition: { name: 'circle', duration: 700 },
  componentsDir: 'app/components/ui',
})
