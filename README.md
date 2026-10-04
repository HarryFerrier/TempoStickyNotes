# Tempo Sticky Notes

A sticky-notes web app for desktop browsers, built with React, TypeScript and Vite.

## Requirements

- Node.js 22.12 or later (Node 20 works from 20.19, but reached end of life in April 2026)
- The latest Chrome, Firefox or Edge on desktop, with a viewport of at least 1024 × 768

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints, which is http://localhost:5173 by default.

## Saving

Notes save automatically through a mock REST API, which keeps them in the browser's local storage, so they're still there after a reload. The header shows when changes are saving, saved, or failing and being retried.

To see the other save states, add one of these to the URL:

| Option | Effect |
| --- | --- |
| `?failSaves=2` | The first two saves fail, then saving recovers |
| `?failRate=0.5` | Half of all saves fail at random |
| `?store=local` | Saves straight to local storage, without the mock API |

## Build

```bash
npm run build
npm run preview
```

`npm run build` type-checks the project and writes the production build to `dist/`. `npm run preview` serves that build at http://localhost:4173 by default.

## Test

```bash
npm test
```

Runs the unit and component tests with Vitest: the notes reducer, the geometry helpers, saved-data validation and the stores, and the components' behaviour with React Testing Library (editing, selection, keyboard rules, the notes panel and the colour swatches).

## End-to-end tests

```bash
npm run e2e
```

Builds the app, serves the production build, and runs Playwright tests in your installed Chrome: drawing and editing a note and finding it after a reload, moving and resizing, and deleting on the trash zone. Without Chrome installed, run `npx playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts`.

## Lint

```bash
npm run lint
```

## Architecture

The app is React and TypeScript, built with Vite and styled with Tailwind CSS from the Tempo design tokens. Notes are typed records (id, position and size, stacking order, title, text and colour). One pure reducer owns the notes and the selection, and every change is a typed action, so the compiler rejects any action the reducer doesn't handle. Only the reducer's dispatch is shared through context. Note data is passed down as props, which lets each memoised note re-render only when its own data changes.

Drawing, moving and resizing use pointer events with pointer capture. During a drag, the outline or note is updated directly in the DOM and the change is committed to state once, on release, so a drag never re-renders the board. Small pure functions handle the geometry: the minimum size, keeping notes on the board, and placing new notes. Notes also work from the keyboard: arrow keys move or resize them, Delete removes them and Escape cancels a gesture. No drag, resize or component libraries are used.

Saving sits behind a small async store interface with two implementations: local storage, and a mock REST API with realistic latency and optional failures. Autosave debounces edits, runs one save at a time with the latest notes so saves can't land out of order, and retries failures with backoff while the header shows the save status. Saved data is validated before it's used, and selection is never saved.

The same description is in the app, behind the ⓘ button in the header.

## Tech stack

- React 19
- TypeScript 6, with strict type checking
- Vite 8
- Tailwind CSS 4
- Oxlint 1
- Vitest 5
- Playwright 1
