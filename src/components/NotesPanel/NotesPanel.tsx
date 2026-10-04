import { useState } from 'react'
import type { LayerDirection, Note } from '../../models/note'
import { ArrowIcon, ChevronIcon } from '../Icons/Icons'
import { useReorderAnimation } from './useReorderAnimation'

type NotesPanelProps = {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMoveLayer: (id: string, direction: LayerDirection) => void
}

export function NotesPanel({ notes, selectedId, onSelect, onMoveLayer }: NotesPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const frontFirst = [...notes].sort((a, b) => b.z - a.z)
  const rowRef = useReorderAnimation(frontFirst.map((note) => note.id))

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
            <ol aria-label="Notes, front-most first" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2 pt-0">
              {frontFirst.map((note, index) => {
                const selected = note.id === selectedId
                return (
                  <li
                    key={note.id}
                    ref={rowRef(note.id)}
                    className={`flex h-10 shrink-0 items-center rounded-4 border pr-1.5 transition-colors ${
                      selected ? 'border-focus bg-ghost' : 'border-transparent hover:bg-ghost'
                    }`}
                  >
                    <button
                      type="button"
                      aria-current={selected || undefined}
                      onClick={() => onSelect(note.id)}
                      className="flex h-full min-w-0 flex-1 items-center gap-3 rounded-4 pl-3 text-left text-14 text-fg"
                    >
                      <span
                        aria-hidden="true"
                        data-color={note.color}
                        className="h-3.5 w-5 shrink-0 rounded-xs border-t-[3px] border-note-strip bg-note"
                      />
                      <span className={`truncate ${note.title ? '' : 'text-fg-meta'}`}>{note.title || 'Untitled'}</span>
                    </button>

                    {selected && (
                      <>
                        <LayerButton
                          direction="up"
                          label="Bring forward"
                          disabled={index === 0}
                          onClick={() => onMoveLayer(note.id, 'forward')}
                        />
                        <LayerButton
                          direction="down"
                          label="Send backward"
                          disabled={index === frontFirst.length - 1}
                          onClick={() => onMoveLayer(note.id, 'backward')}
                        />
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
            <p className="px-5 py-4 text-11 tracking-eyebrow text-fg-meta uppercase">Back</p>
          </>
        )}
      </div>
    </aside>
  )
}

type LayerButtonProps = {
  direction: 'up' | 'down'
  label: string
  disabled: boolean
  onClick: () => void
}

function LayerButton({ direction, label, disabled, onClick }: LayerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 shrink-0 items-center justify-center rounded-4 text-fg transition-colors hover:bg-ghost disabled:text-fg-meta/50 disabled:hover:bg-transparent"
    >
      <ArrowIcon direction={direction} className="size-3.5" />
    </button>
  )
}
