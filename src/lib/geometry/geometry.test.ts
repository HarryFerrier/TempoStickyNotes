import { describe, expect, it } from 'vitest'
import { DEFAULT_NOTE_SIZE, MIN_NOTE_SIZE } from '../../models/note'
import { clampRectToBounds, drawnRect, meetsMinimumSize, movedRect, newNoteRect, resizedRect, sameRect } from './geometry'

const board = { width: 1000, height: 700 }

describe('drawnRect', () => {
  it('builds the rect for a drag down and right', () => {
    expect(drawnRect({ x: 100, y: 50 }, { x: 400, y: 270 }, board)).toEqual({ x: 100, y: 50, width: 300, height: 220 })
  })

  it('builds the rect for a drag up and left, from the far corner', () => {
    expect(drawnRect({ x: 400, y: 300 }, { x: 150, y: 100 }, board)).toEqual({ x: 150, y: 100, width: 250, height: 200 })
  })

  it('stops at the board edges', () => {
    expect(drawnRect({ x: 900, y: 600 }, { x: 1400, y: 900 }, board)).toEqual({ x: 900, y: 600, width: 100, height: 100 })
  })

  it('rounds both edges so the rect never pokes past the board', () => {
    const rect = drawnRect({ x: 100.6, y: 10.4 }, { x: 1000, y: 700 }, board)
    expect(rect.x + rect.width).toBe(board.width)
    expect(rect.y + rect.height).toBe(board.height)
  })
})

describe('meetsMinimumSize', () => {
  it('needs both dimensions at the minimum', () => {
    expect(meetsMinimumSize(MIN_NOTE_SIZE)).toBe(true)
    expect(meetsMinimumSize({ width: MIN_NOTE_SIZE.width - 1, height: 500 })).toBe(false)
    expect(meetsMinimumSize({ width: 500, height: MIN_NOTE_SIZE.height - 1 })).toBe(false)
  })
})

describe('clampRectToBounds', () => {
  it('moves a rect fully inside the bounds without resizing it', () => {
    expect(clampRectToBounds({ x: 900, y: -40, width: 240, height: 180 }, board)).toEqual({
      x: 760,
      y: 0,
      width: 240,
      height: 180,
    })
  })

  it('shrinks a rect that is larger than the bounds', () => {
    expect(clampRectToBounds({ x: 0, y: 0, width: 1200, height: 900 }, board)).toEqual({ x: 0, y: 0, ...board })
  })
})

describe('movedRect', () => {
  const start = { x: 100, y: 100, width: 240, height: 180 }

  it('moves by the delta', () => {
    expect(movedRect(start, { x: 50, y: -30 }, board)).toEqual({ ...start, x: 150, y: 70 })
  })

  it('keeps the note on the board', () => {
    expect(movedRect(start, { x: 5000, y: 5000 }, board)).toEqual({ ...start, x: 760, y: 520 })
    expect(movedRect(start, { x: -5000, y: -5000 }, board)).toEqual({ ...start, x: 0, y: 0 })
  })
})

describe('resizedRect', () => {
  const start = { x: 100, y: 100, width: 240, height: 180 }

  it('grows from the bottom-right corner, keeping the position', () => {
    expect(resizedRect(start, { x: 60, y: 40 }, board)).toEqual({ ...start, width: 300, height: 220 })
  })

  it('never goes below the minimum note size', () => {
    expect(resizedRect(start, { x: -1000, y: -1000 }, board)).toEqual({ ...start, ...MIN_NOTE_SIZE })
  })

  it('stops at the board edges', () => {
    expect(resizedRect(start, { x: 5000, y: 5000 }, board)).toEqual({ ...start, width: 900, height: 600 })
  })

  it('keeps the minimum size even when the note sits too close to the edge', () => {
    const nearEdge = { x: 950, y: 650, width: 160, height: 120 }
    expect(resizedRect(nearEdge, { x: -50, y: -50 }, board)).toEqual(nearEdge)
  })
})

describe('newNoteRect', () => {
  it('centres a default-size note on the first press', () => {
    expect(newNoteRect(board, 0)).toEqual({ x: 380, y: 260, ...DEFAULT_NOTE_SIZE })
  })

  it('steps 24px down and right per press, then starts again after five', () => {
    expect(newNoteRect(board, 1)).toMatchObject({ x: 404, y: 284 })
    expect(newNoteRect(board, 4)).toMatchObject({ x: 476, y: 356 })
    expect(newNoteRect(board, 5)).toEqual(newNoteRect(board, 0))
  })
})

describe('sameRect', () => {
  it('compares every field', () => {
    const rect = { x: 1, y: 2, width: 3, height: 4 }
    expect(sameRect(rect, { ...rect })).toBe(true)
    expect(sameRect(rect, { ...rect, height: 5 })).toBe(false)
  })
})
