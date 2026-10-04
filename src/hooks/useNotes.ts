import { useReducer } from 'react'
import { INITIAL_NOTES_STATE, notesReducer } from '../lib/notesReducer'

/** The notes and selection, with the dispatch that changes them. */
export function useNotes() {
  return useReducer(notesReducer, INITIAL_NOTES_STATE)
}
