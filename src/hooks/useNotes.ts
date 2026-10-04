import { useCallback, useRef, useState } from 'react'
import { NOTE_COLORS, type Note, type Rect } from '../models/note'

// Not crypto.randomUUID: that only exists in secure contexts, and the dev server can be opened over plain HTTP on the network.
function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function frontZ(notes: Note[]) {
  return notes.reduce((max, note) => Math.max(max, note.z), 0)
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const createdCount = useRef(0)

  /** Adds a note in front of all others. New notes cycle through the colours. */
  const addNote = useCallback((rect: Rect) => {
    const color = NOTE_COLORS[createdCount.current % NOTE_COLORS.length]
    createdCount.current += 1
    const id = createId()

    setNotes((current) => [...current, { id, rect, z: frontZ(current) + 1, title: '', text: '', color }])
  }, [])

  return { notes, addNote }
}
