import { providers } from 'virtual:kitr/providers'
import { createTestApp } from '@kitr/testing'
import { renderWithKitr } from '@kitr/testing/react'
import { fireEvent, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { PmProvider } from '#app/stores/pm'
import { Command } from '#components/command'

it('switches every command to the picked package manager and remembers it', async () => {
  const app = await createTestApp({ providers })
  renderWithKitr(
    <PmProvider>
      <Command cmd="kitr add forms" />
    </PmProvider>,
    { app },
  )
  expect(screen.getByText('kitr add forms')).toBeTruthy()

  fireEvent.click(screen.getByRole('tab', { name: 'npm' }))

  expect(screen.getByText('npx kitr add forms')).toBeTruthy()
  expect(localStorage.getItem('kitr:pm')).toContain('"pm":"npm"')
})
