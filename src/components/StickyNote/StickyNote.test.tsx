// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { Note } from '../../models/note'
import { renderWithDispatch } from '../../test/renderWithDispatch'
import { StickyNote } from './StickyNote'

afterEach(cleanup)

const note: Note = { id: 'n1', rect: { x: 40, y: 60, width: 240, height: 180 }, z: 2, title: 'Plan', text: 'Ship it', color: 'vision' }
const trashRef = { current: null }

function renderNote(props: Partial<{ note: Note; selected: boolean }> = {}) {
  return renderWithDispatch(<StickyNote note={props.note ?? note} selected={props.selected ?? false} trashRef={trashRef} />)
}

describe('StickyNote', () => {
  it('shows its title and text, placed by its rect and stacked by its z', () => {
    renderNote()
    const card = screen.getByRole('article', { name: 'Plan' })
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Plan')
    expect((screen.getByLabelText('Text') as HTMLTextAreaElement).value).toBe('Ship it')
    expect(card.style.transform).toBe('translate(40px, 60px)')
    expect([card.style.width, card.style.height, card.style.zIndex]).toEqual(['240px', '180px', '2'])
    expect(card.dataset.color).toBe('vision')
  })

  it('falls back to Untitled for an empty title', () => {
    renderNote({ note: { ...note, title: '' } })
    expect(screen.getByRole('article', { name: 'Untitled' })).toBeTruthy()
    expect(screen.getByLabelText('Title').getAttribute('placeholder')).toBe('Untitled')
  })

  it('shows the colour swatches only while selected', () => {
    const { rerender } = renderNote()
    expect(screen.queryByRole('group', { name: 'Note colour' })).toBeNull()
    rerender(<StickyNote note={note} selected trashRef={trashRef} />)
    expect(screen.getByRole('group', { name: 'Note colour' })).toBeTruthy()
  })

  it('dispatches edits to the title, the text and the colour', async () => {
    const { dispatch } = renderNote({ note: { ...note, title: '', text: '' }, selected: true })
    await userEvent.type(screen.getByLabelText('Title'), 'A')
    await userEvent.type(screen.getByLabelText('Text'), 'B')
    await userEvent.click(screen.getByRole('button', { name: 'Paper' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'update', id: 'n1', changes: { title: 'A' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'update', id: 'n1', changes: { text: 'B' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'update', id: 'n1', changes: { color: 'paper' } })
  })

  it('a press selects the note and brings it to front', async () => {
    const { dispatch } = renderNote()
    await userEvent.pointer({ keys: '[MouseLeft]', target: screen.getByRole('article') })
    expect(dispatch).toHaveBeenCalledWith({ type: 'press', id: 'n1' })
  })

  it('tabbing to the note selects it without bringing it to front', async () => {
    const { dispatch } = renderNote()
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('article'))
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'select', id: 'n1' })
  })

  it('deletes on Delete or Backspace when the note itself is focused', async () => {
    const { dispatch } = renderNote()
    screen.getByRole('article').focus()
    await userEvent.keyboard('{Delete}')
    await userEvent.keyboard('{Backspace}')
    expect(dispatch.mock.calls.filter(([action]) => action.type === 'remove')).toHaveLength(2)
  })

  it('never deletes the note when Backspace is pressed in its fields', async () => {
    const { dispatch } = renderNote({ selected: true })
    await userEvent.click(screen.getByLabelText('Title'))
    await userEvent.keyboard('{Backspace}')
    await userEvent.click(screen.getByLabelText('Text'))
    await userEvent.keyboard('{Backspace}{Delete}')
    expect(dispatch.mock.calls.some(([action]) => action.type === 'remove')).toBe(false)
  })

  it('deselects on Escape from a field or from the note', async () => {
    const { dispatch } = renderNote({ selected: true })
    await userEvent.click(screen.getByLabelText('Title'))
    await userEvent.keyboard('{Escape}')
    screen.getByRole('article').focus()
    await userEvent.keyboard('{Escape}')
    expect(dispatch.mock.calls.filter(([action]) => action.type === 'select' && action.id === null)).toHaveLength(2)
  })

  it('has a labelled resize handle', () => {
    renderNote()
    expect(screen.getByRole('button', { name: 'Resize Plan' })).toBeTruthy()
  })
})
