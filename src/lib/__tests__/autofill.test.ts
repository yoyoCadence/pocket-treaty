import { describe, it, expect } from 'vitest'
import { suggestCategoryByTime } from '../autofill'

describe('suggestCategoryByTime', () => {
  // ── 早餐 05:00–09:59 ──────────────────────────────────────────────────
  it('05:00 → 早餐（開始邊界）', () => {
    expect(suggestCategoryByTime('05:00')).toBe('breakfast')
  })

  it('07:30 → 早餐（中間）', () => {
    expect(suggestCategoryByTime('07:30')).toBe('breakfast')
  })

  it('09:59 → 早餐（結束邊界）', () => {
    expect(suggestCategoryByTime('09:59')).toBe('breakfast')
  })

  // ── 午餐 10:00–13:59 ──────────────────────────────────────────────────
  it('10:00 → 午餐（開始邊界）', () => {
    expect(suggestCategoryByTime('10:00')).toBe('lunch')
  })

  it('12:00 → 午餐（中間）', () => {
    expect(suggestCategoryByTime('12:00')).toBe('lunch')
  })

  it('13:59 → 午餐（結束邊界）', () => {
    expect(suggestCategoryByTime('13:59')).toBe('lunch')
  })

  // ── 飲料 / 下午茶 14:00–16:59 ────────────────────────────────────────
  it('14:00 → 飲料（開始邊界）', () => {
    expect(suggestCategoryByTime('14:00')).toBe('drinks')
  })

  it('15:30 → 飲料（中間）', () => {
    expect(suggestCategoryByTime('15:30')).toBe('drinks')
  })

  it('16:59 → 飲料（結束邊界）', () => {
    expect(suggestCategoryByTime('16:59')).toBe('drinks')
  })

  // ── 晚餐 17:00–20:59 ──────────────────────────────────────────────────
  it('17:00 → 晚餐（開始邊界）', () => {
    expect(suggestCategoryByTime('17:00')).toBe('dinner')
  })

  it('19:00 → 晚餐（中間）', () => {
    expect(suggestCategoryByTime('19:00')).toBe('dinner')
  })

  it('20:59 → 晚餐（結束邊界）', () => {
    expect(suggestCategoryByTime('20:59')).toBe('dinner')
  })

  // ── 娛樂 / 宵夜 21:00–04:59 ──────────────────────────────────────────
  it('21:00 → 娛樂（開始邊界）', () => {
    expect(suggestCategoryByTime('21:00')).toBe('entertainment')
  })

  it('23:30 → 娛樂（深夜）', () => {
    expect(suggestCategoryByTime('23:30')).toBe('entertainment')
  })

  it('00:00 → 娛樂（午夜）', () => {
    expect(suggestCategoryByTime('00:00')).toBe('entertainment')
  })

  it('02:00 → 娛樂（凌晨）', () => {
    expect(suggestCategoryByTime('02:00')).toBe('entertainment')
  })

  it('04:59 → 娛樂（清晨結束邊界）', () => {
    expect(suggestCategoryByTime('04:59')).toBe('entertainment')
  })

  // ── 各時段銜接不重疊 ──────────────────────────────────────────────────
  it('相鄰時段之間沒有重疊或空白', () => {
    const boundaries = [
      ['04:59', 'entertainment'],
      ['05:00', 'breakfast'],
      ['09:59', 'breakfast'],
      ['10:00', 'lunch'],
      ['13:59', 'lunch'],
      ['14:00', 'drinks'],
      ['16:59', 'drinks'],
      ['17:00', 'dinner'],
      ['20:59', 'dinner'],
      ['21:00', 'entertainment'],
    ] as const

    for (const [time, expected] of boundaries) {
      expect(suggestCategoryByTime(time), `time=${time}`).toBe(expected)
    }
  })

  // ── 回傳值是有效的 categoryId ─────────────────────────────────────────
  it('所有時刻回傳值都是有效的 categoryId', () => {
    const valid = new Set(['breakfast', 'lunch', 'drinks', 'dinner', 'entertainment'])
    const testTimes = [
      '00:00', '03:00', '05:00', '06:00', '09:00',
      '10:00', '11:30', '13:00', '14:00', '16:00',
      '17:00', '18:00', '20:00', '21:00', '23:59',
    ]
    for (const t of testTimes) {
      expect(valid.has(suggestCategoryByTime(t)), `time=${t}`).toBe(true)
    }
  })
})
