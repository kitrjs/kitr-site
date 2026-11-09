import type { EventMap } from '@kitr/analytics'

/** Every event the site sends, with its props. `useAnalytics<AppEvents>()` checks names and props. */
export interface AppEvents extends EventMap {
  /** Someone copied a `kitr ...` command (the first two words) with the package-manager picker. */
  'command.copied': { command: string; pm: string }
}
