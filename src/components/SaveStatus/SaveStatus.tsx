import type { SaveState } from '../../models/note'

const LABEL: Record<SaveState, string> = {
  saved: 'All changes saved',
  saving: 'Saving…',
  error: "Couldn't save. Retrying.",
}

const DOT: Record<SaveState, string> = {
  saved: 'bg-success-500',
  saving: 'bg-clarity-500',
  error: 'bg-ignition-500',
}

type SaveStatusProps = {
  state: SaveState
}

export function SaveStatus({ state }: SaveStatusProps) {
  return (
    <p
      role="status"
      className={`flex items-center gap-2 text-14 ${state === 'error' ? 'text-ignition-400' : 'text-fg-on-action/70'}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT[state]}`} />
      {LABEL[state]}
    </p>
  )
}
