import { useState } from 'react'
import { ChevronIcon } from '../Icons/Icons'

type NotesPanelProps = {
  noteCount: number
}

export function NotesPanel({ noteCount }: NotesPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      aria-label="Notes"
      className={`flex shrink-0 flex-col overflow-hidden border-l border-line-subtle bg-panel transition-[width] duration-200 ease-settle ${
        collapsed ? 'w-10' : 'w-55'
      }`}
    >
      {/* Fixed width so the content is clipped, not reflowed, while the panel animates open. */}
      <div className={collapsed ? 'w-10' : 'w-55'}>
        <div className={`flex h-12 items-center ${collapsed ? 'justify-center' : 'justify-between pr-3 pl-5'}`}>
          {!collapsed && (
            <h2 className="flex items-baseline gap-2 text-11 font-semibold tracking-eyebrow text-fg uppercase">
              Notes
              <span className="font-normal text-fg-meta">{noteCount}</span>
            </h2>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand notes panel' : 'Collapse notes panel'}
            className="flex size-7 items-center justify-center rounded-4 text-fg-meta transition-colors hover:bg-ghost hover:text-fg"
          >
            <ChevronIcon direction={collapsed ? 'left' : 'right'} className="size-4" />
          </button>
        </div>

        {!collapsed && noteCount === 0 && (
          <p className="px-5 text-12 leading-normal text-fg-meta">
            Notes you add are listed here, front-most first.
          </p>
        )}
      </div>
    </aside>
  )
}
