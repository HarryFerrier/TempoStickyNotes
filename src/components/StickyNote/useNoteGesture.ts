import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { movedRect, resizedRect, sameRect } from '../../lib/geometry'
import type { Note, Point, Rect, Size } from '../../models/note'

type GestureKind = 'move' | 'resize'

type Gesture = {
  kind: GestureKind
  pointerId: number
  start: Point
  startRect: Rect
  rect: Rect
  stopListening: () => void
}

const KEYBOARD_RESIZE_STEP = 10

const KEYBOARD_RESIZE: Record<string, Point> = {
  ArrowRight: { x: KEYBOARD_RESIZE_STEP, y: 0 },
  ArrowLeft: { x: -KEYBOARD_RESIZE_STEP, y: 0 },
  ArrowDown: { x: 0, y: KEYBOARD_RESIZE_STEP },
  ArrowUp: { x: 0, y: -KEYBOARD_RESIZE_STEP },
}

/**
 * Moving (by the strip) and resizing (by the corner handle). While the pointer
 * moves, the note element is updated directly; the new rect is committed to
 * state once, on release. Escape puts the note back where it started.
 */
export function useNoteGesture(note: Note, onRectChange: (id: string, rect: Rect) => void) {
  const noteRef = useRef<HTMLElement>(null)
  const gesture = useRef<Gesture | null>(null)

  // Notes are positioned in a layer that covers the whole board.
  function boardSize(): Size | null {
    const layer = noteRef.current?.parentElement
    return layer ? { width: layer.clientWidth, height: layer.clientHeight } : null
  }

  function paint(rect: Rect) {
    const element = noteRef.current
    if (!element) return
    element.style.transform = `translate(${rect.x}px, ${rect.y}px)`
    element.style.width = `${rect.width}px`
    element.style.height = `${rect.height}px`
  }

  function end() {
    gesture.current?.stopListening()
    gesture.current = null
    delete noteRef.current?.dataset.gesture
  }

  function cancel() {
    if (!gesture.current) return
    paint(gesture.current.startRect)
    end()
  }

  function start(kind: GestureKind, event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || !noteRef.current) return
    // Stops text selection while dragging.
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    const onKeyDown = (keyEvent: globalThis.KeyboardEvent) => {
      if (keyEvent.key === 'Escape') cancel()
    }
    window.addEventListener('keydown', onKeyDown)

    gesture.current = {
      kind,
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      startRect: note.rect,
      rect: note.rect,
      stopListening: () => window.removeEventListener('keydown', onKeyDown),
    }
    noteRef.current.dataset.gesture = kind
  }

  const gestureHandlers = {
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const current = gesture.current
      const bounds = boardSize()
      if (!current || current.pointerId !== event.pointerId || !bounds) return

      const delta = { x: event.clientX - current.start.x, y: event.clientY - current.start.y }
      current.rect =
        current.kind === 'move'
          ? movedRect(current.startRect, delta, bounds)
          : resizedRect(current.startRect, delta, bounds)
      paint(current.rect)
    },

    onPointerUp(event: PointerEvent<HTMLElement>) {
      const current = gesture.current
      if (!current || current.pointerId !== event.pointerId) return

      end()
      if (!sameRect(current.rect, current.startRect)) onRectChange(note.id, current.rect)
    },

    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  }

  return {
    noteRef,
    gestureHandlers,
    startMove: (event: PointerEvent<HTMLElement>) => start('move', event),
    startResize: (event: PointerEvent<HTMLElement>) => start('resize', event),

    onResizeKeyDown(event: KeyboardEvent<HTMLElement>) {
      const delta = KEYBOARD_RESIZE[event.key]
      const bounds = boardSize()
      if (!delta || !bounds) return

      event.preventDefault()
      const rect = resizedRect(note.rect, delta, bounds)
      if (!sameRect(rect, note.rect)) onRectChange(note.id, rect)
    },
  }
}
