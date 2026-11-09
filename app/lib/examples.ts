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
