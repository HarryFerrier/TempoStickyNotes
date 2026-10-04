import { TrashIcon } from '../Icons/Icons'

type TrashZoneProps = {
  /** A dragged note is over the zone and will be deleted on release. */
  active?: boolean
}

export function TrashZone({ active = false }: TrashZoneProps) {
  return (
    <div
      className={`absolute right-6 bottom-6 flex h-30 w-55 select-none flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed text-14 transition-colors ${
        active ? 'border-danger bg-danger-subtle text-danger-fg' : 'border-trash-line bg-trash text-trash-fg'
      }`}
    >
      <TrashIcon className="size-4.5" />
      {active ? 'Release to delete' : 'Drop a note here to delete'}
    </div>
  )
}
