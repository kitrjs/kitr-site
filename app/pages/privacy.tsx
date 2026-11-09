import { useConsent } from '@kitr/consent/react'
import { useEffect, useState } from 'react'
import { IndexHead } from '#components/index-page'
import { Button } from '#components/ui/button'

/** What the site counts and stores, and the one place to change the cookie choice. */
export default function Privacy() {
  const { record, decided, has, grant, reset } = useConsent()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="container pt-12 pb-16">
      <IndexHead title="Privacy">
        What kitr.dev counts, what it stores in your browser, and how to change your mind.
      </IndexHead>
      <div className="prose">
        <p>
          kitr.dev is a static documentation site. It has no accounts, no forms and no ads, and it
          never sells or shares anything about you.
        </p>
        <h2 id="what-we-store">What we store in your browser</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Where</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>kitr:consent</code>
                </td>
                <td>Cookie, 1 year</td>
                <td>Remembers your answer to the cookie question. Strictly necessary.</td>
              </tr>
              <tr>
                <td>
                  <code>kitr:theme</code>
                </td>
                <td>Local storage</td>
                <td>Light or dark, when you pick one.</td>
              </tr>
              <tr>
                <td>
                  <code>kitr:pm</code>
                </td>
                <td>Local storage</td>
                <td>The package manager you picked, so every command on the site matches.</td>
              </tr>
              <tr>
                <td>
                  <code>_ga</code>, <code>_ga_*</code>
                </td>
                <td>Cookie, 2 years</td>
                <td>Google Analytics, only after you accept: tells one visit from the next.</td>
              </tr>
              <tr>
                <td>
                  <code>kitr-play:*</code>
                </td>
                <td>Local storage</td>
                <td>What the live examples on package pages save, shown beside each example.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2 id="analytics">Analytics, only if you agree</h2>
        <p>
          If you accept, we count page views and copied commands with Google Analytics to learn
          which docs help. Google's script and its cookies load only after you accept, and we send
          no names, emails or account details. Until you accept, nothing is sent, and you can change
          your mind below at any time.
        </p>
      </div>
      <section
        className="mt-10 max-w-190 rounded-lg border border-border p-6"
        aria-labelledby="choice"
      >
        <h2 id="choice" className="mb-2 text-[22px]">
          Your choice
        </h2>
        {mounted ? (
          <>
            <p className="text-muted-foreground">
              {decided && record.decidedAt
                ? `You chose on ${new Date(record.decidedAt).toLocaleDateString('en-GB')}.`
                : 'You have not chosen yet.'}
            </p>
            <label className="mt-4 mb-5 flex items-center gap-2.5">
              <input
                type="checkbox"
                className="size-4.5 accent-primary"
                checked={has('analytics')}
                onChange={(e) =>
                  grant(
                    record.granted
                      .filter((c) => c !== 'analytics')
                      .concat(e.target.checked ? ['analytics'] : []),
                  )
                }
              />
              Usage statistics
            </label>
            <Button onClick={reset}>Ask me again</Button>
          </>
        ) : (
          <p className="text-muted-foreground">Loading your choice…</p>
        )}
      </section>
    </main>
  )
}
