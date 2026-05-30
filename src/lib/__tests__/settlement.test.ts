import { describe, it, expect } from 'vitest'
import {
  calculateExpenseDebts,
  getBalanceBetween,
  getSettlementDetails,
  formatBalanceSummary,
  formatCurrency,
  sumExpensesInRange,
} from '../settlement'
import type { Expense, ExpenseShare, Settlement } from '../../types/database'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const ME = 'me'
const GF = 'girlfriend'

function expense(overrides: Partial<Expense> & { id: string }): Expense {
  return {
    date: '2026-05-30',
    time: '12:00',
    amount: 100,
    categoryId: 'lunch',
    merchantId: null,
    title: 'test',
    note: null,
    payerPersonId: ME,
    splitType: 'equal',
    isSettled: false,
    createdAt: '2026-05-30T12:00:00',
    updatedAt: '2026-05-30T12:00:00',
    ...overrides,
  }
}

function share(overrides: Partial<ExpenseShare> & { id: string; expenseId: string; personId: string }): ExpenseShare {
  return {
    shareAmount: 50,
    shareRatio: 0.5,
    ...overrides,
  }
}

function settlement(overrides: Partial<Settlement> & { id: string }): Settlement {
  return {
    fromPersonId: ME,
    toPersonId: GF,
    amount: 100,
    date: '2026-05-30',
    note: null,
    createdAt: '2026-05-30T20:00:00',
    ...overrides,
  }
}

const NAMES: Record<string, string> = { [ME]: '我', [GF]: '女友' }

// ─── calculateExpenseDebts ─────────────────────────────────────────────────

describe('calculateExpenseDebts', () => {
  it('平分：非付款者欠付款者各自的份額', () => {
    const exp = expense({ id: 'e1', payerPersonId: GF, amount: 500 })
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 250 }),
    ]
    const debts = calculateExpenseDebts(exp, shares)
    expect(debts).toHaveLength(1)
    expect(debts[0]).toMatchObject({
      fromPersonId: ME,
      toPersonId: GF,
      amount: 250,
      expenseId: 'e1',
    })
  })

  it('付款者自己的 share 不會產生債務', () => {
    const exp = expense({ id: 'e1', payerPersonId: ME, amount: 200 })
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 100 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 100 }),
    ]
    const debts = calculateExpenseDebts(exp, shares)
    // 只有 GF 欠 ME，ME 不欠自己
    expect(debts).toHaveLength(1)
    expect(debts[0].fromPersonId).toBe(GF)
    expect(debts[0].toPersonId).toBe(ME)
  })

  it('single_person：被指定的人欠付款者全額', () => {
    const exp = expense({ id: 'e1', payerPersonId: GF, amount: 80, splitType: 'single_person' })
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 80, shareRatio: 1 }),
    ]
    const debts = calculateExpenseDebts(exp, shares)
    expect(debts).toHaveLength(1)
    expect(debts[0]).toMatchObject({ fromPersonId: ME, toPersonId: GF, amount: 80 })
  })

  it('none（不分帳）：shares 為空時不產生任何債務', () => {
    const exp = expense({ id: 'e1', splitType: 'none' })
    expect(calculateExpenseDebts(exp, [])).toHaveLength(0)
  })

  it('shareAmount 為 0 的項目被略過', () => {
    const exp = expense({ id: 'e1', payerPersonId: ME })
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: GF, shareAmount: 0 }),
    ]
    expect(calculateExpenseDebts(exp, shares)).toHaveLength(0)
  })
})

// ─── calculateNetBalances ──────────────────────────────────────────────────

