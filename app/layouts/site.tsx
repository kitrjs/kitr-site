import { Outlet } from '@kitr/router'
import type { ReactNode } from 'react'
import { useNavigatedFlag } from '#app/hooks/use-navigated-flag'
import { usePreloadPages } from '#app/hooks/use-preload-pages'
import { PmProvider } from '#app/stores/pm'
import { Footer, Header } from '#components/chrome'
import { ConsentBanner } from '#components/consent-banner'
import { NavProgress } from '#components/page-pending'

/** Header, footer and the consent banner around a page. */
export function SiteFrame({ children }: { children: ReactNode }) {
  usePreloadPages()
  useNavigatedFlag()
  return (
    <PmProvider>
      <a
        href="#main"
        className="absolute -top-12 left-4 z-20 rounded-sm bg-foreground px-3 py-2 text-background transition-[top] duration-120 focus:top-3"
      >
        Skip to content
      </a>
      <NavProgress />
      <Header />
      <div id="main">{children}</div>
      <Footer />
      <ConsentBanner />
    </PmProvider>
  )
}

/** Every page but the framed live examples (/play) renders inside this layout. */
export default function SiteLayout() {
  return (
    <SiteFrame>
      <Outlet />
    </SiteFrame>
  )
}
