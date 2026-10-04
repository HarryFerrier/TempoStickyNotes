import { describe, expect, it } from 'vitest'
import type { Note, Rect } from '../../models/note'
import { INITIAL_NOTES_STATE, notesReducer, type NotesAction, type NotesState } from './notesReducer'

const rect: Rect = { x: 10, y: 10, width: 240, height: 180 }

function run(...actions: NotesAction[]): NotesState {
  return actions.reduce(notesReducer, INITIAL_NOTES_STATE)
}

const threeNotes = run(
  { type: 'add', id: 'a', rect },
  { type: 'add', id: 'b', rect },
  { type: 'add', id: 'c', rect },
)

const zOf = (state: NotesState, id: string) => state.notes.find((note) => note.id === id)?.z

describe('add', () => {
  it('adds an empty note in front of the others and selects it', () => {
    const state = run({ type: 'add', id: 'a', rect }, { type: 'add', id: 'b', rect })
    expect(state.notes.at(-1)).toEqual({ id: 'b', rect, z: 2, title: '', text: '', color: 'vision' })
    expect(state.selectedId).toBe('b')
  })

  it('cycles through the five colours', () => {
    const ids = ['1', '2', '3', '4', '5', '6']
    const state = run(...ids.map((id): NotesAction => ({ type: 'add', id, rect })))
    expect(state.notes.map((note) => note.color)).toEqual(['clarity', 'vision', 'ignition', 'success', 'paper', 'clarity'])
  })
})

describe('press', () => {
  it('brings the note to front and selects it', () => {
    const state = notesReducer(threeNotes, { type: 'press', id: 'a' })
    expect(zOf(state, 'a')).toBe(4)
    expect(state.selectedId).toBe('a')
  })

  it('returns the same state when the note is already in front and selected', () => {
    expect(notesReducer(threeNotes, { type: 'press', id: 'c' })).toBe(threeNotes)
  })
})

describe('select', () => {
  it('selects without changing the stacking order', () => {
    const state = notesReducer(threeNotes, { type: 'select', id: 'a' })
    expect(state.selectedId).toBe('a')
    expect(state.notes).toBe(threeNotes.notes)
  })

  it('clears the selection with null', () => {
    expect(notesReducer(threeNotes, { type: 'select', id: null }).selectedId).toBeNull()
  })
})

describe('setRect and update', () => {
  it('changes only the targeted note', () => {
    const moved = { ...rect, x: 300 }
    const state = notesReducer(threeNotes, { type: 'setRect', id: 'b', rect: moved })
    expect(state.notes[1].rect).toEqual(moved)
    expect(state.notes[0]).toBe(threeNotes.notes[0])
    expect(state.notes[2]).toBe(threeNotes.notes[2])
  })

  it('updates the title, text and colour', () => {
    const state = notesReducer(threeNotes, {
      type: 'update',
      id: 'a',
      changes: { title: 'Plan', text: 'Ship it', color: 'paper' },
    })
    expect(state.notes[0]).toMatchObject({ title: 'Plan', text: 'Ship it', color: 'paper' })
  })
})

describe('remove', () => {
  it('removes the note and clears its selection in the same step', () => {
    const state = notesReducer(threeNotes, { type: 'remove', id: 'c' })
    expect(state.notes.map((note) => note.id)).toEqual(['a', 'b'])
    expect(state.selectedId).toBeNull()
  })

  it('keeps the selection when another note is removed', () => {
    expect(notesReducer(threeNotes, { type: 'remove', id: 'a' }).selectedId).toBe('c')
  })
})

describe('moveLayer', () => {
  it('swaps z with the next note forward', () => {
    const state = notesReducer(threeNotes, { type: 'moveLayer', id: 'a', direction: 'forward' })
    expect([zOf(state, 'a'), zOf(state, 'b'), zOf(state, 'c')]).toEqual([2, 1, 3])
  })

  it('swaps z with the next note backward', () => {
    const state = notesReducer(threeNotes, { type: 'moveLayer', id: 'c', direction: 'backward' })
    expect([zOf(state, 'a'), zOf(state, 'b'), zOf(state, 'c')]).toEqual([1, 3, 2])
  })

  it('returns the same state at the front or back', () => {
    expect(notesReducer(threeNotes, { type: 'moveLayer', id: 'c', direction: 'forward' })).toBe(threeNotes)
    expect(notesReducer(threeNotes, { type: 'moveLayer', id: 'a', direction: 'backward' })).toBe(threeNotes)
  })
})

