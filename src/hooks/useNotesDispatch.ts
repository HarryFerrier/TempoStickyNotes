import { createContext, useContext, type Dispatch } from 'react'
import type { NotesAction } from '../lib/notesReducer/notesReducer'

/**
 * Only `dispatch` goes through context. It never changes, so reading it never
 * re-renders anything; note data stays in props, where memoised notes can see
 * exactly which note changed.
 */
export const NotesDispatchContext = createContext<Dispatch<NotesAction> | null>(null)

export function useNotesDispatch() {
  const dispatch = useContext(NotesDispatchContext)
  if (!dispatch) throw new Error('useNotesDispatch must be used inside NotesDispatchContext')
  return dispatch
}
