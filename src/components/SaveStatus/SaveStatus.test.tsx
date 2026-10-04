// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { SaveState } from '../../models/note'
import { SaveStatus } from './SaveStatus'

afterEach(cleanup)

describe('SaveStatus', () => {
  it.each<[SaveState, string, string]>([
    ['saved', 'All changes saved', 'bg-success-500'],
    ['saving', 'Saving…', 'bg-clarity-500'],
    ['error', "Couldn't save. Retrying.", 'bg-ignition-500'],
  ])('shows %s as "%s" with the %s dot', (state, label, dot) => {
    render(<SaveStatus state={state} />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe(label)
    expect(status.querySelector('span')?.className).toContain(dot)
  })

  it('colours only the error text', () => {
    render(<SaveStatus state="error" />)
    expect(screen.getByRole('status').className).toContain('text-ignition-400')
  })
})
