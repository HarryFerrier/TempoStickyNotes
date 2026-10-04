import type { Ref } from 'react'
import { TrashIcon } from '../Icons/Icons'

type TrashZoneProps = {
  ref: Ref<HTMLDivElement>
}

/**
 * The drop target for deleting notes. A note drag sets `data-armed` on it
 * directly while the pointer is over it, so arming never re-renders the board.
 * Armed, it rises above the notes layer so its state shows over the dragged note.
 */
export function TrashZone({ ref }: TrashZoneProps) {
  return (
    <div
      ref={ref}
      className="group/trash absolute right-6 bottom-6 flex h-30 w-55 select-none flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-trash-line bg-trash text-14 text-trash-fg transition-colors data-armed:z-10 data-armed:border-danger data-armed:bg-danger-subtle data-armed:text-danger-fg"
    >
      <TrashIcon className="size-4.5" />
      <span className="group-data-armed/trash:hidden">Drop a note here to delete</span>
      <span className="hidden group-data-armed/trash:inline">Release to delete</span>
    </div>
  )
}
