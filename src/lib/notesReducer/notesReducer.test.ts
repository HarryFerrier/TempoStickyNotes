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
    expect(state).toEqual({ notes: [saved], selectedId: null, created: 9 })
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
