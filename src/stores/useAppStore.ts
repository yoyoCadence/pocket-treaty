import { create } from 'zustand'
import type { Expense, ExpenseShare, Settlement, Person, Category, Merchant } from '../types/database'
import {
  PEOPLE,
  CATEGORIES,
  MERCHANTS,
  EXPENSES,
  EXPENSE_SHARES,
  SETTLEMENTS,
} from '../data/mockData'

interface AppStore {
  people: Person[]
  categories: Category[]
  merchants: Merchant[]
  expenses: Expense[]
  expenseShares: ExpenseShare[]
  settlements: Settlement[]

  addExpense: (expense: Expense, shares: ExpenseShare[]) => void
  updateExpense: (expense: Expense, shares: ExpenseShare[]) => void
  deleteExpense: (expenseId: string) => void
  addSettlement: (settlement: Settlement) => void
}

export const useAppStore = create<AppStore>((set) => ({
  people: PEOPLE,
  categories: CATEGORIES,
  merchants: MERCHANTS,
  expenses: EXPENSES,
  expenseShares: EXPENSE_SHARES,
  settlements: SETTLEMENTS,

  addExpense: (expense, shares) =>
    set(state => ({
      expenses: [expense, ...state.expenses],
      expenseShares: [...state.expenseShares, ...shares],
    })),

  updateExpense: (expense, shares) =>
    set(state => ({
      expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
      expenseShares: [
        ...state.expenseShares.filter(s => s.expenseId !== expense.id),
        ...shares,
      ],
    })),

  deleteExpense: (expenseId) =>
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== expenseId),
      expenseShares: state.expenseShares.filter(s => s.expenseId !== expenseId),
    })),

  addSettlement: (settlement) =>
    set(state => ({
      settlements: [settlement, ...state.settlements],
    })),
}))
