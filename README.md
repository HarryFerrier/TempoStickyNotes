# Tempo Sticky Notes

This project is a desktop sticky-notes application built in React + TypeScript with Vite.

## Quick start

```bash
npm install
npm run dev -- --host
```

## Build

```bash
npm run build
```

## Working model

We are not treating this as one giant unreviewed build. Work is split into small ticket-sized slices and merged into main only when each chunk is complete and reviewed.

## Architecture principles

We are aiming for an elegant, easy-to-understand codebase. The guiding rule is simple code for complex problems, not complexity for the sake of it.

For each component, keep the structure together in a component folder:

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

If an `index.ts` export is genuinely useful, we can add it, but only when it improves clarity or developer ergonomics. Avoid unnecessary barrel files.

## Ticket flow

- One branch per ticket
- One PR per ticket
- Review before merge
- Merge to main only once satisfied

This keeps the main branch stable and makes it easier for reviewers to assess the work in plain chunks rather than a large, hard-to-read single commit.

## Project brief

This app follows the design handoff captured in the project instructions and the design tokens in `src/styles/tokens.css`.

## Tech stack

- React
- TypeScript
- Vite
- CSS / design tokens
- Local storage persistence as required by the ticket flow
