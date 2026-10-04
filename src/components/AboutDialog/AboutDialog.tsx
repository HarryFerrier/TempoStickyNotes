import { useRef, type MouseEvent } from 'react'
import { CloseIcon, InfoIcon } from '../Icons/Icons'

/**
 * The header button and the "How it's built" dialog. The native <dialog>
 * keeps focus inside, closes on Escape and returns focus to the button.
 * The text matches the Architecture section of the README; keep them in sync.
 */
export function AboutDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // A click on the dialog element itself is a click on the backdrop, outside the content.
  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  return (
    <>
      <button
        type="button"
        aria-label="About this build"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="flex size-9 items-center justify-center rounded-4 border border-header-control transition-colors hover:bg-header-control/40"
      >
        <InfoIcon className="size-4" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="about-title"
        onClick={closeOnBackdrop}
        className="m-auto max-h-[calc(100dvh-4rem)] w-full max-w-xl overflow-y-auto rounded-lg bg-panel p-0 text-fg shadow-lift backdrop:bg-ink/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="about-title" className="font-display text-22 font-semibold leading-tight tracking-heading-sm">
              How it's built
            </h2>
            <form method="dialog">
              <button
                type="submit"
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-4 text-fg-meta transition-colors hover:bg-ghost hover:text-fg"
              >
                <CloseIcon className="size-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 space-y-3 text-14 leading-relaxed text-fg-secondary">
            <p>
              The app is React and TypeScript, built with Vite and styled with Tailwind CSS from the Tempo design
              tokens. Notes are typed records (id, position and size, stacking order, title, text and colour). One
              pure reducer owns the notes and the selection, and every change is a typed action, so the compiler
              rejects any action the reducer doesn't handle. Only the reducer's dispatch is shared through context.
              Note data is passed down as props, which lets each memoised note re-render only when its own data
              changes. Because every change goes through the reducer, it also keeps an undo history: Cmd/Ctrl+Z
              undoes and Shift+Cmd/Ctrl+Z redoes, with a burst of typing undone as one step.
            </p>
            <p>
              Drawing, moving and resizing use pointer events with pointer capture. During a drag, the outline or
              note is updated directly in the DOM and the change is committed to state once, on release, so a drag
              never re-renders the board. Small pure functions handle the geometry: the minimum size, keeping notes
              on the board, and placing new notes. Notes also work from the keyboard: arrow keys move or resize
              them, Delete removes them and Escape cancels a gesture. No drag, resize or component libraries are
              used.
            </p>
            <p>
              Saving sits behind a small async store interface with two implementations: local storage, and a mock
              REST API with realistic latency and optional failures. Autosave debounces edits, runs one save at a
              time with the latest notes so saves can't land out of order, and retries failures with backoff while
              the header shows the save status. Saved data is validated before it's used, and selection is never
              saved.
            </p>
          </div>
        </div>
      </dialog>
    </>
  )
}