describe('load', () => {
  it('replaces the board and clears the selection', () => {
    const saved: Note = { id: 'x', rect, z: 7, title: 'Saved', text: '', color: 'success' }
    const state = notesReducer(threeNotes, { type: 'load', board: { version: 1, notes: [saved], created: 9 } })
    expect(state).toMatchObject({ notes: [saved], selectedId: null, created: 9, past: [], future: [] })
  })
})

describe('fitToBoard', () => {
  it('moves notes that stick out back inside the board', () => {
    const state = notesReducer(threeNotes, { type: 'setRect', id: 'a', rect: { ...rect, x: 900 } })
    const fitted = notesReducer(state, { type: 'fitToBoard', bounds: { width: 1000, height: 700 } })
    expect(fitted.notes[0].rect.x).toBe(760)
  })

  it('returns the same state when every note already fits', () => {
    expect(notesReducer(threeNotes, { type: 'fitToBoard', bounds: { width: 1000, height: 700 } })).toBe(threeNotes)
  })
})

describe('undo and redo', () => {
  const titles = (state: NotesState) => state.notes.map((note) => note.title)

  it('undoes and redoes adding a note', () => {
    const undone = notesReducer(threeNotes, { type: 'undo' })
    expect(undone.notes.map((note) => note.id)).toEqual(['a', 'b'])
    const redone = notesReducer(undone, { type: 'redo' })
    expect(redone.notes.map((note) => note.id)).toEqual(['a', 'b', 'c'])
  })

  it('brings back a deleted note', () => {
    const removed = notesReducer(threeNotes, { type: 'remove', id: 'b' })
    expect(notesReducer(removed, { type: 'undo' }).notes).toEqual(threeNotes.notes)
  })

  it('undoes a burst of typing in one field as one step', () => {
    let state = threeNotes
    for (const title of ['H', 'Hi', 'Hi!']) state = notesReducer(state, { type: 'update', id: 'a', changes: { title } })
    expect(titles(state)[0]).toBe('Hi!')
    expect(titles(notesReducer(state, { type: 'undo' }))[0]).toBe('')
  })

  it('starts a new step when typing moves to another field or note', () => {
    let state = notesReducer(threeNotes, { type: 'update', id: 'a', changes: { title: 'Title' } })
    state = notesReducer(state, { type: 'update', id: 'a', changes: { text: 'Text' } })
    const undone = notesReducer(state, { type: 'undo' })
    expect(undone.notes[0]).toMatchObject({ title: 'Title', text: '' })
  })

  it('starts a new step after any other action, even selecting', () => {
    let state = notesReducer(threeNotes, { type: 'update', id: 'a', changes: { title: 'One' } })
    state = notesReducer(state, { type: 'select', id: 'b' })
    state = notesReducer(state, { type: 'update', id: 'a', changes: { title: 'One two' } })
    expect(titles(notesReducer(state, { type: 'undo' }))[0]).toBe('One')
  })

  it('does not record selection or press-to-front as steps', () => {
    let state = notesReducer(threeNotes, { type: 'select', id: 'a' })
    state = notesReducer(state, { type: 'press', id: 'a' })
    expect(state.past).toHaveLength(threeNotes.past.length)
  })

  it('clears redo after a new change', () => {
    const undone = notesReducer(threeNotes, { type: 'undo' })
    const changed = notesReducer(undone, { type: 'moveLayer', id: 'a', direction: 'forward' })
    expect(changed.future).toEqual([])
    expect(notesReducer(changed, { type: 'redo' })).toBe(changed)
  })

  it('keeps the selection only when the note still exists', () => {
    expect(notesReducer(threeNotes, { type: 'undo' }).selectedId).toBeNull()
    const moved = notesReducer(threeNotes, { type: 'setRect', id: 'c', rect: { ...rect, x: 99 } })
    expect(notesReducer(moved, { type: 'undo' }).selectedId).toBe('c')
  })

  it('returns the same state with nothing to undo or redo', () => {
    expect(notesReducer(INITIAL_NOTES_STATE, { type: 'undo' })).toBe(INITIAL_NOTES_STATE)
    expect(notesReducer(threeNotes, { type: 'redo' })).toBe(threeNotes)
  })

  it('keeps at most 100 steps', () => {
    let state = INITIAL_NOTES_STATE
    for (let i = 0; i < 120; i += 1) state = notesReducer(state, { type: 'add', id: `n${i}`, rect })
    expect(state.past).toHaveLength(100)
  })
})
