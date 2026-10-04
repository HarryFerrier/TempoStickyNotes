import { NOTE_COLORS, type LayerDirection, type Note, type NoteContent, type Rect } from '../models/note'

export type NotesState = {
  notes: Note[]
  selectedId: string | null
  /** How many notes have been created, which picks the next colour. */
  created: number
}

export type NotesAction =
  /** Adds a note in front of all others and selects it. The id is made by the caller, which keeps this reducer pure. */
  | { type: 'add'; id: string; rect: Rect }
  /** A pointer press: selects the note and brings it to front. */
  | { type: 'press'; id: string }
  /** Selects a note without changing the stacking order, or clears the selection. */
  | { type: 'select'; id: string | null }
  | { type: 'setRect'; id: string; rect: Rect }
  | { type: 'update'; id: string; changes: Partial<NoteContent> }
  | { type: 'remove'; id: string }
  /** Swaps the note's z with the next note in front of it or behind it. */
  | { type: 'moveLayer'; id: string; direction: LayerDirection }

export const INITIAL_NOTES_STATE: NotesState = { notes: [], selectedId: null, created: 0 }

function frontZ(notes: Note[]) {
  return notes.reduce((max, note) => Math.max(max, note.z), 0)
}

function patchNote(notes: Note[], id: string, patch: Partial<Note>) {
  return notes.map((note) => (note.id === id ? { ...note, ...patch } : note))
}

function bringToFront(notes: Note[], id: string) {
  const top = frontZ(notes)
  // The same array back means nothing changed, so React can skip the re-render.
  if (notes.find((note) => note.id === id)?.z === top) return notes
  return patchNote(notes, id, { z: top + 1 })
}

function moveLayer(notes: Note[], id: string, direction: LayerDirection) {
  const backToFront = [...notes].sort((a, b) => a.z - b.z)
  const index = backToFront.findIndex((note) => note.id === id)
  const target = backToFront[index]
  const neighbour = backToFront[direction === 'forward' ? index + 1 : index - 1]
  if (!target || !neighbour) return notes

  return notes.map((note) => {
    if (note.id === target.id) return { ...note, z: neighbour.z }
    if (note.id === neighbour.id) return { ...note, z: target.z }
    return note
  })
}

// Every action must be handled: the return type rejects a switch that misses one.
export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'add': {
      const note: Note = {
        id: action.id,
        rect: action.rect,
        z: frontZ(state.notes) + 1,
        title: '',
        text: '',
        color: NOTE_COLORS[state.created % NOTE_COLORS.length],
      }
      return { notes: [...state.notes, note], selectedId: note.id, created: state.created + 1 }
    }

    case 'press': {
      const notes = bringToFront(state.notes, action.id)
      if (notes === state.notes && state.selectedId === action.id) return state
      return { ...state, notes, selectedId: action.id }
    }

    case 'select':
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id }

    case 'setRect':
      return { ...state, notes: patchNote(state.notes, action.id, { rect: action.rect }) }

    case 'update':
      return { ...state, notes: patchNote(state.notes, action.id, action.changes) }

    case 'remove':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      }

    case 'moveLayer': {
      const notes = moveLayer(state.notes, action.id, action.direction)
      return notes === state.notes ? state : { ...state, notes }
    }
  }
}
