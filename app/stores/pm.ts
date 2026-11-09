import { createKitrStore } from '@kitr/state'

export const managers = {
  kitr: { label: 'global', prefix: 'kitr', create: 'kitr' },
  pnpm: { label: 'pnpm', prefix: 'pnpm kitr', create: 'pnpm dlx @kitr/kitr' },
  npm: { label: 'npm', prefix: 'npx kitr', create: 'npx @kitr/kitr' },
  yarn: { label: 'yarn', prefix: 'yarn kitr', create: 'yarn dlx @kitr/kitr' },
  bun: { label: 'bun', prefix: 'bunx kitr', create: 'bunx @kitr/kitr' },
} as const

export type Manager = keyof typeof managers

interface PmState {
  pm: Manager
  setPm: (pm: Manager) => void
}

/**
 * The package-manager picker on every command, remembered in localStorage as `kitr:pm`. The
 * prerendered HTML and the first render show the default; the saved choice follows right after.
 */
export const [usePm, PmProvider, pmStore] = createKitrStore<PmState>(
  { name: 'pm', persist: { partialize: (s) => ({ pm: s.pm }) } },
  (set) => ({ pm: 'kitr', setPm: (pm) => set({ pm }) }),
)

/** `kitr add state` as the chosen manager runs it. `kitr new` runs before a project exists, so it uses dlx. */
export const withManager = (cmd: string, pm: Manager) =>
  cmd
    .split('\n')
    .map((line) =>
      line.replace(
        /^kitr(?=\s)/,
        /^kitr new\b/.test(line) ? managers[pm].create : managers[pm].prefix,
      ),
    )
    .join('\n')
