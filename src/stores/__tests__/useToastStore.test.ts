import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast, useToastStore } from '../useToastStore'

function resetStore() {
  useToastStore.setState({ toasts: [] })
}

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetStore()
  })

  it('adds success, error, and info toasts through the helper', () => {
    toast.success('Saved')
    toast.error('Failed')
    toast.info('Heads up')

    expect(useToastStore.getState().toasts.map(item => item.type)).toEqual([
      'success',
      'error',
      'info',
    ])
  })

  it('keeps at most three visible toasts', () => {
    useToastStore.getState().show('one')
    useToastStore.getState().show('two')
    useToastStore.getState().show('three')
    useToastStore.getState().show('four')

    expect(useToastStore.getState().toasts.map(item => item.message)).toEqual([
      'two',
      'three',
      'four',
    ])
  })

  it('dismisses a toast manually', () => {
    useToastStore.getState().show('dismiss me')
    const [first] = useToastStore.getState().toasts

    useToastStore.getState().dismiss(first.id)

    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('auto-dismisses toasts after the timeout', () => {
    useToastStore.getState().show('temporary')

    vi.advanceTimersByTime(2800)

    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
