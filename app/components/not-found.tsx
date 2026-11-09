import { Link } from '@kitr/router'
import { buttonVariants } from './ui/button'

/** Shown for any unknown URL. kitr's static build writes it to 404.html, which nginx answers with. */
export function NotFound() {
  return (
    <main className="container flex max-w-[720px] flex-col items-start gap-4 pt-30 pb-35 max-phone:pt-18 max-phone:pb-24">
      <p className="label text-[19px] leading-[30px]">404 · page not found</p>
      <h1 className="font-display text-[56px] leading-[60px] font-normal tracking-normal max-phone:text-[40px] max-phone:leading-[44px]">
        this part isn't in the box
      </h1>
      <p className="text-[19px] leading-[30px] text-muted-foreground">
        The page you asked for doesn't exist. These are good places to look instead.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link to="/packages" className={buttonVariants({ variant: 'primary' })}>
          Browse packages
        </Link>
        <Link to="/docs/$slug" params={{ slug: 'getting-started' }} className={buttonVariants()}>
          Read the docs
        </Link>
      </div>
    </main>
  )
}
