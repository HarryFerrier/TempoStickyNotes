import { useCallback, useRef, useState } from 'react'
import { NOTE_COLORS, type LayerDirection, type Note, type NoteContent, type Rect } from '../models/note'

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

  /** Adds a note in front of all others and returns its id. New notes cycle through the colours. */
  const addNote = useCallback((rect: Rect) => {
    const color = NOTE_COLORS[createdCount.current % NOTE_COLORS.length]
    createdCount.current += 1
    const id = createId()

    setNotes((current) => [...current, { id, rect, z: frontZ(current) + 1, title: '', text: '', color }])
    return id
  }, [])

  const bringToFront = useCallback((id: string) => {
    setNotes((current) => {
      const top = frontZ(current)
      // Returning the same array skips the re-render when the note is already in front.
      if (current.find((note) => note.id === id)?.z === top) return current
      return current.map((note) => (note.id === id ? { ...note, z: top + 1 } : note))
    })
  }, [])

  const setNoteRect = useCallback((id: string, rect: Rect) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, rect } : note)))
  }, [])

  const updateNote = useCallback((id: string, changes: Partial<NoteContent>) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...changes } : note)))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id))
  }, [])

  /** Swaps the note's z with the next note in front of it or behind it. */
  const moveLayer = useCallback((id: string, direction: LayerDirection) => {
    setNotes((current) => {
      const backToFront = [...current].sort((a, b) => a.z - b.z)
      const index = backToFront.findIndex((note) => note.id === id)
      const target = backToFront[index]
      const neighbour = backToFront[direction === 'forward' ? index + 1 : index - 1]
      if (!target || !neighbour) return current

      return current.map((note) => {
        if (note.id === target.id) return { ...note, z: neighbour.z }
        if (note.id === neighbour.id) return { ...note, z: target.z }
        return note
      })
    })
  }, [])

  return { notes, addNote, bringToFront, setNoteRect, updateNote, deleteNote, moveLayer }
}
