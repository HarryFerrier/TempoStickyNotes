import { memo, useRef, type KeyboardEvent, type RefObject } from 'react'
import type { Note, NoteContent, Rect } from '../../models/note'
import { ColourSwatches } from '../ColourSwatches/ColourSwatches'
import { GripIcon, ResizeIcon } from '../Icons/Icons'
import { useNoteGesture } from './useNoteGesture'

/** Everything a note can ask the app to do. Created once, so memoised notes don't re-render. */
export type NoteActions = {
  /** Pointer press: select and bring to front. */
  press: (id: string) => void
  /** Keyboard focus: select without changing the stacking order. */
  select: (id: string) => void
  deselect: () => void
  changeRect: (id: string, rect: Rect) => void
  update: (id: string, changes: Partial<NoteContent>) => void
  remove: (id: string) => void
}

type StickyNoteProps = {
  note: Note
  selected: boolean
  trashRef: RefObject<HTMLElement | null>
  actions: NoteActions
}

// Memoised so a change to one note only re-renders that note.
export const StickyNote = memo(function StickyNote({ note, selected, trashRef, actions }: StickyNoteProps) {
  const { id, rect, z, color, title, text } = note
  const label = title || 'Untitled'
  const textRef = useRef<HTMLTextAreaElement>(null)
  const { noteRef, gestureHandlers, startMove, startResize, onResizeKeyDown, onNoteKeyDown } = useNoteGesture(note, {
    trashRef,
    onRectChange: actions.changeRect,
    onDelete: actions.remove,
  })

  function onFieldKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      actions.deselect()
    }
  }

  return (
    <article
      ref={noteRef}
      data-color={color}
      data-selected={selected || undefined}
      aria-label={label}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Delete"
      tabIndex={0}
      onPointerDown={() => actions.press(id)}
      onFocus={() => actions.select(id)}
      onKeyDown={(event) => {
        onNoteKeyDown(event)
        if (event.key === 'Escape' && event.target === event.currentTarget) {
          event.currentTarget.blur()
          actions.deselect()
        }
      }}
      className="pointer-events-auto absolute top-0 left-0 flex cursor-default select-none flex-col overflow-hidden rounded-4 bg-note text-note-fg shadow-rest transition-opacity data-gesture:shadow-lift data-over-trash:opacity-50 data-selected:shadow-lift data-selected:outline-[1.5px] data-selected:outline-focus data-selected:outline-solid"
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
        className="flex h-8 shrink-0 cursor-grab items-center justify-between bg-note-strip px-3 text-note-grip active:cursor-grabbing"
      >
        <GripIcon className="size-3.5" />
        {selected && <ColourSwatches value={color} onChange={(next) => actions.update(id, { color: next })} />}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3.5 pb-5">
        {/* autoFocus only applies on mount: a note that mounts selected was just created. */}
        <input
          autoFocus={selected}
          value={title}
          placeholder="Untitled"
          aria-label="Title"
          maxLength={80}
          onChange={(event) => actions.update(id, { title: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              textRef.current?.focus()
            }
            onFieldKeyDown(event)
          }}
          className="w-full min-w-0 bg-transparent font-display text-18 font-semibold leading-tight text-note-fg select-text placeholder:text-note-fg-secondary focus-visible:outline-none"
        />
        <textarea
          ref={textRef}
          value={text}
          placeholder={selected ? 'Add some text' : undefined}
          aria-label="Text"
          onChange={(event) => actions.update(id, { text: event.target.value })}
          onKeyDown={onFieldKeyDown}
          className="mt-1.5 min-h-0 w-full flex-1 resize-none bg-transparent text-14 leading-normal text-note-fg-secondary select-text placeholder:text-note-fg-secondary/70 focus-visible:outline-none"
        />
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
