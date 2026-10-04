import { useRef } from 'react'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Board } from './components/Board/Board'
import { NotesPanel } from './components/NotesPanel/NotesPanel'
import { useNotes } from './hooks/useNotes'
import { NotesDispatchContext } from './hooks/useNotesDispatch'
import { useTheme } from './hooks/useTheme'
import { createId } from './lib/createId'
import { newNoteRect } from './lib/geometry'
import { createNoteStore } from './lib/storage/createNoteStore'

// Chosen once per page load; see createNoteStore for the demo URL options.
const store = createNoteStore()

function App() {
  const { theme, toggleTheme } = useTheme()
  const { state, dispatch, loaded, saveStatus } = useNotes(store)
  const { notes, selectedId } = state
  const boardRef = useRef<HTMLElement>(null)
  const newNotePresses = useRef(0)

  // The design shows no status on an empty board; it appears once there's something to save.
  const visibleSaveStatus = !loaded || (notes.length === 0 && saveStatus === 'saved') ? null : saveStatus

  function handleNewNote() {
    const board = boardRef.current
    if (!board) return

    const rect = newNoteRect({ width: board.clientWidth, height: board.clientHeight }, newNotePresses.current)
    dispatch({ type: 'add', id: createId(), rect })
    newNotePresses.current += 1
  }

  return (
    <NotesDispatchContext value={dispatch}>
      {/* Below the brief's minimum viewport the page scrolls instead of squashing the layout. */}
      <div className="flex h-dvh min-h-[768px] min-w-[1024px] flex-col">
        <AppHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          saveState={visibleSaveStatus}
          onNewNote={handleNewNote}
          newNoteDisabled={!loaded}
        />
        <div className="flex min-h-0 flex-1">
          <Board boardRef={boardRef} notes={notes} selectedId={selectedId} loaded={loaded} />
          <NotesPanel notes={notes} selectedId={selectedId} />
        </div>
      </div>
    </NotesDispatchContext>
  )
}

export default App