describe('calculateNetBalances', () => {
  // 情境 A：500 元，女友付，平分 → 我欠女友 250
  it('情境 A：我欠女友 250', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 500 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 250 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, [])
    expect(balance.debtorId).toBe(ME)
    expect(balance.creditorId).toBe(GF)
    expect(balance.amount).toBe(250)
  })

  // 情境 B：120 元，我付，平分 → 女友欠我 60
  it('情境 B：女友欠我 60', () => {
    const expenses = [
      expense({ id: 'e2', payerPersonId: ME, amount: 120 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e2', personId: ME, shareAmount: 60 }),
      share({ id: 's2', expenseId: 'e2', personId: GF, shareAmount: 60 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, [])
    expect(balance.debtorId).toBe(GF)
    expect(balance.creditorId).toBe(ME)
    expect(balance.amount).toBe(60)
  })

  // 情境 C：A + B 合併 → 我淨欠女友 190
  it('情境 C：A+B 合計，我淨欠女友 190', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 500 }),
      expense({ id: 'e2', payerPersonId: ME,  amount: 120 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 250 }),
      share({ id: 's3', expenseId: 'e2', personId: ME, shareAmount: 60 }),
      share({ id: 's4', expenseId: 'e2', personId: GF, shareAmount: 60 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, [])
    expect(balance.debtorId).toBe(ME)
    expect(balance.creditorId).toBe(GF)
    expect(balance.amount).toBe(190)
  })

  // 情境 D：C 之後還款 100 → 我淨欠女友 90
  it('情境 D：還款 100 後，我淨欠女友 90', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 500 }),
      expense({ id: 'e2', payerPersonId: ME,  amount: 120 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 250 }),
      share({ id: 's3', expenseId: 'e2', personId: ME, shareAmount: 60 }),
      share({ id: 's4', expenseId: 'e2', personId: GF, shareAmount: 60 }),
    ]
    const settlements = [
      settlement({ id: 'set1', fromPersonId: ME, toPersonId: GF, amount: 100 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, settlements)
    expect(balance.debtorId).toBe(ME)
    expect(balance.creditorId).toBe(GF)
    expect(balance.amount).toBe(90)
  })

  // Mock data 完整情境：3 筆支出 + 1 筆還款 → NT$170
  it('完整 mock data 情境：我淨欠女友 170', () => {
    const today = '2026-05-30'
    const yesterday = '2026-05-29'
    const expenses = [
      expense({ id: 'exp1', date: today,     payerPersonId: GF, amount: 500, splitType: 'equal' }),
      expense({ id: 'exp2', date: today,     payerPersonId: ME, amount: 120, splitType: 'equal' }),
      expense({ id: 'exp3', date: yesterday, payerPersonId: GF, amount: 80,  splitType: 'single_person' }),
    ]
    const shares = [
      share({ id: 'es1a', expenseId: 'exp1', personId: ME, shareAmount: 250, shareRatio: 0.5 }),
      share({ id: 'es1b', expenseId: 'exp1', personId: GF, shareAmount: 250, shareRatio: 0.5 }),
      share({ id: 'es2a', expenseId: 'exp2', personId: ME, shareAmount: 60,  shareRatio: 0.5 }),
      share({ id: 'es2b', expenseId: 'exp2', personId: GF, shareAmount: 60,  shareRatio: 0.5 }),
      share({ id: 'es3a', expenseId: 'exp3', personId: ME, shareAmount: 80,  shareRatio: 1.0 }),
    ]
    const settlements = [
      settlement({ id: 'set1', fromPersonId: ME, toPersonId: GF, amount: 100 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, settlements)
    expect(balance.debtorId).toBe(ME)
    expect(balance.creditorId).toBe(GF)
    expect(balance.amount).toBe(170)
  })

  it('帳目完全結清時，amount 為 0', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 200 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 100 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 100 }),
    ]
    const settlements = [
      settlement({ id: 'set1', fromPersonId: ME, toPersonId: GF, amount: 100 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, settlements)
    expect(balance.amount).toBe(0)
    expect(balance.debtorId).toBe('')
    expect(balance.creditorId).toBe('')
  })

  it('支出為零時，淨額為 0', () => {
    const balance = getBalanceBetween(ME, GF, [], [], [])
    expect(balance.amount).toBe(0)
  })

  it('還款超過欠款時，方向反轉（多還了）', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 200 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 100 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 100 }),
    ]
    const settlements = [
      settlement({ id: 'set1', fromPersonId: ME, toPersonId: GF, amount: 150 }),
    ]
    const balance = getBalanceBetween(ME, GF, expenses, shares, settlements)
    // 我欠女友 100，但還了 150，所以女友欠我 50
    expect(balance.debtorId).toBe(GF)
    expect(balance.creditorId).toBe(ME)
    expect(balance.amount).toBe(50)
  })
})

