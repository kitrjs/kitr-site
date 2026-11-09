import { useState } from 'react'

/**
 * True once `value` has differed from what it was on the first render. Swap animations (an icon
 * that changes, a code block that re-renders) use it so they play when the visitor changes
 * something, never on page load or hydration.
 */
export function useSwapped(value: unknown): boolean {
  const [initial] = useState(value)
  const [swapped, setSwapped] = useState(false)
  const differs = !Object.is(value, initial)
  // Remembered, so changing back to the first value animates too.
  if (differs && !swapped) setSwapped(true)
  return swapped || differs
}
