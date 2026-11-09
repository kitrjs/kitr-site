import { useConsent } from '@kitr/consent/react'
import { Link } from '@kitr/router'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'

/**
 * The cookie question, once. Renders nothing after a choice. Every page is prerendered, so it
 * waits for the first client render: people who already chose never see it flash.
 *
 * A bottom sheet on phones, a card in the bottom-left corner from there up. While it is open,
 * `<body data-consent="open">` carries its height in `--consent-height` and base.css pads the page
 * by that much, so nothing ends up stuck under it.
 */
export function ConsentBanner() {
  const { decided, acceptAll, rejectAll } = useConsent()
  const [mounted, setMounted] = useState(false)
  const banner = useRef<HTMLDivElement>(null)
  useEffect(() => setMounted(true), [])
  const open = mounted && !decided

  useEffect(() => {
    const el = banner.current
    if (!open || !el) return
    const body = document.body
    const sync = () => {
      const gap = Math.max(0, window.innerHeight - el.getBoundingClientRect().bottom)
      body.style.setProperty('--consent-height', `${el.offsetHeight + gap}px`)
    }
    sync()
    body.dataset.consent = 'open'
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
      delete body.dataset.consent
      body.style.removeProperty('--consent-height')
    }
  }, [open])

  if (!open) return null
  return (
    <div
      ref={banner}
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 z-60 flex w-[min(380px,calc(100vw-32px))] flex-col gap-3 rounded-lg border border-border bg-background p-4 text-[14.5px] leading-[21px] shadow-md max-phone:inset-x-0 max-phone:bottom-0 max-phone:w-auto max-phone:rounded-none max-phone:rounded-t-lg max-phone:border-x-0 max-phone:border-b-0 max-phone:pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <p className="flex-auto">
        We'd like to count visits with Google Analytics to learn which docs help. Nothing is sent
        until you accept. <Link to="/privacy">Details</Link>
      </p>
      <div className="flex flex-none gap-2">
        <Button size="sm" className="flex-1" onClick={rejectAll}>
          Only necessary
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={acceptAll}>
          Accept
        </Button>
      </div>
    </div>
  )
}
