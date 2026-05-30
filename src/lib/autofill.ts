// Smart autofill — Phase 9
// Phase 1: only time-based category suggestion is active.

export function suggestCategoryByTime(timeStr: string): string {
  const [h] = timeStr.split(':').map(Number)
  if (h >= 5 && h < 10) return 'breakfast'
  if (h >= 10 && h < 14) return 'lunch'
  if (h >= 14 && h < 17) return 'drinks'
  if (h >= 17 && h < 21) return 'dinner'
  return 'entertainment'  // late night / other
}

// Stubs for Phase 9
// export function suggestCategoryByMerchant() {}
// export function suggestPayerFromHistory() {}
// export function suggestSplitModeFromHistory() {}
