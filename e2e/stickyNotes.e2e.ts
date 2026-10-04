import { expect, test, type Locator, type Page } from '@playwright/test'

// Every test gets a fresh browser context, so local storage starts empty.

async function box(locator: Locator) {
  const bounds = await locator.boundingBox()
  if (!bounds) throw new Error('Element is not visible')
  return bounds
}

/** Drags with the real mouse in small steps, like a person would. */
async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps: 12 })
  await page.mouse.up()
}

async function drawNote(page: Page, x: number, y: number, width: number, height: number) {
  const board = await box(page.getByRole('main', { name: 'Board' }))
  await drag(page, { x: board.x + x, y: board.y + y }, { x: board.x + x + width, y: board.y + y + height })
}

const saveStatus = (page: Page) => page.getByRole('banner').getByRole('status')
const notes = (page: Page) => page.getByRole('main', { name: 'Board' }).getByRole('article')

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Drag anywhere to draw a note')).toBeVisible()
})

test('draw a note, write in it, and find it again after a reload', async ({ page }) => {
  await drawNote(page, 120, 100, 300, 200)
  await expect(notes(page)).toHaveCount(1)

  // A new note starts selected with the cursor in its title.
  await page.keyboard.type('Groceries')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Milk and eggs')
  await page.getByRole('button', { name: 'Green' }).click()

  await expect(saveStatus(page)).toHaveText('All changes saved')
  const before = await box(notes(page).first())
  expect(Math.round(before.width)).toBe(300)
  expect(Math.round(before.height)).toBe(200)

  await page.reload()
  const note = page.getByRole('article', { name: 'Groceries' })
  await expect(note).toBeVisible()
  await expect(note.getByLabel('Text')).toHaveValue('Milk and eggs')
  await expect(note).toHaveAttribute('data-color', 'success')
  expect(await box(note)).toEqual(before)
})

test('drawing across notes never selects their text or keeps a field focused', async ({ page }) => {
  await drawNote(page, 200, 120, 300, 200)
  await page.keyboard.type('Some words to select')
  await page.keyboard.press('Enter')
  await page.keyboard.type('And some more words here')

  // Start on empty board and drag right across the note. The check happens mid-drag:
  // on release the new note's title takes focus, which would hide a selection.
  const start = await box(page.getByRole('main', { name: 'Board' }))
  await page.mouse.move(start.x + 60, start.y + 180)
  await page.mouse.down()
  await page.mouse.move(start.x + 660, start.y + 340, { steps: 12 })
  // toString() leaves out form fields, so check the selection is empty instead.
  expect(await page.evaluate('window.getSelection().isCollapsed')).toBe(true)
  await page.mouse.up()
  await expect(notes(page)).toHaveCount(2)

  // Pressing empty board leaves no field with the cursor.
  const board = await box(page.getByRole('main', { name: 'Board' }))
  await page.mouse.click(board.x + 40, board.y + board.height - 40)
  expect(await page.evaluate('document.activeElement === document.body')).toBe(true)
})

test('move a note by its strip and resize it from the corner', async ({ page }) => {
  await drawNote(page, 120, 100, 260, 180)
  const note = notes(page).first()
  const start = await box(note)

  await drag(page, { x: start.x + 80, y: start.y + 16 }, { x: start.x + 280, y: start.y + 116 })
  const moved = await box(note)
  expect(Math.round(moved.x - start.x)).toBe(200)
  expect(Math.round(moved.y - start.y)).toBe(100)

  const handle = await box(note.getByRole('button', { name: /^Resize/ }))
  await drag(page, { x: handle.x + 10, y: handle.y + 10 }, { x: handle.x + 70, y: handle.y + 50 })
  const resized = await box(note)
  expect(Math.round(resized.width - start.width)).toBe(60)
  expect(Math.round(resized.height - start.height)).toBe(40)

  // Never smaller than 160 × 120.
  const corner = await box(note.getByRole('button', { name: /^Resize/ }))
  await drag(page, { x: corner.x + 10, y: corner.y + 10 }, { x: corner.x - 400, y: corner.y - 400 })
  const smallest = await box(note)
  expect([Math.round(smallest.width), Math.round(smallest.height)]).toEqual([160, 120])
})

test('drop a note on the trash zone to delete it', async ({ page }) => {
  await page.getByRole('button', { name: 'New note' }).click()
  await page.keyboard.type('Keep me')
  await drawNote(page, 80, 80, 240, 180)
  await page.keyboard.type('Delete me')
  await expect(notes(page)).toHaveCount(2)

  const doomed = page.getByRole('article', { name: 'Delete me' })
  const strip = await box(doomed)
  const trash = await box(page.getByText('Drop a note here to delete').locator('..'))
  await page.mouse.move(strip.x + 60, strip.y + 16)
  await page.mouse.down()
  await page.mouse.move(trash.x + trash.width / 2, trash.y + trash.height / 2, { steps: 15 })
  await expect(page.getByText('Release to delete')).toBeVisible()
  await page.mouse.up()

  await expect(notes(page)).toHaveCount(1)
  await expect(page.getByRole('article', { name: 'Keep me' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Notes' }).getByRole('listitem')).toHaveCount(1)
})

test('undo brings back a note deleted on the trash zone, and redo deletes it again', async ({ page }) => {
  await drawNote(page, 100, 100, 260, 180)
  await page.keyboard.type('Oops')
  await page.keyboard.press('Escape')

  const strip = await box(page.getByRole('article', { name: 'Oops' }))
  const trash = await box(page.getByText('Drop a note here to delete').locator('..'))
  await drag(page, { x: strip.x + 60, y: strip.y + 16 }, { x: trash.x + trash.width / 2, y: trash.y + trash.height / 2 })
  await expect(notes(page)).toHaveCount(0)

  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.getByRole('article', { name: 'Oops' })).toBeVisible()
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(notes(page)).toHaveCount(0)
  await page.keyboard.press('ControlOrMeta+z')

  // The restored note is saved like any other change.
  await expect(saveStatus(page)).toHaveText('All changes saved')
  await page.reload()
  await expect(page.getByRole('article', { name: 'Oops' })).toBeVisible()
})

test('undo keys inside a field are left to the browser’s text undo', async ({ page }) => {
  await drawNote(page, 100, 100, 260, 180)
  await page.keyboard.type('Draft')
  await page.keyboard.press('ControlOrMeta+z')
  // The note is still there: the shortcut didn't undo adding it.
  await expect(notes(page)).toHaveCount(1)
})
