import { memo } from 'react'
import type { Note, Rect } from '../../models/note'
import { GripIcon, ResizeIcon } from '../Icons/Icons'
import { useNoteGesture } from './useNoteGesture'

type StickyNoteProps = {
  note: Note
  onBringToFront: (id: string) => void
  onRectChange: (id: string, rect: Rect) => void
}

// Memoised so moving or reordering one note only re-renders that note.
export const StickyNote = memo(function StickyNote({ note, onBringToFront, onRectChange }: StickyNoteProps) {
  const { rect, z, color, title, text } = note
  const label = title || 'Untitled'
  const { noteRef, gestureHandlers, startMove, startResize, onResizeKeyDown } = useNoteGesture(note, onRectChange)

  return (
    <article
      ref={noteRef}
      data-color={color}
      aria-label={label}
      onPointerDown={() => onBringToFront(note.id)}
      className="pointer-events-auto absolute top-0 left-0 flex cursor-default select-none flex-col overflow-hidden rounded-4 bg-note text-note-fg shadow-rest data-gesture:shadow-lift"
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.width,
        height: rect.height,
        zIndex: z,
      }}
    >
      <div
        onPointerDown={startMove}
        {...gestureHandlers}
        className="flex h-8 shrink-0 cursor-grab items-center bg-note-strip px-3 text-note-grip active:cursor-grabbing"
      >
        <GripIcon className="size-3.5" />
      </div>

      <div className="min-h-0 flex-1 px-4 py-3.5">
        <h3
          className={`font-display text-18 font-semibold leading-tight ${title ? '' : 'text-note-fg-secondary'}`}
        >
          {label}
        </h3>
        {text && <p className="mt-1.5 text-14 leading-normal text-note-fg-secondary">{text}</p>}
      </div>

      <button
        type="button"
        aria-label={`Resize ${label}`}
        onPointerDown={startResize}
        onKeyDown={onResizeKeyDown}
        {...gestureHandlers}
        className="absolute right-0 bottom-0 flex size-5 cursor-nwse-resize items-center justify-center rounded-4 text-note-handle"
      >
        <ResizeIcon className="size-3" />
      </button>
    </article>
  )
})
