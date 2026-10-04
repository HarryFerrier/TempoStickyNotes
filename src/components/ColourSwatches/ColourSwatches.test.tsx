// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ColourSwatches } from './ColourSwatches'

afterEach(cleanup)

describe('ColourSwatches', () => {
  it('offers the five colours by name, with the current one pressed', () => {
    render(<ColourSwatches value="ignition" onChange={() => {}} />)
    const swatches = screen.getAllByRole('button')
    expect(swatches.map((swatch) => swatch.getAttribute('aria-label'))).toEqual(['Blue', 'Purple', 'Orange', 'Green', 'Paper'])
    expect(screen.getByRole('button', { name: 'Orange' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Blue' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('calls onChange with the colour that was clicked', async () => {
    const onChange = vi.fn()
    render(<ColourSwatches value="clarity" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Green' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('success')
  })
})
