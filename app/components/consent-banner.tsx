import { useConsent } from '@kitr/consent/react'
import { Link } from '@kitr/router'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

/**
 * The cookie question, once. Renders nothing after a choice. Every page is prerendered, so it
 * waits for the first client render: people who already chose never see it flash.
 */
export function ConsentBanner() {
  const { decided, acceptAll, rejectAll } = useConsent()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || decided) return null
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 z-60 flex w-[min(380px,calc(100vw-32px))] flex-col gap-3 rounded-lg border border-border bg-background p-4 text-[14.5px] leading-[21px] shadow-md"
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
