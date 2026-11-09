import { createEnv, env as e } from '@kitr/kitr/env'

/** Validated at startup. Public vars (VITE_*) ship to the browser; server vars throw if read there. */
export const env = createEnv({
  public: {
    VITE_APP_NAME: e.string({ default: 'kitr.dev' }),
    /** The Google Analytics 4 measurement ID, such as `G-ABC123`. Empty: analytics only logs in dev. */
    VITE_GA_MEASUREMENT_ID: e.string({ optional: true }),
  },
  server: {},
})
