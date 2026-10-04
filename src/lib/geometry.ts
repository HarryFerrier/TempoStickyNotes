import { DEFAULT_NOTE_SIZE, MIN_NOTE_SIZE, type Point, type Rect, type Size } from '../models/note'

const NEW_NOTE_OFFSET = 24
const NEW_NOTE_OFFSET_STEPS = 5

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Moves a rect fully inside the bounds and rounds it to whole pixels. */
export function clampRectToBounds(rect: Rect, bounds: Size): Rect {
  const width = Math.min(rect.width, bounds.width)
  const height = Math.min(rect.height, bounds.height)

  return {
    x: Math.round(clamp(rect.x, 0, bounds.width - width)),
    y: Math.round(clamp(rect.y, 0, bounds.height - height)),
    width: Math.round(width),
    height: Math.round(height),
  }
}

/** The rect for a drag from `start` to `current`, in any direction, stopped at the board edges. */
export function drawnRect(start: Point, current: Point, bounds: Size): Rect {
  const end = { x: clamp(current.x, 0, bounds.width), y: clamp(current.y, 0, bounds.height) }
  // Rounding both edges, not the origin and size, keeps the rect inside the bounds.
  const left = Math.round(Math.min(start.x, end.x))
  const top = Math.round(Math.min(start.y, end.y))

  return {
    x: left,
    y: top,
    width: Math.round(Math.max(start.x, end.x)) - left,
    height: Math.round(Math.max(start.y, end.y)) - top,
  }
}

export function meetsMinimumSize(size: Size) {
  return size.width >= MIN_NOTE_SIZE.width && size.height >= MIN_NOTE_SIZE.height
}

/** A default-size note centred on the board, stepped down and right on repeat presses. */
export function newNoteRect(bounds: Size, press: number): Rect {
  const offset = (press % NEW_NOTE_OFFSET_STEPS) * NEW_NOTE_OFFSET

  return clampRectToBounds(
    {
      x: (bounds.width - DEFAULT_NOTE_SIZE.width) / 2 + offset,
      y: (bounds.height - DEFAULT_NOTE_SIZE.height) / 2 + offset,
      ...DEFAULT_NOTE_SIZE,
    },
    bounds,
  )
}
