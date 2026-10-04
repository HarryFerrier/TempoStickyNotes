import { describe, expect, it } from 'vitest'
import { parseSavedBoard } from './noteStore'

const note = { id: 'a', rect: { x: 0, y: 0, width: 240, height: 180 }, z: 1, title: 'T', text: '', color: 'vision' }

describe('parseSavedBoard', () => {
  it('accepts a valid saved board', () => {
    expect(parseSavedBoard({ version: 1, notes: [note], created: 3 })).toEqual({ version: 1, notes: [note], created: 3 })
  })

  it.each([null, 'text', 42, [], { version: 2, notes: [] }, { version: 1, notes: 'nope' }])(
    'rejects data that is not a saved board: %j',
    (value) => {
      expect(parseSavedBoard(value)).toBeNull()
    },
  )

  it('drops notes that do not match the model and keeps the rest', () => {
    const broken = [
      { ...note, id: 1 },
      { ...note, color: 'pink' },
      { ...note, rect: { x: 'left', y: 0, width: 1, height: 1 } },
      { ...note, z: Number.NaN },
      { ...note, title: undefined },
    ]
    expect(parseSavedBoard({ version: 1, notes: [...broken, note], created: 6 })?.notes).toEqual([note])
  })

  it('falls back to the note count when the colour counter is missing', () => {
    expect(parseSavedBoard({ version: 1, notes: [note, { ...note, id: 'b' }] })?.created).toBe(2)
  })
})
