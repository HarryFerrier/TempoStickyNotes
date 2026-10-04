import { useState } from 'react'
import type { Note } from '../../models/note'
import { ChevronIcon } from '../Icons/Icons'

type NotesPanelProps = {
  notes: Note[]
}

export function NotesPanel({ notes }: NotesPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const frontFirst = [...notes].sort((a, b) => b.z - a.z)

  return (
    <aside
      aria-label="Notes"
      className={`flex shrink-0 flex-col overflow-hidden border-l border-line-subtle bg-panel transition-[width] duration-200 ease-settle ${
        collapsed ? 'w-10' : 'w-55'
      }`}
    >
      {/* Fixed width so the content is clipped, not reflowed, while the panel animates open. */}
      <div className={`flex h-full flex-col ${collapsed ? 'w-10' : 'w-55'}`}>
        <div className={`flex h-12 shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between pr-3 pl-5'}`}>
          {!collapsed && (
            <h2 className="flex items-baseline gap-2 text-11 font-semibold tracking-eyebrow text-fg uppercase">
              Notes
              <span className="font-normal text-fg-meta">{notes.length}</span>
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

        {!collapsed && notes.length === 0 && (
          <p className="px-5 text-12 leading-normal text-fg-meta">
            Notes you add are listed here, front-most first.
          </p>
        )}

        {!collapsed && notes.length > 0 && (
          <>
            <p className="px-5 pb-2 text-11 tracking-eyebrow text-fg-meta uppercase">Front</p>
            <ol aria-label="Notes, front-most first" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-2">
              {frontFirst.map((note) => (
                <li key={note.id} className="flex h-10 shrink-0 items-center gap-3 rounded-4 px-3 text-14 text-fg">
                  <span
                    aria-hidden="true"
                    data-color={note.color}
                    className="h-3.5 w-5 shrink-0 rounded-xs border-t-[3px] border-note-strip bg-note"
                  />
                  <span className={`truncate ${note.title ? '' : 'text-fg-meta'}`}>{note.title || 'Untitled'}</span>
                </li>
              ))}
            </ol>
            <p className="px-5 py-4 text-11 tracking-eyebrow text-fg-meta uppercase">Back</p>
          </>
        )}
      </div>
    </aside>
  )
}
