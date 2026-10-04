import { useEffect, type Dispatch, type RefObject } from 'react'
import type { NotesAction } from '../lib/notesReducer'

/**
 * Keeps notes inside the board when it shrinks: a smaller window, the notes
 * panel opening, or saved notes loading into a smaller window than they were
 * made in. The observer also fires once when it starts, which fits loaded notes.
 */
export function useFitNotesToBoard(
  boardRef: RefObject<HTMLElement | null>,
  dispatch: Dispatch<NotesAction>,
  enabled: boolean,
) {
  useEffect(() => {
    const board = boardRef.current
    if (!board || !enabled) return

    const observer = new ResizeObserver(() => {
      dispatch({ type: 'fitToBoard', bounds: { width: board.clientWidth, height: board.clientHeight } })
    })
    observer.observe(board)
    return () => observer.disconnect()
  }, [boardRef, dispatch, enabled])
}
