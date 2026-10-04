# Branching and review workflow

This project should follow a small-ticket workflow so code reviewers can assess each change in isolation.

## Branch naming

Use branches in this pattern:

- `feature/STICKY-001-foundation`
- `feature/STICKY-002-empty-board`
- `feature/STICKY-003-create-note`
- `feature/STICKY-004-move-resize`
- `feature/STICKY-005-trash-selection`
- `feature/STICKY-006-persistence`
- `feature/STICKY-007-tailwind-v4`
- `feature/STICKY-008-unit-testing`
- `feature/STICKY-009-playwright`
- `feature/STICKY-010-storybook`

## Local workflow

```bash
git checkout main
git pull --ff-only
git checkout -b feature/STICKY-001-foundation
# work, commit, verify
# open PR
# merge after review
```

## Merge policy

- Never push directly to main for iterative work.
- Keep each ticket focused.
- Merge to main only when the branch is complete and code review is satisfied.
- Prefer clean commit history and small, readable diffs.

## Review checklist

Before merging a ticket, confirm:

- The work matches the scope for that ticket
- The app still builds locally
- The UI matches the brief at the ticket level
- There are no obvious regressions in adjacent behavior
- The branch is ready for a reviewer to understand quickly

## Why this matters

The design brief is interactive and complex. Breaking the work into small tickets improves review quality, reduces merge conflict risk, and makes it easier to iterate without destabilising the whole app.
