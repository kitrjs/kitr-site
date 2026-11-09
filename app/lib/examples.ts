import type { ComponentType } from 'react'

/**
 * The live examples from the kitr checkout config/content.ts reads (packages/<pkg>/examples/*.tsx).
 * Each is loaded on demand, only inside its /play frame.
 */
const examples = import.meta.glob<{ default: ComponentType }>(
  '../../.content/kitr/packages/*/examples/*.tsx',
)

export const loadExample = (pkg: string, example: string) =>
  examples[`../../.content/kitr/packages/${pkg}/examples/${example}.tsx`]

/** One file of an example, highlighted at build time. `path` is relative to the examples folder. */
export interface ExampleFile {
  path: string
  code: string
  html: string
}

/** The files of each of a package's examples, by example. */
export type ExampleSources = Record<string, ExampleFile[]>

/** Written by scripts/site-data.mjs, one file per package that has examples. */
const sources = import.meta.glob<ExampleSources>('../generated/examples/*.json', {
  import: 'default',
})

/** A package's example sources, or none when it has no examples. */
export const loadExampleSources = async (pkg: string): Promise<ExampleSources> =>
  (await sources[`../generated/examples/${pkg}.json`]?.()) ?? {}
