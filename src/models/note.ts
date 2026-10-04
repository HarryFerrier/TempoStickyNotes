export const NOTE_COLORS = ['clarity', 'vision', 'ignition', 'success', 'paper'] as const

export type NoteColor = (typeof NOTE_COLORS)[number]

export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

/** Position and size in board pixels, measured from the board's top-left corner. */
export type Rect = Point & Size

export type Note = {
  id: string
  rect: Rect
  /** Stacking order: a higher z is drawn in front. */
  z: number
  title: string
  text: string
  color: NoteColor
}

export const DEFAULT_NOTE_SIZE: Size = { width: 240, height: 180 }
export const MIN_NOTE_SIZE: Size = { width: 160, height: 120 }
