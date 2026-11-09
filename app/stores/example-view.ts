import { createKitrStore } from '@kitr/state'

/** How a live example is shown: the demo alone, the demo beside its code, or the code alone. */
export type ExampleView = 'demo' | 'split' | 'code'

interface ExampleViewState {
  view: ExampleView
  setView: (view: ExampleView) => void
}

/**
 * The view every live example opens in, remembered in localStorage as `kitr:example-view`. The
 * prerendered HTML and the first render show the split; the saved choice follows right after.
 */
export const [useExampleView] = createKitrStore<ExampleViewState>(
  { name: 'example-view', persist: { partialize: (s) => ({ view: s.view }) } },
  (set) => ({ view: 'split', setView: (view) => set({ view }) }),
)
