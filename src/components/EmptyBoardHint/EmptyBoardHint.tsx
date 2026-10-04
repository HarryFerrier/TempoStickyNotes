import { CrosshairIcon } from '../Icons/Icons'

export function EmptyBoardHint() {
  return (
    // Ignores the pointer so a drag that starts over the hint still draws a note, and fades out while one is drawn.
    <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center px-6 text-center transition-opacity duration-150 group-data-drawing:opacity-0">
      <div aria-hidden="true" className="relative mb-7 h-24 w-36 rounded-xs border border-dashed border-focus bg-ghost">
        <CrosshairIcon className="absolute -right-2.5 -bottom-2.5 size-5 text-fg" />
      </div>

      <h2 className="font-display text-28 font-medium leading-tight tracking-heading-sm text-fg">
        Drag anywhere to draw a note
      </h2>
      <p className="mt-3 max-w-100 text-14 leading-relaxed text-fg-secondary">
        The outline you drag sets its size and position. New note adds one at the default size.
      </p>
    </div>
  )
}
