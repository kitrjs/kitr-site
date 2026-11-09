import { cn } from '@kitr/tailwind'
import lockup from '#app/assets/lockup.svg?raw'

// The wordmark follows the text colour; the mark keeps its brand colours.
const svg = lockup.replaceAll('#0F1B2B', 'currentColor')

export function Logo({ height = 28, className }: { height?: number; className?: string }) {
  return (
    <span
      className={cn('inline-block [&_svg]:block [&_svg]:size-full', className)}
      style={{ height, width: (height * 311) / 120 }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own static SVG
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
