import { useCallback, useEffect, useRef, useState, type Dispatch } from 'react'
import type { NotesAction, NotesState } from '../lib/notesReducer/notesReducer'
import type { NoteStore } from '../lib/storage/noteStore/noteStore'
import type { SaveState } from '../models/note'

const SAVE_DEBOUNCE_MS = 600
/** Waits before each retry; the last value repeats. */
const RETRY_DELAYS_MS = [1000, 2000, 5000]

/**
 * Loads the board once, then saves it whenever the notes change.
 *
 * - Edits are debounced, so typing saves once a pause, not once a keystroke.
 * - Only one save runs at a time and it always sends the latest notes, so a
 *   slow save can never land after a newer one and overwrite it.
 * - A failed save retries with backoff until it succeeds.
 * - Selection changes don't save: only the notes array and colour counter do.
 */
export function useAutosave(store: NoteStore, state: NotesState, dispatch: Dispatch<NotesAction>) {
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<SaveState>('saved')

  const latest = useRef(state)
  const savedNotes = useRef<NotesState['notes'] | null>(null)
  const saving = useRef(false)
  const saveAgain = useRef(false)
  const failures = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    latest.current = state
  })

  useEffect(() => {
    let cancelled = false
    store
      .load()
      .catch(() => null)
      .then((board) => {
        if (cancelled) return
        // Whatever the board starts with counts as saved, so loading never triggers a save:
        // the loaded notes, or the empty starting board when nothing was saved.
        savedNotes.current = board ? board.notes : latest.current.notes
        if (board) dispatch({ type: 'load', board })
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [store, dispatch])

  // A named function, so the retry and follow-up saves can call it before the hook has returned it.
  const save = useCallback(async function saveLatest() {
    if (saving.current) {
      saveAgain.current = true
      return
    }
    clearTimeout(retryTimer.current)
    saving.current = true
    saveAgain.current = false

    const { notes, created } = latest.current
    try {
      await store.save({ version: 1, notes, created })
      savedNotes.current = notes
      failures.current = 0
    } catch {
      const delay = RETRY_DELAYS_MS[Math.min(failures.current, RETRY_DELAYS_MS.length - 1)]
      failures.current += 1
      setStatus('error')
      retryTimer.current = setTimeout(() => void saveLatest(), delay)
      return
    } finally {
      saving.current = false
    }

    if (latest.current.notes === notes) setStatus('saved')
    // Changes made during the save go out straight away; otherwise their own debounce sends them.
    if (saveAgain.current) void saveLatest()
  }, [store])

  useEffect(() => {
    if (!loaded || state.notes === savedNotes.current) return
    setStatus('saving')
    const timer = setTimeout(() => void save(), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [loaded, state.notes, save])

  useEffect(() => () => clearTimeout(retryTimer.current), [])

  // Warn before leaving with changes that haven't reached the store.
  useEffect(() => {
    if (status === 'saved') return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Still needed by Safari and older browsers, which ignore preventDefault here.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [status])

  return { loaded, status }
}
