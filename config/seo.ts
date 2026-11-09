import { defineConfig } from '@kitr/seo'

export default defineConfig({
  site: {
    name: 'kitr',
    url: 'https://kitr.dev',
    image: 'https://kitr.dev/og/home.png',
    locale: 'en_US',
  },
  // A static site prerenders every page it can reach from these by following links. /privacy is
  // listed so the crawl does not depend on the footer. kitr writes 404.html itself.
  prerender: {
    routes: ['/', '/docs', '/packages', '/guides', '/platforms', '/about', '/privacy'],
    crawlLinks: true,
  },
  // The live examples are framed on package pages; they carry noindex and stay out of the crawl.
  robots: { disallow: ['/play/'] },
})
