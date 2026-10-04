import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SavedBoard } from '../../../models/note'
import { createMockApiStore } from './mockApiStore'
import type { NoteStore } from '../noteStore/noteStore'

const board: SavedBoard = { version: 1, notes: [], created: 0 }

function memoryServer() {
  let saved: SavedBoard | null = null
  const server: NoteStore = {
    load: async () => saved,
    save: async (next) => {
      saved = next
    },
  }
  return { server, saved: () => saved }
}

describe('mock API store', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('responds only after the simulated latency', async () => {
    const { server, saved } = memoryServer()
    const api = createMockApiStore(server, { latencyMs: [300, 300] })

    const request = api.save(board)
    await vi.advanceTimersByTimeAsync(299)
    expect(saved()).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    await request
    expect(saved()).toEqual(board)
  })

  it('sends a copy, as a request body would, never the app’s own objects', async () => {
    const { server, saved } = memoryServer()
    const api = createMockApiStore(server, { latencyMs: [0, 0] })
    const request = api.save(board)
    await vi.runAllTimersAsync()
    await request
    expect(saved()).toEqual(board)
    expect(saved()).not.toBe(board)
  })

  it('fails the first saves when asked, then succeeds', async () => {
    const { server } = memoryServer()
    const api = createMockApiStore(server, { latencyMs: [0, 0], failFirstSaves: 2 })

    for (const expected of ['rejected', 'rejected', 'fulfilled']) {
      const request = api.save(board)
      const settled = Promise.allSettled([request])
      await vi.runAllTimersAsync()
      expect((await settled)[0].status).toBe(expected)
    }
  })

  it('never fails a load, even when every save fails', async () => {
    const { server } = memoryServer()
    const api = createMockApiStore(server, { latencyMs: [0, 0], failureRate: 1 })
    const request = api.load()
    await vi.runAllTimersAsync()
    await expect(request).resolves.toBeNull()
  })
})
