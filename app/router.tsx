import { pageTransitions } from '@kitr/animation'
import '@kitr/animation/page-transitions.css'
import { createKitrRouter } from '@kitr/router'
import { PagePending } from '#components/page-pending'
import { app } from './app'
import { routes } from './routes'

export function getRouter() {
  return createKitrRouter({
    routes,
    app,
    defaultPreload: 'intent',
    // The current page stays on screen while the next one loads, with NavProgress's bar on top;
    // only a very slow load swaps it for an empty page instead of the default "Loading…".
    defaultPendingComponent: PagePending,
    defaultPendingMs: 8000,
    // Pages cross-fade; parts marked data-kitr-keep (header, sidebar) stay put. Search and hash
    // changes (the /packages filters, anchors) don't animate.
    defaultViewTransition: pageTransitions({ style: 'fade' }),
    // Keeps the router's scroll-to-top instant even though CSS smooth-scrolls in-page jumps.
    scrollRestorationBehavior: 'instant',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
