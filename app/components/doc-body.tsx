import { DocBody as ContentBody } from '@kitr/content/react'
import { useEffect, useRef, useState } from 'react'
import type { Page } from '#app/lib/content'
import { Command } from './command'

type Rule = { left: number; top: number; height: number }

/** A rendered markdown page, with the package-manager picker for its `kitr` commands. */
export function DocBody({ page }: { page: Pick<Page, 'blocks' | 'steps'> }) {
  const box = useRef<HTMLDivElement>(null)
  const rule = useStepsRule(box, page)
  return (
    <div ref={box} className="relative">
      {rule && (
        <span
          aria-hidden
          className="steps-rule"
          style={{ left: rule.left, top: rule.top, height: rule.height }}
        />
      )}
      <ContentBody page={page} renderCommand={(cmd) => <Command cmd={cmd} />} />
    </div>
  )
}

/**
 * Where the rule joining a page's numbered steps goes: from the centre of the first circle to the
 * centre of the last, measured so code blocks, tables and commands between them can't break it.
 */
function useStepsRule(
  box: React.RefObject<HTMLDivElement | null>,
  page: Pick<Page, 'blocks' | 'steps'>,
) {
  const [rule, setRule] = useState<Rule>()
  useEffect(() => {
    const el = box.current
    if (!el || !page.steps) return setRule(undefined)
    const measure = () => {
      const markers = el.querySelectorAll<HTMLElement>('.step-marker')
      const first = markers[0]
      const last = markers[markers.length - 1]
      if (!first || !last || first === last || first.offsetParent === null) {
        return setRule(undefined)
      }
      const origin = el.getBoundingClientRect()
      const a = first.getBoundingClientRect()
      const b = last.getBoundingClientRect()
      const next = {
        left: a.left + a.width / 2 - origin.left,
        top: a.top + a.height / 2 - origin.top,
        height: b.top + b.height / 2 - (a.top + a.height / 2),
      }
      setRule((r) =>
        r && r.left === next.left && r.top === next.top && r.height === next.height ? r : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [box, page])
  return rule
}
