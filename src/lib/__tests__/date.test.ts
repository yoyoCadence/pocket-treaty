import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  todayStr,
  weekStartStr,
  weekEndStr,
  monthStartStr,
  monthEndStr,
  nowTimeStr,
  formatDisplayDate,
  formatDisplayDateTime,
} from '../date'

describe('date utilities', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats current date and time from the active clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 30, 9, 5, 0))

    expect(todayStr()).toBe('2026-05-30')
    expect(nowTimeStr()).toBe('09:05')
  })

  it('returns Monday-start week boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 30, 9, 5, 0))

    expect(weekStartStr()).toBe('2026-05-25')
    expect(weekEndStr()).toBe('2026-05-31')
  })

  it('returns month boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 30, 9, 5, 0))

    expect(monthStartStr()).toBe('2026-05-01')
    expect(monthEndStr()).toBe('2026-05-31')
  })

  it('displays YYYY-MM-DD strings as local calendar dates', () => {
    expect(formatDisplayDate('2026-05-30')).toBe('5/30 (週六)')
    expect(formatDisplayDateTime('2026-05-30', '19:30')).toBe('5/30 19:30')
  })
})
