import type { Note } from '../../models/note'
import { GripIcon } from '../Icons/Icons'

type StickyNoteProps = {
  note: Note
}

export function StickyNote({ note }: StickyNoteProps) {
  const { rect, z, color, title, text } = note

  return (
    <article
      data-color={color}
      aria-label={title || 'Untitled'}
      className="pointer-events-auto absolute top-0 left-0 flex select-none flex-col overflow-hidden rounded-4 bg-note text-note-fg shadow-rest"
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.width,
        height: rect.height,
        zIndex: z,
      }}
    >
      <div className="flex h-8 shrink-0 items-center bg-note-strip px-3 text-note-grip">
        <GripIcon className="size-3.5" />
      </div>

      <div className="min-h-0 flex-1 px-4 py-3.5">
        <h3
          className={`font-display text-18 font-semibold leading-tight ${title ? '' : 'text-note-fg-secondary'}`}
        >
          {title || 'Untitled'}
        </h3>
        {text && <p className="mt-1.5 text-14 leading-normal text-note-fg-secondary">{text}</p>}
      </div>
    </article>
  )
}
