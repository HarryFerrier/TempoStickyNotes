import { createLocalStorageStore } from './localStorageStore'
import { createMockApiStore } from './mockApiStore'
import type { NoteStore } from './noteStore'

function numberParam(params: URLSearchParams, name: string) {
  const value = Number(params.get(name))
  return Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * Saves go through the mock API by default, which keeps its data in local storage.
 * URL options for demos: ?store=local saves straight to local storage,
 * ?failRate=0.5 fails half of all saves, and ?failSaves=2 fails the first two.
 */
export function createNoteStore(search = window.location.search): NoteStore {
  const params = new URLSearchParams(search)
  const local = createLocalStorageStore()
  if (params.get('store') === 'local') return local

  return createMockApiStore(local, {
    failureRate: Math.min(numberParam(params, 'failRate'), 1),
    failFirstSaves: Math.floor(numberParam(params, 'failSaves')),
  })
}
