# kitr.dev

The kitr website, built with kitr. Every page is prerendered to static HTML and served by nginx. The handbook, guides, package docs and live examples are read from a [kitrjs/kitr](https://github.com/kitrjs/kitr) checkout at build time, so the site always shows the docs on kitr's `main`.

## Run it

```sh
npm install
npm run content:fetch   # clones kitrjs/kitr into .content/kitr
npm run dev
```

`KITR_DIR=../kitr npm run dev` reads a kitr checkout you already have instead.

| Script                                            | What it does                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`                                     | `kitr dev`: generates the content and site data, then serves the site                       |
| `npm run build`                                   | The same generate steps, then prerenders every page into `dist/site/client` with `404.html` |
| `npm run typecheck` / `npm test` / `npm run lint` | `kitr typecheck`, Vitest, Biome                                                             |

## Where things are

| Path                             | What                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `kitrrc.ts`                      | Packages, providers, the one platform (`site: web({ mode: 'static' })`) and the `site-data` generate step                       |
| `app/routes.ts`                  | Every page, with its loader and head                                                                                            |
| `app/document.tsx`               | The HTML shell, header and footer                                                                                               |
| `app/pages/`                     | One component per page                                                                                                          |
| `app/components/`, `app/styles/` | The site's own UI and CSS                                                                                                       |
| `app/content/`                   | Site copy the generate step reads: `platforms.mjs` (what the site adds to each platform), `roadmap.json`                        |
| `config/content.ts`              | The `@kitr/content` collections: the handbook at `/docs`, the guides at `/guides`, each package's docs under `/packages/<name>` |
| `app/lib/content.ts`             | Loads those pages for the routes, the guides' frontmatter and the search index                                                  |
| `scripts/site-data.mjs`          | `kitr catalog --json` and the kits into `app/generated` (packages, kits, platforms), and the share images in `public/og`        |
| `app/lib/examples.ts`            | The live examples (`<kitr>/packages/*/examples`) shown at `/play/<pkg>/<example>`                                               |
| `config/`                        | One file per package: `analytics.ts`, `consent.ts`, `content.ts`, `seo.ts`, `theme.ts`, ...                                     |

The packages the live examples import (`@kitr/forms`, `@kitr/3d`, ...) are plain dependencies: the site itself doesn't use them, so they aren't in `kitrrc.ts`. The `@kitr/kit-*` dev dependencies are there because the home page lists what each kit sets up.

## Analytics and privacy

`@kitr/consent` asks before anything is counted, and `/privacy` lists every cookie. `@kitr/analytics` sends page views to Google Analytics 4 when `VITE_GA_MEASUREMENT_ID` is set at build time; without it, or until the visitor accepts, no analytics script loads.

## Deploy

`.github/workflows/deploy.yml` runs on every push to `main`, once a day, and on a `docs` repository dispatch from kitrjs/kitr, so docs merged there reach the site:

1. Runs lint, typecheck and tests, then builds the `Dockerfile`: installs, checks out kitrjs/kitr at the `main` commit the run resolved, builds, and serves `dist/site/client` with `nginx.conf`.
2. Pushes the image to `ghcr.io/kitrjs/kitr-site`, tagged `latest` and with the commit.
3. Asks Coolify to redeploy the app that runs that image, waits until `/version.txt` shows the new commit, then checks the main pages.

| Setting                   | Kind     | What                                                                                      |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `VITE_GA_MEASUREMENT_ID`  | Variable | The GA4 measurement ID (`G-...`). Leave it unset to build without analytics.              |
| `COOLIFY_DEPLOY_WEBHOOK`  | Secret   | `<coolify>/api/v1/deploy?uuid=<app uuid>`. Without it the image is built only.            |
| `COOLIFY_TOKEN`           | Secret   | A Coolify API token with deploy permission.                                               |
| `CF_ACCESS_CLIENT_ID`     | Secret   | A Cloudflare Access service token for the Coolify host, if it sits behind Access.         |
| `CF_ACCESS_CLIENT_SECRET` | Secret   | Its secret.                                                                               |
| `SITE_URL`                | Variable | Where the app serves the site, checked after each deploy. Defaults to `https://kitr.dev`. |

In Coolify the app is a Docker image, `ghcr.io/kitrjs/kitr-site:latest`, on port 80. The package is public, so the server pulls it without a login.
