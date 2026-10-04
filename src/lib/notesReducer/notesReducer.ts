import { NOTE_COLORS, type LayerDirection, type Note, type NoteContent, type Rect, type SavedBoard, type Size } from '../../models/note'
import { clampRectToBounds, sameRect } from '../geometry/geometry'

/** The part of the state that undo and redo restore. */
type Snapshot = {
  notes: Note[]
  created: number
}

export type NotesState = Snapshot & {
  selectedId: string | null
  /** Earlier snapshots, oldest first, for undo. */
  past: Snapshot[]
  /** Undone snapshots, most recent last, for redo. */
  future: Snapshot[]
  /** Identifies the last text edit, so a burst of typing in one field undoes as one step. */
  lastEdit: string | null
}

const HISTORY_LIMIT = 100

/** Changes a person would expect undo to reverse. Selection, press-to-front, loading and fitting are not. */
const UNDOABLE = new Set<NotesAction['type']>(['add', 'setRect', 'update', 'remove', 'moveLayer'])

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
  /** Replaces the board with saved data. */
  | { type: 'load'; board: SavedBoard }
  /** Moves any note that sticks out of the board back inside it, for when the board shrinks. */
  | { type: 'fitToBoard'; bounds: Size }
  | { type: 'undo' }
  | { type: 'redo' }

export const INITIAL_NOTES_STATE: NotesState = { notes: [], selectedId: null, created: 0, past: [], future: [], lastEdit: null }

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

function fitToBoard(notes: Note[], bounds: Size) {
  let changed = false
  const fitted = notes.map((note) => {
    const rect = clampRectToBounds(note.rect, bounds)
    if (sameRect(rect, note.rect)) return note
    changed = true
    return { ...note, rect }
  })
  return changed ? fitted : notes
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

function snapshot({ notes, created }: NotesState): Snapshot {
  return { notes, created }
}

/** Moves to a snapshot from the history, keeping the selection only if that note still exists. */
function restore(state: NotesState, target: Snapshot, past: Snapshot[], future: Snapshot[]): NotesState {
  const selectedId = target.notes.some((note) => note.id === state.selectedId) ? state.selectedId : null
  return { ...target, selectedId, past, future, lastEdit: null }
}

/** Applies an action and keeps the undo history up to date. */
export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  if (action.type === 'undo') {
    const previous = state.past.at(-1)
    if (!previous) return state
    return restore(state, previous, state.past.slice(0, -1), [...state.future, snapshot(state)])
  }

  if (action.type === 'redo') {
    const next = state.future.at(-1)
    if (!next) return state
    return restore(state, next, [...state.past, snapshot(state)], state.future.slice(0, -1))
  }

  const next = applyAction(state, action)
  const editKey = action.type === 'update' ? `${action.id}:${Object.keys(action.changes).sort().join()}` : null

  if (!UNDOABLE.has(action.type) || next.notes === state.notes) {
    // Anything else ends a typing burst, so the next edit starts a new undo step.
    return state.lastEdit === null || next === state ? next : { ...next, lastEdit: null }
  }

  const continuesEdit = editKey !== null && editKey === state.lastEdit
  return {
    ...next,
    past: continuesEdit ? state.past : [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
    future: [],
    lastEdit: editKey,
  }
}

// Every action must be handled: the return type rejects a switch that misses one.
function applyAction(state: NotesState, action: Exclude<NotesAction, { type: 'undo' | 'redo' }>): NotesState {
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
      return { ...state, notes: [...state.notes, note], selectedId: note.id, created: state.created + 1 }
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

    case 'load':
      return { ...INITIAL_NOTES_STATE, notes: action.board.notes, created: action.board.created }

    case 'fitToBoard': {
      const notes = fitToBoard(state.notes, action.bounds)
      return notes === state.notes ? state : { ...state, notes }
    }
  }
}
