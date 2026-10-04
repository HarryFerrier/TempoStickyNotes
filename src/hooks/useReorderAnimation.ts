import { useLayoutEffect, useRef } from 'react'

const DURATION_MS = 220
const EASE_SETTLE = 'cubic-bezier(0.23, 1, 0.32, 1)'

/**
 * Slides list rows from their old position to their new one when the order
 * changes (the FLIP technique, using the Web Animations API). Skipped when the
 * user prefers reduced motion. Pass the keys in display order.
 */
export function useReorderAnimation(keys: string[]) {
  const rows = useRef(new Map<string, HTMLElement>())
  const previousTops = useRef(new Map<string, number>())
  const order = keys.join(',')

  useLayoutEffect(() => {
    const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches
    const tops = new Map<string, number>()

    for (const [key, row] of rows.current) {
      const top = row.offsetTop
      const previousTop = previousTops.current.get(key)
      tops.set(key, top)

      if (animate && previousTop !== undefined && previousTop !== top) {
        row.animate([{ transform: `translateY(${previousTop - top}px)` }, { transform: 'translateY(0)' }], {
          duration: DURATION_MS,
          easing: EASE_SETTLE,
        })
      }
    }

    previousTops.current = tops
  }, [order])

  /** Ref callback for the row with this key. */
  return (key: string) => (row: HTMLElement | null) => {
    if (!row) return
    rows.current.set(key, row)
    return () => {
      rows.current.delete(key)
    }
  }
}