// ─── getBalanceBetween symmetry ────────────────────────────────────────────

describe('getBalanceBetween', () => {
  it('傳入順序不影響結果（對稱性）', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 300 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 150 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 150 }),
    ]
    const b1 = getBalanceBetween(ME, GF, expenses, shares, [])
    const b2 = getBalanceBetween(GF, ME, expenses, shares, [])
    expect(b1.debtorId).toBe(b2.debtorId)
    expect(b1.creditorId).toBe(b2.creditorId)
    expect(b1.amount).toBe(b2.amount)
  })
})

// ─── getSettlementDetails ──────────────────────────────────────────────────

describe('getSettlementDetails', () => {
  it('breakdown 包含正確的欠款明細數量', () => {
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 500 }),
      expense({ id: 'e2', payerPersonId: ME,  amount: 120 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME, shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF, shareAmount: 250 }),
      share({ id: 's3', expenseId: 'e2', personId: ME, shareAmount: 60 }),
      share({ id: 's4', expenseId: 'e2', personId: GF, shareAmount: 60 }),
    ]
    const details = getSettlementDetails(ME, GF, expenses, shares, [])
    // e1: me → gf (250)、e2: gf → me (60) の 2 件
    expect(details.breakdown).toHaveLength(2)
    expect(details.amount).toBe(190)
  })

  it('無關第三者的支出不出現在 breakdown', () => {
    const THIRD = 'family'
    const expenses = [
      expense({ id: 'e1', payerPersonId: GF, amount: 500 }),
      expense({ id: 'e3', payerPersonId: THIRD, amount: 300 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME,    shareAmount: 250 }),
      share({ id: 's2', expenseId: 'e1', personId: GF,    shareAmount: 250 }),
      share({ id: 's3', expenseId: 'e3', personId: THIRD, shareAmount: 300 }),
    ]
    const details = getSettlementDetails(ME, GF, expenses, shares, [])
    expect(details.breakdown).toHaveLength(1)
    expect(details.breakdown[0].expenseId).toBe('e1')
  })

  it('三人同行時，第三者對其中一人的債務不納入兩人的 breakdown', () => {
    // e1: ME 付 300，三人均分（ME=100, GF=100, FAMILY=100）
    // 產生的債務：GF→ME(100), FAMILY→ME(100)
    // getSettlementDetails(ME, GF) 應該只包含 GF→ME，不含 FAMILY→ME
    const FAMILY = 'family'
    const expenses = [
      expense({ id: 'e1', payerPersonId: ME, amount: 300 }),
    ]
    const shares = [
      share({ id: 's1', expenseId: 'e1', personId: ME,     shareAmount: 100, shareRatio: 1/3 }),
      share({ id: 's2', expenseId: 'e1', personId: GF,     shareAmount: 100, shareRatio: 1/3 }),
      share({ id: 's3', expenseId: 'e1', personId: FAMILY, shareAmount: 100, shareRatio: 1/3 }),
    ]
    const details = getSettlementDetails(ME, GF, expenses, shares, [])
    expect(details.breakdown).toHaveLength(1)
    expect(details.breakdown[0]).toMatchObject({
      fromPersonId: GF,
      toPersonId: ME,
      amount: 100,
    })
  })
})

// ─── formatBalanceSummary ──────────────────────────────────────────────────

