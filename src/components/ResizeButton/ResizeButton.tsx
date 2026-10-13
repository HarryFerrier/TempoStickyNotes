import type { ComponentProps } from 'react'
import type { Corner } from '../../models/note'
import { ResizeIcon } from '../Icons/Icons'

type ResizeButtonProps = Omit<ComponentProps<'button'>, 'type' | 'aria-label' | 'tabIndex' | 'className' | 'children'> & {
  corner: Corner
  /** The note's name, for the button's accessible name. */
  noteLabel: string
}

// The top handles sit just below the 32px strip, which stays the move handle.
const POSITIONS: Record<Corner, string> = {
  'top-left': 'top-8 left-0 cursor-nwse-resize',
  'top-right': 'top-8 right-0 cursor-nesw-resize',
  'bottom-left': 'bottom-0 left-0 cursor-nesw-resize',
  'bottom-right': 'bottom-0 right-0 cursor-nwse-resize',
}

// The icon points to the bottom-right; turn it to face its own corner.
const ICON_ROTATIONS: Record<Corner, string> = {
  'top-left': 'rotate-180',
  'top-right': '-rotate-90',
  'bottom-left': 'rotate-90',
  'bottom-right': '',
}

/**
 * A corner handle that resizes its note. Only the bottom-right one is shown at rest
 * and reached by Tab; the others appear while the note (a `group/note`) is hovered
 * or selected, so they don't crowd every note or add three tab stops to each.
 */
export function ResizeButton({ corner, noteLabel, ...handlers }: ResizeButtonProps) {
  const primary = corner === 'bottom-right'

  return (
    <button
      type="button"
      aria-label={`Resize ${noteLabel} from ${corner.replace('-', ' ')}`}
      tabIndex={primary ? 0 : -1}
      {...handlers}
      className={`absolute flex size-5 items-center justify-center rounded-4 text-note-handle ${POSITIONS[corner]}`}
    >
      <ResizeIcon
        className={`size-3 ${ICON_ROTATIONS[corner]} ${primary ? '' : 'opacity-0 transition-opacity group-hover/note:opacity-100 group-data-selected/note:opacity-100'}`}
      />
    </button>
  )
}
