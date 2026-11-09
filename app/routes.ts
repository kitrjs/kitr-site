import { defineRoutes } from '@kitr/kitr/app'
import { notFound } from '@kitr/router'
import router from '@kitr/router/routes'
import { jsonLd, seo } from '@kitr/seo'
import { type Category, categories, findPackage } from '#app/lib/catalog'
import { loadDoc, loadGuide, loadPackagePage } from '#app/lib/content'
import { loadExample } from '#app/lib/examples'
import { findPlatform } from '#app/lib/platforms'
import { articleJsonLd, ogImage, pageUrl, siteUrl } from '#app/lib/share'
import { head, RootDocument, SiteNotFound } from './document'

const description =
  'kitr is an opinionated TypeScript and React framework for apps on every platform, with the tools already chosen and wired.'

export type PackagesSearch = {
  q?: string
  category?: Category
  runs?: 'client' | 'server'
}

/**
 * Every page of the site, in one place. `kitr make:page <path>` appends to this chain. Loaders
 * and heads live here; the components are in app/pages/. Titles get " · kitr" from config/seo.ts.
 */
export const routes = defineRoutes([router], (r) =>
  r
    .root({ head, component: RootDocument, notFoundComponent: SiteNotFound })
    // Header, footer and consent banner around every page except the framed live examples.
    .layout('_site', { lazy: () => import('./layouts/site') }, (site) =>
      site
        .page('/', {
          head: (ctx) => ({
            ...seo(
              {
                title: 'One way to build everything',
                description,
                url: pageUrl('/'),
                image: ogImage('/'),
              },
              ctx,
            ),
            scripts: [
              jsonLd({
                '@type': 'SoftwareSourceCode',
                name: 'kitr',
                description,
                url: siteUrl,
                codeRepository: 'https://github.com/kitrjs/kitr',
                programmingLanguage: 'TypeScript',
                license: 'https://opensource.org/licenses/MIT',
              }),
            ],
          }),
          lazy: () => import('./pages/home'),
        })
        .page('/about', {
          head: (ctx) =>
            seo(
              {
                title: 'About',
                description: 'Why kitr exists, the ideas behind it, the brand and who makes it.',
                url: pageUrl('/about'),
                image: ogImage('/about'),
              },
              ctx,
            ),
          lazy: () => import('./pages/about'),
        })
        .page('/changelog', {
          head: (ctx) =>
            seo(
              {
                title: 'Changelog',
                description: 'What changed in each release of kitr, newest first.',
                url: pageUrl('/changelog'),
                image: ogImage('/changelog'),
              },
              ctx,
            ),
          lazy: () => import('./pages/changelog'),
        })
        .page('/privacy', {
          head: (ctx) =>
            seo(
              {
                title: 'Privacy',
                description:
                  'What kitr.dev counts, what it stores in your browser, and how to change your mind.',
                url: pageUrl('/privacy'),
              },
              ctx,
            ),
          lazy: () => import('./pages/privacy'),
        })
        .page('/platforms', {
          head: (ctx) =>
            seo(
              {
                title: 'Platforms',
                description:
                  'Ship one TypeScript app to the browser, a server, Windows, macOS, Linux, iPhone and Android, and mix them in one project.',
                url: pageUrl('/platforms'),
                image: ogImage('/platforms'),
              },
              ctx,
            ),
          lazy: () => import('./pages/platforms'),
        })
        .page('/platforms/$type', {
          loader: ({ params }) => {
            const platform = findPlatform(params.type)
            if (!platform) throw notFound()
            return { platform }
          },
          head: (ctx) => {
            const p = ctx.loaderData?.platform
            if (!p) return {}
            const path = `/platforms/${p.type}`
            const title = p.type === 'desktop' ? 'Desktop with Electron' : p.name
            return {
              ...seo(
                {
                  title,
                  description: p.tagline,
                  url: pageUrl(path),
                  image: ogImage(path),
                  type: 'article',
                },
                ctx,
              ),
              scripts: articleJsonLd({ title, description: p.tagline, path }),
            }
          },
          lazy: () => import('./pages/platforms/type'),
        })
        .page('/packages', {
          validateSearch: (s: Record<string, unknown>): PackagesSearch => ({
            q: typeof s.q === 'string' && s.q ? s.q : undefined,
            category:
              typeof s.category === 'string' && s.category in categories
                ? (s.category as Category)
                : undefined,
            runs: s.runs === 'client' || s.runs === 'server' ? s.runs : undefined,
          }),
          head: (ctx) =>
            seo(
              {
                title: 'Packages',
                description:
                  'Every kitr package and platform: what it does for your app, where it runs, and how to add it with one command.',
                url: pageUrl('/packages'),
                image: ogImage('/packages'),
              },
              ctx,
            ),
          lazy: () => import('./pages/packages'),
        })
        .page('/packages/$name', {
          loader: async ({ params }) => {
            const pkg = findPackage(params.name)
            if (!pkg) throw notFound()
            const page = await loadPackagePage(pkg.name, '')
            return { pkg, page }
          },
          head: (ctx) => {
            const pkg = ctx.loaderData?.pkg
            if (!pkg) return {}
            const path = `/packages/${pkg.name}`
            return {
              ...seo(
                {
                  title: pkg.title,
                  description: pkg.summary,
                  url: pageUrl(path),
                  image: ogImage(path),
                  type: 'article',
                },
                ctx,
              ),
              scripts: articleJsonLd({ title: pkg.title, description: pkg.summary, path }),
            }
          },
          lazy: () => import('./pages/packages/name'),
        })
        .page('/packages/$name/$page', {
          loader: async ({ params }) => {
            const pkg = findPackage(params.name)
            const page = pkg ? await loadPackagePage(pkg.name, params.page) : null
            if (!pkg || !page) throw notFound()
            return { pkg, page }
          },
          head: (ctx) => {
            const data = ctx.loaderData
            if (!data) return {}
            const name = data.pkg.pages.find((p) => p.slug === ctx.params.page)?.title
            const title = `${data.pkg.title} ${name}`
            const desc = data.page.description ?? data.pkg.summary
            return {
              ...seo(
                {
                  title,
                  description: desc,
                  url: pageUrl(data.page.url),
                  image: ogImage(data.page.url),
                  type: 'article',
                },
                ctx,
              ),
              scripts: articleJsonLd({ title, description: desc, path: data.page.url }),
            }
          },
          lazy: () => import('./pages/packages/page'),
        })
        .page('/docs', {
          head: (ctx) =>
            seo(
              {
                title: 'Docs',
                description:
                  'Start here: what kitr is, how to create an app, use a package, configure it, add your own code and ship it.',
                url: pageUrl('/docs'),
              },
              ctx,
            ),
          lazy: () => import('./pages/docs'),
        })
        .page('/docs/$slug', {
          loader: async ({ params }) => {
            const page = await loadDoc(params.slug)
            if (!page) throw notFound()
            return page
          },
          head: (ctx) => {
            const page = ctx.loaderData
            if (!page) return {}
            const desc = page.description ?? ''
            return {
              ...seo(
                {
                  title: page.title,
                  description: desc,
                  url: pageUrl(page.url),
                  image: ogImage(page.url),
                  type: 'article',
                },
                ctx,
              ),
              scripts: articleJsonLd({ title: page.title, description: desc, path: page.url }),
            }
          },
          lazy: () => import('./pages/docs/slug'),
        })
        .page('/guides', {
          head: (ctx) =>
            seo(
              {
                title: 'Guides',
                description:
                  'Step-by-step walkthroughs: build an app, ship it to phones and desktops, deploy it, and move to kitr.',
                url: pageUrl('/guides'),
                image: ogImage('/guides'),
              },
              ctx,
            ),
          lazy: () => import('./pages/guides'),
        })
        .page('/guides/$slug', {
          loader: async ({ params }) => {
            const page = await loadGuide(params.slug)
            if (!page) throw notFound()
            return page
          },
          head: (ctx) => {
            const page = ctx.loaderData
            if (!page) return {}
            const desc = page.description ?? ''
            return {
              ...seo(
                {
                  title: page.title,
                  description: desc,
                  url: pageUrl(page.url),
                  image: ogImage(page.url),
                  type: 'article',
                },
                ctx,
              ),
              scripts: articleJsonLd({ title: page.title, description: desc, path: page.url }),
            }
          },
          lazy: () => import('./pages/guides/slug'),
        }),
    )
    // Live examples, framed bare on package pages. The prerender reaches them through each
    // frame's "open in a new tab" link.
    .page('/play/$pkg/$example', {
      beforeLoad: ({ params }) => {
        if (!loadExample(params.pkg, params.example)) throw notFound()
      },
      head: (ctx) =>
        seo(
          {
            title: 'Live example',
            description: 'A live kitr example, running in your browser.',
            url: pageUrl(`/play/${ctx.params.pkg}/${ctx.params.example}`),
            noIndex: true,
          },
          ctx,
        ),
      lazy: () => import('./pages/play'),
    }),
)
