import type { Theme } from '../../hooks/useTheme'
import { NoteIcon, PlusIcon } from '../Icons/Icons'
import { SaveStatus, type SaveState } from '../SaveStatus/SaveStatus'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'

type AppHeaderProps = {
  theme: Theme
  onToggleTheme: () => void
  /** Null hides the status, as on the empty board. */
  saveState: SaveState | null
  onNewNote?: () => void
}

export function AppHeader({ theme, onToggleTheme, saveState, onNewNote }: AppHeaderProps) {
  return (
    <header className="flex h-header shrink-0 items-center justify-between border-b border-header-line bg-header px-6 text-fg-on-action">
      <h1 className="flex items-center gap-2.5 font-display text-18 font-semibold tracking-heading-sm">
        <NoteIcon className="size-5" />
        Sticky Notes
      </h1>

      <div className="flex items-center gap-4">
        {saveState && <SaveStatus state={saveState} />}

        <button
          type="button"
          onClick={onNewNote}
          className="btn-edge flex h-9 items-center gap-2 rounded-4 px-4 text-14 font-semibold"
        >
          <PlusIcon className="size-4" />
          New note
        </button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
