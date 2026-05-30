import { describe, expect, it } from 'vitest'
import {
  PEOPLE,
  CATEGORIES,
  MERCHANTS,
  EXPENSES,
  EXPENSE_SHARES,
  SETTLEMENTS,
} from '../mockData'
import { getBalanceBetween } from '../../lib/settlement'

function expectUniqueIds(items: Array<{ id: string }>) {
  expect(new Set(items.map(item => item.id)).size).toBe(items.length)
}

describe('mock data integrity', () => {
  it('keeps ids unique within each collection', () => {
    expectUniqueIds(PEOPLE)
    expectUniqueIds(CATEGORIES)
    expectUniqueIds(MERCHANTS)
    expectUniqueIds(EXPENSES)
    expectUniqueIds(EXPENSE_SHARES)
    expectUniqueIds(SETTLEMENTS)
  })

  it('has exactly one default person', () => {
    expect(PEOPLE.filter(person => person.isDefault)).toHaveLength(1)
  })

  it('only references existing people, categories, merchants, and expenses', () => {
    const people = new Set(PEOPLE.map(person => person.id))
    const categories = new Set(CATEGORIES.map(category => category.id))
    const merchants = new Set(MERCHANTS.map(merchant => merchant.id))
    const expenses = new Set(EXPENSES.map(expense => expense.id))

    for (const expense of EXPENSES) {
      expect(people.has(expense.payerPersonId), `payer=${expense.payerPersonId}`).toBe(true)
      expect(categories.has(expense.categoryId), `category=${expense.categoryId}`).toBe(true)
      if (expense.merchantId) {
        expect(merchants.has(expense.merchantId), `merchant=${expense.merchantId}`).toBe(true)
      }
    }

    for (const share of EXPENSE_SHARES) {
      expect(expenses.has(share.expenseId), `share expense=${share.expenseId}`).toBe(true)
      expect(people.has(share.personId), `share person=${share.personId}`).toBe(true)
      expect(share.shareAmount).toBeGreaterThanOrEqual(0)
    }

    for (const settlement of SETTLEMENTS) {
      expect(people.has(settlement.fromPersonId), `from=${settlement.fromPersonId}`).toBe(true)
      expect(people.has(settlement.toPersonId), `to=${settlement.toPersonId}`).toBe(true)
      expect(settlement.amount).toBeGreaterThan(0)
    }
  })

  it('keeps expense shares synchronized with expense amounts', () => {
    for (const expense of EXPENSES) {
      const shares = EXPENSE_SHARES.filter(share => share.expenseId === expense.id)

      if (expense.splitType === 'none') {
        expect(shares).toHaveLength(0)
        continue
      }

      const shareTotal = shares.reduce((sum, share) => sum + share.shareAmount, 0)
      expect(shareTotal, `expense=${expense.id}`).toBeCloseTo(expense.amount, 2)
    }
  })

  it('keeps the documented mock net balance at NT$170', () => {
    const balance = getBalanceBetween('me', 'girlfriend', EXPENSES, EXPENSE_SHARES, SETTLEMENTS)

    expect(balance.debtorId).toBe('me')
    expect(balance.creditorId).toBe('girlfriend')
    expect(balance.amount).toBe(170)
  })
})
