import { beforeEach, describe, expect, it } from 'vitest'
import type { SavedBoard } from '../../../models/note'
import { createLocalStorageStore } from './localStorageStore'

// A minimal in-memory stand-in, so these tests run without a browser.
function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  }
}

const board: SavedBoard = {
  version: 1,
  created: 1,
  notes: [{ id: 'a', rect: { x: 1, y: 2, width: 240, height: 180 }, z: 1, title: 'Hi', text: 'There', color: 'paper' }],
}

describe('local storage store', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage()
  })

  it('loads null when nothing has been saved', async () => {
    await expect(createLocalStorageStore('test').load()).resolves.toBeNull()
  })

  it('round-trips a saved board', async () => {
    const store = createLocalStorageStore('test')
    await store.save(board)
    await expect(store.load()).resolves.toEqual(board)
  })

  it('treats unreadable data as nothing saved', async () => {
    localStorage.setItem('test', '{not json')
    await expect(createLocalStorageStore('test').load()).resolves.toBeNull()
  })
})
