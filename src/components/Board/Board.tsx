import { EmptyBoardHint } from '../EmptyBoardHint/EmptyBoardHint'
import { TrashZone } from '../TrashZone/TrashZone'

export function Board() {
  return (
    <main aria-label="Board" className="board-grid relative min-w-0 flex-1 cursor-crosshair overflow-hidden">
      <EmptyBoardHint />
      <TrashZone />
    </main>
  )
}
