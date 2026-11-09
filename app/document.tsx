import asimovian from '@fontsource/asimovian/files/asimovian-latin-400-normal.woff2?url'
import instrumentSans from '@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2?url'
import { HeadContent, Outlet, Scripts } from '@kitr/router'
import { ThemeScript } from '@kitr/theme'
import { SiteFrame } from '#app/layouts/site'
import css from '#app/styles/app.css?url'
import { NotFound } from '#components/not-found'

/** Head tags for every page. Pages add their own through `head` in their route options. */
export function head() {
  return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'llms.txt' },
      // The two fonts the first paint needs (the display face for headings, the body face), so
      // text is not held back by the stylesheet discovering them.
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: asimovian,
        crossOrigin: 'anonymous' as const,
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: instrumentSans,
        crossOrigin: 'anonymous' as const,
      },
      { rel: 'stylesheet', href: css },
    ],
  }
}

/** The HTML document around every page. The site's header and footer are in app/layouts/site.tsx. */
export function RootDocument() {
  return (
    <html lang="en" className="motion-safe:scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

/**
 * An unknown URL matches no layout, so it gets the site frame here, and its own title: no route's
 * head applies. kitr's static build writes it to 404.html.
 */
export function SiteNotFound() {
  return (
    <SiteFrame>
      <title>Page not found · kitr</title>
      <meta name="robots" content="noindex" />
      <NotFound />
    </SiteFrame>
  )
}
