import { NOTE_COLOR_LABELS, NOTE_COLORS, type NoteColor } from '../../models/note'

type ColourSwatchesProps = {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

export function ColourSwatches({ value, onChange }: ColourSwatchesProps) {
  return (
    <div role="group" aria-label="Note colour" className="flex items-center gap-1.5">
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          data-color={color}
          aria-label={NOTE_COLOR_LABELS[color]}
          aria-pressed={color === value}
          onClick={() => onChange(color)}
          className="size-3.5 rounded-full border border-swatch-line bg-note aria-pressed:outline-[1.5px] aria-pressed:outline-offset-1 aria-pressed:outline-note-fg aria-pressed:outline-solid"
        />
      ))}
    </div>
  )
}
