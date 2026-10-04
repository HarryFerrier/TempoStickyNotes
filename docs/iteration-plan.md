# Iteration plan for Tempo Sticky Notes

This repository should be developed in small, reviewable slices rather than a single large feature branch. Each ticket should map to a focused bundle of work and be merged to main only after the reviewer is satisfied.

## Working model

- Work in a dedicated feature branch per ticket.
- Keep each branch scoped to one deliverable.
- Submit a PR for review before merging.
- Only merge to main once the implementation passes local checks and reviewer feedback.
- Keep the main branch in a releasable state.

## General architecture rules

We are building an elegant, easy-to-understand codebase. The design should favour simplicity over cleverness.

- Junior developers write simple code for simple problems.
- Mid-level developers sometimes add unnecessary complexity to simple problems.
- Senior developers write simple code for complex problems.

This means we should avoid over-engineering, abstraction for abstraction's sake, and unnecessary indirection.

### Component structure rule

For each reusable UI component, keep the files together in a component folder. The default structure is:

- component file
- component storybook
- component tests

Example:

```text
src/components/NoteCard/
  NoteCard.tsx
  NoteCard.stories.tsx
  NoteCard.test.tsx
```

If an index file is genuinely useful for exporting and importing, we may add it, but only when it improves clarity or ergonomics. Do not add barrel files just because they exist in other codebases.

Prefer the most direct, readable solution. Keep state local unless a shared state boundary is necessary. Keep naming explicit. Keep each component responsible for one clear concern.

## Recommended Jira-style ticket breakdown

### STICKY-001 — Foundation and design tokens

Goal: set up the visual system required by the design spec.

Scope:
- Import the design tokens from `src/styles/tokens.css`
- Import and configure the font files from `src/styles/fonts.css`
- Add light/dark theme foundations
- Establish board, header, and global layout primitives

Definition of done:
- App renders with correct base colours, spacing, and typography
- Theme toggle state is wired and persists in the browser
- No raw design violations against the token system

### STICKY-002 — App shell and empty board

Goal: implement the header, empty board canvas, and trash zone shell.

Scope:
- Header with app title, save status, New note button, and theme toggle
- Board background grid and empty state text
- Trash zone positioning and visual states

Definition of done:
- Layout matches the handoff at desktop sizes
- Empty state content is visible on a blank board
- Board behaves correctly at 1024×768 and above

### STICKY-003 — Note model and create note flow

Goal: introduce typed note data and the draw-to-create interaction.

Scope:
- Typed `Note` model with rect, colour, text, and z-order
- Draw interaction on empty board
- New note button creates default-size note at offset positions
- Show optional size/position badge while drawing

Definition of done:
- User can create a note by dragging on empty space
- Invalid small drags are ignored or clamped consistently
- Note objects are created with correct dimensions and placement

### STICKY-004 — Note movement and resizing

Goal: implement the canvas interaction logic for notes.

Scope:
- Move by dragging the note strip
- Resize via bottom-right handle
- Bring note to front on pointer down
- Keep the note within usable board constraints

Definition of done:
- Notes move smoothly and consistently
- Resize clamps to minimum dimensions
- Selected note sits above lower z-order notes

### STICKY-005 — Delete, selection, and note styling

Goal: complete interactivity for the note lifecycle and visual states.

Scope:
- Select and edit note text
- Colour swatches in the note strip
- Trash-zone armed state while dragging over it
- Delete note on release inside trash zone
- Dragging/selected visual states

Definition of done:
- Notes can be deleted through the trash interaction
- Selected state and swatches appear correctly
- Visual states match the design spec

### STICKY-006 — Save flow, persistence, and polish

Goal: finish the product quality layer.

Scope:
- Debounced save status messages
- Local storage persistence and restore
- Optional mock async save layer
- Final polish, accessibility, and small bug fixes

Definition of done:
- Notes persist correctly across refreshes
- Save status reflects real app state
- Final QA review passes for the handoff requirements

### STICKY-007 — TailwindCSS v4 foundation

Goal: set up the design-token-first styling system in a modern Tailwind v4 workflow.

Scope:
- Install and configure Tailwind CSS v4
- Convert the design tokens into theme and semantic utilities
- Ensure the board, header, and note components use the token system
- Confirm the app supports dark mode via the `dark` class

Definition of done:
- Tailwind v4 is installed and working
- Design system utilities are usable in app components
- Tokens are delivering the required visual design without ad-hoc custom CSS

### STICKY-008 — Unit testing baseline

Goal: ensure the core note logic and utility functions are testable and covered.

Scope:
- Set up a unit testing runner for the app
- Cover core note helpers and state transformations
- Add a small set of deterministic tests around sizing, clamping, and persistence logic

Definition of done:
- Unit tests run locally and pass reliably
- Core logic is covered without testing implementation details
- Reviewers can see confidence in the model logic

### STICKY-009 — Playwright browser coverage

Goal: add browser-level confidence for the critical interaction flows.

Scope:
- Install Playwright
- Add smoke tests for note creation, dragging, resizing, and deletion
- Cover theme toggling and empty-state conditions

Definition of done:
- Browser tests are runnable in CI/local dev
- Core user flows are covered end-to-end
- Regression risk is reduced for the interactive high-value paths

### STICKY-010 — Storybook component library

Goal: provide a reviewable, isolated component catalogue for the app UI.

Scope:
- Install and configure Storybook
- Build stories for the shell, note card, controls, and empty board states
- Document interactions and state variations for design review

Definition of done:
- Storybook runs locally
- Core components are documented and inspectable
- Reviewers can examine UI states without running the full app

## Merge strategy

1. Create a branch from main named like `feature/STICKY-001-foundation`
2. Implement the scoped work and verify locally with build checks
3. Open a PR for review
4. Merge into main only after feedback is addressed
5. Repeat for the next ticket

This keeps main stable and makes review much more manageable than one large commit.
