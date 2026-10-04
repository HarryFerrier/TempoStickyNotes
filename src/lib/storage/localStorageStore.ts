import type { NoteStore } from './noteStore'
import { parseSavedBoard } from './noteStore'

const STORAGE_KEY = 'tempo-sticky-notes'

export function createLocalStorageStore(key = STORAGE_KEY): NoteStore {
  return {
    async load() {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      try {
        return parseSavedBoard(JSON.parse(raw))
      } catch {
        // Unreadable data starts an empty board; the next save replaces it.
        return null
      }
    },

    async save(board) {
      localStorage.setItem(key, JSON.stringify(board))
    },
  }
}
