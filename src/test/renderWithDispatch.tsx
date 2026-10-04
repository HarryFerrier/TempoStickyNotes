import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'
import { NotesDispatchContext } from '../hooks/useNotesDispatch'
import type { NotesAction } from '../lib/notesReducer/notesReducer'

/**
 * Renders inside the dispatch context and returns a spy that records every dispatched action.
 * The provider is a `wrapper`, so `rerender` keeps it too.
 */
export function renderWithDispatch(ui: ReactElement) {
  const dispatch = vi.fn<(action: NotesAction) => void>()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotesDispatchContext value={dispatch}>{children}</NotesDispatchContext>
  )
  return { ...render(ui, { wrapper }), dispatch }
}
