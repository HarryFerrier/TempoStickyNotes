import { describe, expect, it, vi } from 'vitest'
import { createNoteStore } from './createNoteStore'
import * as mockApi from '../mockApiStore/mockApiStore'

describe('createNoteStore', () => {
  it('uses the mock API by default, with no failures', () => {
    const spy = vi.spyOn(mockApi, 'createMockApiStore')
    createNoteStore('')
    expect(spy).toHaveBeenCalledWith(expect.anything(), { failureRate: 0, failFirstSaves: 0 })
    spy.mockRestore()
  })

  it('reads the failure options from the URL and ignores nonsense values', () => {
    const spy = vi.spyOn(mockApi, 'createMockApiStore')
    createNoteStore('?failRate=3&failSaves=2.7')
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), { failureRate: 1, failFirstSaves: 2 })
    createNoteStore('?failRate=banana&failSaves=-4')
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), { failureRate: 0, failFirstSaves: 0 })
    spy.mockRestore()
  })

  it('skips the mock API with ?store=local', () => {
    const spy = vi.spyOn(mockApi, 'createMockApiStore')
    createNoteStore('?store=local')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
