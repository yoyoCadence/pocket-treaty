import { beforeEach, describe, expect, it } from 'vitest'
import { EXPENSES, EXPENSE_SHARES, SETTLEMENTS } from '../../data/mockData'
import { getBalanceBetween } from '../../lib/settlement'
import { useAppStore } from '../useAppStore'
import type { Expense, ExpenseShare, Settlement } from '../../types/database'

const baseState = useAppStore.getInitialState()

function resetStore() {
  useAppStore.setState({
    people: baseState.people,
    categories: baseState.categories,
    merchants: baseState.merchants,
    expenses: baseState.expenses,
    expenseShares: baseState.expenseShares,
    settlements: baseState.settlements,
  })
}

function expense(overrides: Partial<Expense> & { id: string }): Expense {
  return {
    date: '2026-05-30',
    time: '12:00',
    amount: 200,
    categoryId: 'lunch',
    merchantId: null,
    title: 'Store test',
    note: null,
    payerPersonId: 'me',
    splitType: 'equal',
    isSettled: false,
    createdAt: '2026-05-30T12:00:00',
    updatedAt: '2026-05-30T12:00:00',
    ...overrides,
  }
}

function share(overrides: Partial<ExpenseShare> & { id: string; expenseId: string; personId: string }): ExpenseShare {
  return {
    shareAmount: 100,
    shareRatio: 0.5,
    ...overrides,
  }
}

function settlement(overrides: Partial<Settlement> & { id: string }): Settlement {
  return {
    fromPersonId: 'me',
    toPersonId: 'girlfriend',
    amount: 50,
    date: '2026-05-30',
    note: null,
    createdAt: '2026-05-30T20:00:00',
    ...overrides,
  }
}

describe('useAppStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts from the mock dataset', () => {
    const state = useAppStore.getState()

    expect(state.expenses).toEqual(EXPENSES)
    expect(state.expenseShares).toEqual(EXPENSE_SHARES)
    expect(state.settlements).toEqual(SETTLEMENTS)
  })

  it('adds an expense and its shares together', () => {
    const newExpense = expense({ id: 'new-expense', amount: 300, payerPersonId: 'girlfriend' })
    const newShares = [
      share({ id: 'new-share-me', expenseId: 'new-expense', personId: 'me', shareAmount: 150 }),
      share({ id: 'new-share-gf', expenseId: 'new-expense', personId: 'girlfriend', shareAmount: 150 }),
    ]

    useAppStore.getState().addExpense(newExpense, newShares)
    const state = useAppStore.getState()

    expect(state.expenses[0]).toEqual(newExpense)
    expect(state.expenseShares.filter(item => item.expenseId === 'new-expense')).toEqual(newShares)
  })

  it('updates an expense by replacing only that expense and its shares', () => {
    const updatedExpense = {
      ...EXPENSES[0],
      amount: 800,
      title: 'Updated hot pot',
      updatedAt: '2026-05-30T21:00:00',
    }
    const replacementShares = [
      share({ id: 'replacement-me', expenseId: EXPENSES[0].id, personId: 'me', shareAmount: 400 }),
      share({ id: 'replacement-gf', expenseId: EXPENSES[0].id, personId: 'girlfriend', shareAmount: 400 }),
    ]

    useAppStore.getState().updateExpense(updatedExpense, replacementShares)
    const state = useAppStore.getState()

    expect(state.expenses.find(item => item.id === EXPENSES[0].id)).toEqual(updatedExpense)
    expect(state.expenseShares.filter(item => item.expenseId === EXPENSES[0].id)).toEqual(replacementShares)
    expect(state.expenseShares.some(item => item.id === 'es1a')).toBe(false)
    expect(state.expenseShares.some(item => item.expenseId === EXPENSES[1].id)).toBe(true)
  })

  it('deletes an expense and cascades its shares', () => {
    useAppStore.getState().deleteExpense('exp1')
    const state = useAppStore.getState()

    expect(state.expenses.some(item => item.id === 'exp1')).toBe(false)
    expect(state.expenseShares.some(item => item.expenseId === 'exp1')).toBe(false)
    expect(state.settlements).toEqual(SETTLEMENTS)
  })

  it('adds a settlement and updates the derived balance immediately', () => {
    const newSettlement = settlement({ id: 'new-settlement', amount: 70 })

    useAppStore.getState().addSettlement(newSettlement)
    const state = useAppStore.getState()
    const balance = getBalanceBetween(
      'me',
      'girlfriend',
      state.expenses,
      state.expenseShares,
      state.settlements
    )

    expect(state.settlements[0]).toEqual(newSettlement)
    expect(balance.debtorId).toBe('me')
    expect(balance.creditorId).toBe('girlfriend')
    expect(balance.amount).toBe(100)
  })
})
