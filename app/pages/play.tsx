import { getRouteApi } from '@kitr/router'
import { type ComponentType, useEffect, useState } from 'react'
import { loadExample } from '#app/lib/examples'
import { storagePrefix } from '#components/live-example'

const route = getRouteApi('/play/$pkg/$example')

/**
 * Give this frame its own corner of localStorage before the example's code runs, so stores
 * created at import time already see the prefix. Storage.prototype belongs to this frame's
 * window, so the parent page is unaffected.
 */
function namespaceStorage(prefix: string) {
  const proto = Storage.prototype as Storage & { __kitrPrefix?: string }
  if (proto.__kitrPrefix) return
  const { getItem, setItem, removeItem, key } = proto
  const own = (s: Storage) => {
    const keys: string[] = []
    for (let i = 0; i < s.length; i++) {
      const k = key.call(s, i)
      if (k?.startsWith(prefix)) keys.push(k)
    }
    return keys
  }
  proto.__kitrPrefix = prefix
  proto.getItem = function (k) {
    return getItem.call(this, prefix + k)
  }
  proto.setItem = function (k, v) {
    setItem.call(this, prefix + k, v)
  }
  proto.removeItem = function (k) {
    removeItem.call(this, prefix + k)
  }
  proto.key = function (i) {
    return own(this)[i]?.slice(prefix.length) ?? null
  }
  proto.clear = function () {
    for (const k of own(this)) removeItem.call(this, k)
  }
}

export default function Play() {
  const { pkg, example } = route.useParams()
  const [Example, setExample] = useState<ComponentType | null>(null)
  useEffect(() => {
    namespaceStorage(storagePrefix(pkg, example))
    void loadExample(pkg, example)?.().then((m) => setExample(() => m.default))
  }, [pkg, example])
  return (
    <main className="min-h-screen bg-background p-5">
      <h1 className="sr-only">
        Live example: {pkg} / {example}
      </h1>
      {Example ? <Example /> : <p className="text-muted-foreground">Loading example…</p>}
    </main>
  )
}
