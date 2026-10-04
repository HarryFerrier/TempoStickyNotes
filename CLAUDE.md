# Sticky Notes: front-end take-home for Tempo

This repository implements the sticky notes app described in the design handoff. The original brief is in the local PDF, but this file is the working spec and is the source of truth for implementation while the PDF remains local and ignored by Git.

Where this file and the brief differ, the brief wins.

## What the reviewers assess

- Architecture and design of the application
- Performance
- Code quality
- Accuracy of static typing
- Usability

Target effort is 3–4 hours, so prefer a small, well-typed core over breadth.

## Hard constraints from the brief

- TypeScript and React
- No stock components or ready-made solutions
- No drag-and-drop or resize libraries
- Desktop only, minimum viewport 1024 × 768
- Latest Chrome, Firefox, and Edge
- Build instructions must be in the README
- Comments only where helpful and in English
- Deliverable includes a 2–3 paragraph architecture description in English

## Scope

Required: build all four behaviors:

1. Create a note of a specified size at a specified position.
2. Resize a note by dragging.
3. Move a note by dragging.
4. Remove a note by dragging it over a predefined trash zone.

Bonus, in priority order:

1. Bring a note to the front when picked up.
2. Enter and edit note text.
3. Note colours (five).
4. Persist to local storage and restore on load.
5. Save through an asynchronous mock REST API.

Also in scope: light and dark mode with a toggle in the header.

## Stack

Suggested stack:

- Vite
- React
- TypeScript (strict)
- Tailwind CSS v4

Tailwind is a styling utility, not a component library, so it is allowed. If Tailwind is not used, the tokens CSS still needs to work as plain CSS variables.

## Design system

- src/styles/tokens.css is the single source of truth. Import it once from the app entry.
- src/styles/fonts.css declares the two self-hosted variable fonts in src/assets/fonts/.
- Colours, type and radii come from Tempo design tokens and should not be changed arbitrarily.
- Use semantic role utilities such as bg-board, text-fg, text-fg-meta, and shadow-rest instead of raw palette values.
- Dark mode is toggled by adding the dark class to the html element and persisting the user choice.
- Fonts: font-display for app name, note titles, and headings; font-body for all other text.
- Default radius is 4px with rounded-4; trash zone uses rounded-lg.
- Do not use Tempo's logo or wordmark.

## Layout

- Header: 60px tall, bg-header, 24px horizontal padding.
  - Left: note glyph and “Sticky Notes” in font-display at 18px.
  - Right: save status, New note button, and theme toggle.
- Board: fills the rest of the viewport, uses a 24px dot grid background, overflow hidden.
- Trash zone: fixed bottom-right, 220 × 120, 1.5px dashed border.

## Note

- Body background bg-note, text text-note-fg, radius 4px, shadow-rest.
- Top strip: 32px, bg-note-strip, cursor: grab.
- Body padding: 14px 16px, text 14px, line-height 1.4.
- Resize handle: 20 × 20 bottom-right corner, real button with aria-label.
- Colour is set with data-color="clarity | vision | ignition | success | paper" on the note root.
- Default size 240 × 180; minimum size 160 × 120.

## Interaction requirements

- Draw to create: pointer down on empty board, drag, release to create a note with the resulting rect.
- New note button: creates a default-size note at the centre of the visible board, offset on repeat presses.
- Move: drag the strip. Bring note to front on pointer down.
- Resize: drag the corner handle; clamp to minimum size.
- Delete: move a note into the trash zone; on release there, delete it.
- Edit text: click the body of a note to select and edit.
- Colour: swatches in the strip of the selected note.
- Empty board: show a centred hint with a draw-outline illustration and instructions.

## Save status

- “All changes saved”: success dot.
- “Saving…”: clarity dot.
- “Couldn't save. Retrying.”: ignition dot and ignition text.

## Engineering notes

- Use pointer events with setPointerCapture.
- Keep per-frame drag updates off the React render path where practical; transform during drag and commit on release.
- Model notes as typed records: id, rect, z-order, text, and colour.
- Keep persistence behind an interface so local storage and mock async API are interchangeable.
- Debounce saves.

## Open decisions

- Whether notes clamp to board edges or may sit outside.
- Window shrinking behaviour below note bounds.
- Whether to keep the New note button or rely on draw-to-create alone; current decision: keep both.

## Design reference

The design canvas includes four artboards: Board, Board (empty), Foundations, and Components. The design tokens and this file contain everything needed to build without the design file.

## Technologies

The project is scaffolded with:

- React
- TypeScript
- Vite
- CSS for styling and layout
- Browser local storage for persistence if needed
- Minimal dependencies and a lightweight architecture

## Repository policy

- Keep the PDF or design source local and ignored by Git.
- Keep implementation guidance in this file.
- If there is a conflict between the handoff and this file, prefer the actual design brief.
