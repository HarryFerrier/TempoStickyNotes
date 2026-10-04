import { useEffect, useRef, type PointerEvent } from 'react'
import { drawnRect, meetsMinimumSize } from '../lib/geometry'
import { MIN_NOTE_SIZE, type Point, type Rect } from '../models/note'

/** Movement below this many pixels is treated as a click, not a draw. */
const DRAG_THRESHOLD = 4
const READOUT_GAP = 8

type Gesture = {
  pointerId: number
  start: Point
  rect: Rect | null
}

function pointInBoard(event: PointerEvent<HTMLElement>): Point {
  const bounds = event.currentTarget.getBoundingClientRect()
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
}

/**
 * Draw-to-create on the empty board. The outline and its size readout are
 * updated directly in the DOM while the pointer moves, so a drag never
 * re-renders the board; React only hears about the finished rect.
 */
export function useDrawToCreate(onCreate: (rect: Rect) => void) {
  const draftRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)

  function paint(rect: Rect, board: HTMLElement) {
    const draft = draftRef.current
    const readout = readoutRef.current
    if (!draft || !readout) return

    draft.hidden = false
    board.dataset.drawing = ''
    draft.style.transform = `translate(${rect.x}px, ${rect.y}px)`
    draft.style.width = `${rect.width}px`
    draft.style.height = `${rect.height}px`

    // Below the minimum size the outline is dimmed and releasing creates nothing.
    if (meetsMinimumSize(rect)) {
      delete draft.dataset.tooSmall
      readout.textContent = `${rect.width} × ${rect.height} at ${rect.x}, ${rect.y}`
    } else {
      draft.dataset.tooSmall = ''
      readout.textContent = `${rect.width} × ${rect.height} · min ${MIN_NOTE_SIZE.width} × ${MIN_NOTE_SIZE.height}`
    }

    // The readout sits outside the outline's bottom-right corner, tucked inside it near the board edges.
    const fitsRight = rect.x + rect.width + readout.offsetWidth + READOUT_GAP <= board.clientWidth
    const fitsBelow = rect.y + rect.height + readout.offsetHeight + READOUT_GAP <= board.clientHeight
    readout.style.left = `${fitsRight ? rect.width + READOUT_GAP : rect.width - readout.offsetWidth - READOUT_GAP}px`
    readout.style.top = `${fitsBelow ? rect.height + READOUT_GAP : rect.height - readout.offsetHeight - READOUT_GAP}px`
  }

  function reset() {
    gesture.current = null
    if (draftRef.current) draftRef.current.hidden = true
    delete draftRef.current?.parentElement?.dataset.drawing
  }

  // Escape abandons a draw in progress.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && gesture.current) reset()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return {
    draftRef,
    readoutRef,
    handlers: {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        // Only the board itself starts a draw, not notes or the trash zone on top of it.
        if (event.button !== 0 || event.target !== event.currentTarget) return
        event.currentTarget.setPointerCapture(event.pointerId)
        gesture.current = { pointerId: event.pointerId, start: pointInBoard(event), rect: null }
      },

      onPointerMove(event: PointerEvent<HTMLElement>) {
        const current = gesture.current
        if (!current || current.pointerId !== event.pointerId) return

        const point = pointInBoard(event)
        const moved = Math.hypot(point.x - current.start.x, point.y - current.start.y)
        if (!current.rect && moved < DRAG_THRESHOLD) return

        const board = event.currentTarget
        current.rect = drawnRect(current.start, point, { width: board.clientWidth, height: board.clientHeight })
        paint(current.rect, board)
      },

      onPointerUp(event: PointerEvent<HTMLElement>) {
        const current = gesture.current
        if (!current || current.pointerId !== event.pointerId) return

        reset()
        if (current.rect && meetsMinimumSize(current.rect)) onCreate(current.rect)
      },

      onPointerCancel: reset,
      onLostPointerCapture: reset,
    },
  }
}
