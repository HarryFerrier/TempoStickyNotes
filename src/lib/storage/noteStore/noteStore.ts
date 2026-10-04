import { NOTE_COLORS, type Note, type NoteColor, type Rect, type SavedBoard } from '../../../models/note'

/** Where the board is saved. Both stores are async, so they can be swapped without touching the app. */
export type NoteStore = {
  /** The saved board, or null if nothing has been saved yet. */
  load: () => Promise<SavedBoard | null>
  save: (board: SavedBoard) => Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNoteColor(value: unknown): value is NoteColor {
  return (NOTE_COLORS as readonly unknown[]).includes(value)
}

function isRect(value: unknown): value is Rect {
  return isRecord(value) && [value.x, value.y, value.width, value.height].every(isFiniteNumber)
}

function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isRect(value.rect) &&
    isFiniteNumber(value.z) &&
    typeof value.title === 'string' &&
    typeof value.text === 'string' &&
    isNoteColor(value.color)
  )
}

/**
 * Checks saved data before the app trusts it. Returns null for anything that
 * isn't a saved board, and drops individual notes that don't match the model.
 */
export function parseSavedBoard(value: unknown): SavedBoard | null {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.notes)) return null

  const notes = value.notes.filter(isNote)
  return { version: 1, notes, created: isFiniteNumber(value.created) ? value.created : notes.length }
}
