import { useRef } from 'react'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Board } from './components/Board/Board'
import { NotesPanel } from './components/NotesPanel/NotesPanel'
import { useNotes } from './hooks/useNotes'
import { useTheme } from './hooks/useTheme'
import { newNoteRect } from './lib/geometry'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { notes, addNote } = useNotes()
  const boardRef = useRef<HTMLElement>(null)
  const newNotePresses = useRef(0)

  function handleNewNote() {
    const board = boardRef.current
    if (!board) return

    addNote(newNoteRect({ width: board.clientWidth, height: board.clientHeight }, newNotePresses.current))
    newNotePresses.current += 1
  }

  return (
    // Below the brief's minimum viewport the page scrolls instead of squashing the layout.
    <div className="flex h-dvh min-h-[768px] min-w-[1024px] flex-col">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} saveState={null} onNewNote={handleNewNote} />
      <div className="flex min-h-0 flex-1">
        <Board boardRef={boardRef} notes={notes} onCreateNote={addNote} />
        <NotesPanel notes={notes} />
      </div>
    </div>
  )
}

export default App
