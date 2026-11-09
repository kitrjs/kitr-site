import { defineConfig } from '@kitr/analytics'
import type { AppEvents } from '#app/analytics'
import { env } from '#app/env'
import { googleAnalytics } from '#app/lib/google-analytics'

/**
 * Google Analytics 4 when VITE_GA_MEASUREMENT_ID is set at build time. With no adapter,
 * development logs every event to the console and production sends nothing. Nothing loads or
 * is sent before the visitor accepts the banner: @kitr/consent holds analytics back, so
 * Google's script and its cookies only arrive after "Accept".
 */
export default defineConfig({
  adapters: env.VITE_GA_MEASUREMENT_ID
    ? [googleAnalytics({ measurementId: env.VITE_GA_MEASUREMENT_ID })]
    : [],
  globalProps: { app: env.VITE_APP_NAME },
  events: {} as AppEvents,
})
