import { useCallback, useMemo, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Board } from './components/Board/Board'
import { NotesPanel } from './components/NotesPanel/NotesPanel'
import type { NoteActions } from './components/StickyNote/StickyNote'
import { useNotes } from './hooks/useNotes'
import { useTheme } from './hooks/useTheme'
import { newNoteRect } from './lib/geometry'
import type { Rect } from './models/note'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { notes, addNote, bringToFront, setNoteRect, updateNote, deleteNote, moveLayer } = useNotes()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const boardRef = useRef<HTMLElement>(null)
  const newNotePresses = useRef(0)

  // New notes start selected, so their title is ready to type into.
  const createNote = useCallback(
    (rect: Rect) => {
      setSelectedId(addNote(rect))
    },
    [addNote],
  )

  function handleNewNote() {
    const board = boardRef.current
    if (!board) return

    createNote(newNoteRect({ width: board.clientWidth, height: board.clientHeight }, newNotePresses.current))
    newNotePresses.current += 1
  }

  const actions = useMemo<NoteActions>(
    () => ({
      press: (id) => {
        bringToFront(id)
        setSelectedId(id)
      },
      select: (id) => setSelectedId(id),
      deselect: () => setSelectedId(null),
      changeRect: setNoteRect,
      update: updateNote,
      remove: (id) => {
        deleteNote(id)
        setSelectedId((current) => (current === id ? null : current))
      },
    }),
    [bringToFront, setNoteRect, updateNote, deleteNote],
  )

  return (
    // Below the brief's minimum viewport the page scrolls instead of squashing the layout.
    <div className="flex h-dvh min-h-[768px] min-w-[1024px] flex-col">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} saveState={null} onNewNote={handleNewNote} />
      <div className="flex min-h-0 flex-1">
        <Board boardRef={boardRef} notes={notes} selectedId={selectedId} actions={actions} onCreateNote={createNote} />
        <NotesPanel notes={notes} selectedId={selectedId} onSelect={setSelectedId} onMoveLayer={moveLayer} />
      </div>
    </div>
  )
}

export default App
