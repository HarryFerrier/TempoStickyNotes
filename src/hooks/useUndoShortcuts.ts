import { useEffect, type Dispatch } from 'react'
import type { NotesAction } from '../lib/notesReducer/notesReducer'

function isTextField(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
}

/**
 * Cmd/Ctrl+Z undoes and Shift+Cmd/Ctrl+Z or Ctrl+Y redoes board changes. While
 * typing in a field the keys are left alone, so the browser's own text undo works.
 */
export function useUndoShortcuts(dispatch: Dispatch<NotesAction>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || isTextField(event.target)) return

      const key = event.key.toLowerCase()
      const redo = (key === 'z' && event.shiftKey) || (key === 'y' && event.ctrlKey && !event.shiftKey)
      if (key !== 'z' && !redo) return

      event.preventDefault()
      dispatch({ type: redo ? 'redo' : 'undo' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])
}
