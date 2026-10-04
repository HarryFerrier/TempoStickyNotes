import { useRef, type PointerEvent, type RefObject } from 'react'
import { useNotesDispatch } from '../../hooks/useNotesDispatch'
import { createId } from '../../lib/createId'
import type { Note } from '../../models/note'
import { EmptyBoardHint } from '../EmptyBoardHint/EmptyBoardHint'
import { StickyNote } from '../StickyNote/StickyNote'
import { TrashZone } from '../TrashZone/TrashZone'
import { useDrawToCreate } from '../../hooks/useDrawToCreate'

type BoardProps = {
  boardRef: RefObject<HTMLElement | null>
  notes: Note[]
  selectedId: string | null
}

export function Board({ boardRef, notes, selectedId }: BoardProps) {
  const dispatch = useNotesDispatch()
  const trashRef = useRef<HTMLDivElement>(null)
  const { draftRef, readoutRef, handlers } = useDrawToCreate((rect) => dispatch({ type: 'add', id: createId(), rect }))

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    // Pressing empty board clears the selection, then may start a draw.
    if (event.target === event.currentTarget) dispatch({ type: 'select', id: null })
    handlers.onPointerDown(event)
  }

  return (
    <main
      ref={boardRef}
      aria-label="Board"
      className="group board-grid relative min-w-0 flex-1 cursor-crosshair touch-none overflow-hidden"
      {...handlers}
      onPointerDown={onPointerDown}
    >
      {notes.length === 0 && <EmptyBoardHint />}
      <TrashZone ref={trashRef} />

      {/* Own stacking context, so note z-indexes never climb above the draw outline. */}
      <div className="pointer-events-none absolute inset-0 isolate">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} selected={note.id === selectedId} trashRef={trashRef} />
        ))}
      </div>

      <div
        ref={draftRef}
        hidden
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-xs border border-dashed border-focus bg-ghost data-too-small:border-fg-meta data-too-small:bg-transparent data-too-small:opacity-60"
      >
        <div
          ref={readoutRef}
          className="absolute rounded-4 bg-badge px-2 py-1 text-12 font-semibold whitespace-nowrap text-fg-on-badge"
        />
      </div>
    </main>
  )
}
