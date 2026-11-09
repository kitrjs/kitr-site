import type { AnalyticsAdapter } from '@kitr/analytics'

/**
 * gtag.js reads commands from `window.dataLayer` only as `arguments` objects; an array pushed in
 * their place is skipped without an error. So this is Google's own `gtag()` snippet, word for word.
 */
function gtag(..._args: unknown[]) {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  // biome-ignore lint/complexity/noArguments: gtag.js needs the arguments object itself.
  w.dataLayer.push(arguments)
}

/**
 * Google Analytics 4 through gtag.js, for `config/analytics.ts`. Stands in for @kitr/analytics'
 * `googleAnalytics()` until kitr's own queues `arguments` too; then switch back to it. @kitr/consent holds analytics
 * back until the visitor accepts, so `init()`, which loads Google's script, runs only after that.
 * Page views come from the router (`send_page_view: false`).
 */
export function googleAnalytics({ measurementId }: { measurementId: string }): AnalyticsAdapter {
  return {
    name: 'google-analytics',
    init() {
      const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script')
        script.async = true
        script.src = src
        document.head.append(script)
      }
      gtag('js', new Date())
      gtag('config', measurementId, { send_page_view: false })
    },
    page(path, { url, title, ...props } = {}) {
      gtag('event', 'page_view', {
        ...props,
        page_path: path,
        page_location: url,
        page_title: title,
      })
    },
    track(event, props) {
      gtag('event', event, props ?? {})
    },
  }
}