describe('formatBalanceSummary', () => {
  it('自己是欠款人 → 「你欠女友 NT$XXX」', () => {
    const result = formatBalanceSummary(
      { debtorId: ME, creditorId: GF, amount: 170 },
      NAMES,
      ME
    )
    expect(result).toBe('你欠女友 NT$170')
  })

  it('自己是收款人 → 「女友欠你 NT$XXX」', () => {
    const result = formatBalanceSummary(
      { debtorId: GF, creditorId: ME, amount: 60 },
      NAMES,
      ME
    )
    expect(result).toBe('女友欠你 NT$60')
  })

  it('amount 為 0 → 「目前帳目已結清」', () => {
    const result = formatBalanceSummary(
      { debtorId: '', creditorId: '', amount: 0 },
      NAMES,
      ME
    )
    expect(result).toBe('目前帳目已結清')
  })

  it('大金額顯示千分位', () => {
    const result = formatBalanceSummary(
      { debtorId: ME, creditorId: GF, amount: 1250 },
      NAMES,
      ME
    )
    expect(result).toBe('你欠女友 NT$1,250')
  })

  it('第三者之間的欠款（自己不在其中）→ 顯示雙方姓名', () => {
    const names = { ...NAMES, family: '家人' }
    const result = formatBalanceSummary(
      { debtorId: GF, creditorId: 'family', amount: 300 },
      names,
      ME   // 自己不是任何一方
    )
    expect(result).toBe('女友欠家人 NT$300')
  })

  it('debtor id 不在 personNames 時，直接顯示 id', () => {
    const result = formatBalanceSummary(
      { debtorId: 'unknown_debtor', creditorId: GF, amount: 50 },
      NAMES,
      ME
    )
    expect(result).toContain('unknown_debtor')
  })

  it('creditor id 不在 personNames 時，直接顯示 id', () => {
    const result = formatBalanceSummary(
      { debtorId: GF, creditorId: 'unknown_creditor', amount: 50 },
      NAMES,
      ME
    )
    expect(result).toContain('unknown_creditor')
  })
})

// ─── formatCurrency ────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('一般金額', () => {
    expect(formatCurrency(250)).toBe('NT$250')
  })

  it('千分位格式', () => {
    expect(formatCurrency(1000)).toBe('NT$1,000')
    expect(formatCurrency(12500)).toBe('NT$12,500')
  })

  it('負數取絕對值', () => {
    expect(formatCurrency(-100)).toBe('NT$100')
  })

  it('零', () => {
    expect(formatCurrency(0)).toBe('NT$0')
  })
})

// ─── sumExpensesInRange ────────────────────────────────────────────────────

describe('sumExpensesInRange', () => {
  const expenses = [
    expense({ id: 'e1', date: '2026-05-28', amount: 100 }),
    expense({ id: 'e2', date: '2026-05-29', amount: 200 }),
    expense({ id: 'e3', date: '2026-05-30', amount: 300 }),
    expense({ id: 'e4', date: '2026-05-31', amount: 400 }),
  ]

  it('指定範圍內的支出加總', () => {
    expect(sumExpensesInRange(expenses, '2026-05-29', '2026-05-30')).toBe(500)
  })

  it('範圍包含起始日', () => {
    expect(sumExpensesInRange(expenses, '2026-05-28', '2026-05-28')).toBe(100)
  })

  it('範圍包含結束日', () => {
    expect(sumExpensesInRange(expenses, '2026-05-31', '2026-05-31')).toBe(400)
  })

  it('範圍外的支出不計入', () => {
    expect(sumExpensesInRange(expenses, '2026-06-01', '2026-06-30')).toBe(0)
  })

  it('空陣列回傳 0', () => {
    expect(sumExpensesInRange([], '2026-05-01', '2026-05-31')).toBe(0)
  })

  it('全部日期都在範圍內', () => {
    expect(sumExpensesInRange(expenses, '2026-01-01', '2026-12-31')).toBe(1000)
  })
})
