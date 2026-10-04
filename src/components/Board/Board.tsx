import type { RefObject } from 'react'
import type { Note, Rect } from '../../models/note'
import { EmptyBoardHint } from '../EmptyBoardHint/EmptyBoardHint'
import { StickyNote } from '../StickyNote/StickyNote'
import { TrashZone } from '../TrashZone/TrashZone'
import { useDrawToCreate } from './useDrawToCreate'

type BoardProps = {
  boardRef: RefObject<HTMLElement | null>
  notes: Note[]
  onCreateNote: (rect: Rect) => void
}

export function Board({ boardRef, notes, onCreateNote }: BoardProps) {
  const { draftRef, readoutRef, handlers } = useDrawToCreate(onCreateNote)

  return (
    <main
      ref={boardRef}
      aria-label="Board"
      className="group board-grid relative min-w-0 flex-1 cursor-crosshair touch-none overflow-hidden"
      {...handlers}
    >
      {notes.length === 0 && <EmptyBoardHint />}
      <TrashZone />

      {/* Own stacking context, so note z-indexes never climb above the draw outline. */}
      <div className="pointer-events-none absolute inset-0 isolate">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} />
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
