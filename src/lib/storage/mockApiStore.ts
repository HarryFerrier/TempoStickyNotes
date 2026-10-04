import type { NoteStore } from './noteStore'

type MockApiOptions = {
  /** Response time range in milliseconds, picked at random per request. */
  latencyMs?: [number, number]
  /** Chance from 0 to 1 that a save fails. */
  failureRate?: number
  /** Fail this many saves first, then succeed. Deterministic, for demos and tests. */
  failFirstSaves?: number
}

/**
 * A stand-in for a REST API (GET and PUT /api/board) with network-like latency
 * and failures on demand. The "server" keeps its data in the given store.
 * Only saves fail: a failed load followed by a save would wipe the saved board.
 */
export function createMockApiStore(
  server: NoteStore,
  { latencyMs = [250, 600], failureRate = 0, failFirstSaves = 0 }: MockApiOptions = {},
): NoteStore {
  let failuresLeft = failFirstSaves

  function respond<T>(handle: () => Promise<T>, canFail: boolean) {
    const [min, max] = latencyMs
    const delay = min + Math.random() * (max - min)

    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        const fail = canFail && (failuresLeft > 0 || Math.random() < failureRate)
        if (fail) {
          failuresLeft = Math.max(0, failuresLeft - 1)
          reject(new Error('503 Service Unavailable (mock API)'))
        } else {
          handle().then(resolve, reject)
        }
      }, delay)
    })
  }

  return {
    load: () => respond(() => server.load(), false),
    // Serialised as a real request body would be, so the server never shares objects with the app.
    save: (board) => respond(() => server.save(JSON.parse(JSON.stringify(board))), true),
  }
}
