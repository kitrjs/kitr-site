import { DocBody as ContentBody } from '@kitr/content/react'
import type { Page } from '#app/lib/content'
import { Command } from './command'

/** A rendered markdown page, with the package-manager picker for its `kitr` commands. */
export function DocBody({ page }: { page: Pick<Page, 'blocks' | 'steps'> }) {
  return <ContentBody page={page} renderCommand={(cmd) => <Command cmd={cmd} />} />
}
