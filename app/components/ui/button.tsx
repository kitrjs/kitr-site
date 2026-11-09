import { cn } from '@kitr/tailwind'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

/**
 * The site's buttons, from `kitr ui add button` and restyled to kitr.dev. Links that look like
 * buttons use `buttonVariants()` on the `<Link>` itself.
 */
export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center no-underline transition-[color,background-color,border-color,scale] duration-120 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        outline:
          'border border-border bg-background font-semibold text-foreground hover:bg-muted hover:text-foreground',
        primary:
          'border border-primary bg-primary font-semibold text-primary-foreground hover:bg-[#2457cc] hover:text-primary-foreground',
        /** White on the dark call-to-action band at the bottom of the home page. */
        inverse:
          'border border-white bg-white font-semibold text-[#0b121c] hover:bg-[#e3ebff] hover:text-[#0b121c]',
        /** Square and quiet, for the header's icons. */
        icon: 'border border-border bg-background text-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        default: 'min-h-11 rounded-md px-5 active:scale-97',
        sm: 'min-h-9 rounded-md px-3.5 active:scale-97',
        icon: 'size-10 rounded-sm active:scale-94',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
)

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
