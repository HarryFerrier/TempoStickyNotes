import { useRef, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { movedRect, resizedRect, sameRect } from '../lib/geometry/geometry'
import type { Note, Point, Rect, Size } from '../models/note'

type GestureKind = 'move' | 'resize'

type Gesture = {
  kind: GestureKind
  pointerId: number
  start: Point
  startRect: Rect
  rect: Rect
  overTrash: boolean
  stopListening: () => void
}

type NoteGestureOptions = {
  trashRef: RefObject<HTMLElement | null>
  onRectChange: (id: string, rect: Rect) => void
  onDelete: (id: string) => void
}

const KEYBOARD_STEP = 10

/** Arrow keys move a focused note, or resize it from a focused handle, by this much. */
const ARROW_DELTAS: Record<string, Point> = {
  ArrowRight: { x: KEYBOARD_STEP, y: 0 },
  ArrowLeft: { x: -KEYBOARD_STEP, y: 0 },
  ArrowDown: { x: 0, y: KEYBOARD_STEP },
  ArrowUp: { x: 0, y: -KEYBOARD_STEP },
}

function isPointerOver(element: HTMLElement | null, event: PointerEvent<HTMLElement>) {
  if (!element) return false
  const bounds = element.getBoundingClientRect()
  return (
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom
  )
}

/**
 * Moving (by the strip) and resizing (by the corner handle). While the pointer
 * moves, the note element is updated directly; the new rect is committed to
 * state once, on release. Releasing a move with the pointer over the trash zone
 * deletes the note instead. Escape puts the note back where it started.
 */
export function useNoteGesture(note: Note, { trashRef, onRectChange, onDelete }: NoteGestureOptions) {
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

  function setOverTrash(current: Gesture, overTrash: boolean) {
    if (current.overTrash === overTrash) return
    current.overTrash = overTrash
    const trash = trashRef.current
    const element = noteRef.current
    if (overTrash) {
      if (trash) trash.dataset.armed = ''
      if (element) element.dataset.overTrash = ''
    } else {
      delete trash?.dataset.armed
      delete element?.dataset.overTrash
    }
  }

  function end() {
    const current = gesture.current
    if (!current) return
    setOverTrash(current, false)
    current.stopListening()
    gesture.current = null
    delete noteRef.current?.dataset.gesture
  }

  function cancel() {
    if (!gesture.current) return
    paint(gesture.current.startRect)
    end()
  }

  function start(kind: GestureKind, event: PointerEvent<HTMLElement>) {
    // Buttons inside the strip, like the colour swatches, keep their own clicks.
    const pressedButton = kind === 'move' && (event.target as HTMLElement).closest('button')
    if (event.button !== 0 || !noteRef.current || pressedButton) return
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
      overTrash: false,
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
      if (current.kind === 'move') setOverTrash(current, isPointerOver(trashRef.current, event))
    },

    onPointerUp(event: PointerEvent<HTMLElement>) {
      const current = gesture.current
      if (!current || current.pointerId !== event.pointerId) return

      const deleting = current.overTrash
      end()
      if (deleting) onDelete(note.id)
      else if (!sameRect(current.rect, current.startRect)) onRectChange(note.id, current.rect)
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
      const delta = ARROW_DELTAS[event.key]
      const bounds = boardSize()
      if (!delta || !bounds) return

      event.preventDefault()
      const rect = resizedRect(note.rect, delta, bounds)
      if (!sameRect(rect, note.rect)) onRectChange(note.id, rect)
    },

    /** Keys on the focused note itself. Keys typed in its title or text are left alone. */
    onNoteKeyDown(event: KeyboardEvent<HTMLElement>) {
      if (event.target !== event.currentTarget) return

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        onDelete(note.id)
        return
      }

      const delta = ARROW_DELTAS[event.key]
      const bounds = boardSize()
      if (!delta || !bounds) return

      event.preventDefault()
      const rect = movedRect(note.rect, delta, bounds)
      if (!sameRect(rect, note.rect)) onRectChange(note.id, rect)
    },
  }
}
