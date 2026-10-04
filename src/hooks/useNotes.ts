import { useReducer } from 'react'
import { INITIAL_NOTES_STATE, notesReducer } from '../lib/notesReducer'
import type { NoteStore } from '../lib/storage/noteStore'
import { useAutosave } from './useAutosave'

/** The notes and selection, the dispatch that changes them, and their saving state. */
export function useNotes(store: NoteStore) {
  const [state, dispatch] = useReducer(notesReducer, INITIAL_NOTES_STATE)
  const { loaded, status } = useAutosave(store, state, dispatch)
  return { state, dispatch, loaded, saveStatus: status }
}
