// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Note } from '../../models/note'
import { renderWithDispatch } from '../../test/renderWithDispatch'
import { NotesPanel } from './NotesPanel'

// jsdom has no matchMedia; the reorder animation asks it about reduced motion.
beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

const rect = { x: 0, y: 0, width: 240, height: 180 }
const notes: Note[] = [
  { id: 'back', rect, z: 1, title: 'Back note', text: '', color: 'clarity' },
  { id: 'front', rect, z: 3, title: 'Front note', text: '', color: 'vision' },
  { id: 'middle', rect, z: 2, title: '', text: '', color: 'paper' },
]

const rows = () => within(screen.getByRole('list')).getAllByRole('listitem')

describe('NotesPanel', () => {
  it('shows the empty state when there are no notes', () => {
    renderWithDispatch(<NotesPanel notes={[]} selectedId={null} />)
    expect(screen.getByText('Notes you add are listed here, front-most first.')).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('lists notes front-most first, with Untitled for empty titles, and the count', () => {
    renderWithDispatch(<NotesPanel notes={notes} selectedId={null} />)
    expect(rows().map((row) => row.textContent)).toEqual(['Front note', 'Untitled', 'Back note'])
    expect(screen.getByRole('heading', { name: /Notes/ }).textContent).toContain('3')
  })

  it('selects a note from its row', async () => {
    const { dispatch } = renderWithDispatch(<NotesPanel notes={notes} selectedId={null} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back note' }))
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'select', id: 'back' })
  })

  it('gives only the selected row layer buttons, disabled at the ends', () => {
    const { rerender } = renderWithDispatch(<NotesPanel notes={notes} selectedId="front" />)
    expect(screen.getAllByRole('button', { name: 'Bring forward' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Bring forward' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Send backward' }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: 'Front note' }).getAttribute('aria-current')).toBe('true')

    rerender(<NotesPanel notes={notes} selectedId="back" />)
    expect(screen.getByRole('button', { name: 'Send backward' }).hasAttribute('disabled')).toBe(true)
  })

  it('moves the selected note a layer', async () => {
    const { dispatch } = renderWithDispatch(<NotesPanel notes={notes} selectedId="middle" />)
    await userEvent.click(screen.getByRole('button', { name: 'Bring forward' }))
    await userEvent.click(screen.getByRole('button', { name: 'Send backward' }))
    expect(dispatch.mock.calls).toEqual([
      [{ type: 'moveLayer', id: 'middle', direction: 'forward' }],
      [{ type: 'moveLayer', id: 'middle', direction: 'backward' }],
    ])
  })

  it('collapses to a strip and expands again', async () => {
    renderWithDispatch(<NotesPanel notes={notes} selectedId={null} />)
    await userEvent.click(screen.getByRole('button', { name: 'Collapse notes panel' }))
    expect(screen.queryByRole('list')).toBeNull()
    const expand = screen.getByRole('button', { name: 'Expand notes panel' })
    expect(expand.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(expand)
    expect(screen.getByRole('list')).toBeTruthy()
  })
})
