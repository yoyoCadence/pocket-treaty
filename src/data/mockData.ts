import { format, subDays } from 'date-fns'
import type { Person, Category, Merchant, Expense, ExpenseShare, Settlement } from '../types/database'

const today = format(new Date(), 'yyyy-MM-dd')
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

// ─── People ────────────────────────────────────────────────────────────────

export const PEOPLE: Person[] = [
  { id: 'me',         name: '我',   color: '#2F4F4F', isDefault: true  },
  { id: 'girlfriend', name: '女友', color: '#D9A441', isDefault: false },
  { id: 'family',     name: '家人', color: '#6B8CAE', isDefault: false },
]

// ─── Categories ────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: 'breakfast',    name: '早餐', icon: '🍳', color: '#F59E0B', sortOrder: 1 },
  { id: 'lunch',        name: '午餐', icon: '🍱', color: '#10B981', sortOrder: 2 },
  { id: 'dinner',       name: '晚餐', icon: '🍽️', color: '#6366F1', sortOrder: 3 },
  { id: 'drinks',       name: '飲料', icon: '🧋', color: '#EC4899', sortOrder: 4 },
  { id: 'transport',    name: '交通', icon: '🚇', color: '#3B82F6', sortOrder: 5 },
  { id: 'entertainment',name: '娛樂', icon: '🎬', color: '#8B5CF6', sortOrder: 6 },
  { id: 'shopping',     name: '購物', icon: '🛍️', color: '#F97316', sortOrder: 7 },
  { id: 'daily',        name: '生活', icon: '🏠', color: '#14B8A6', sortOrder: 8 },
  { id: 'medical',      name: '醫療', icon: '💊', color: '#EF4444', sortOrder: 9 },
  { id: 'other',        name: '其他', icon: '📦', color: '#9CA3AF', sortOrder: 10 },
]

// ─── Merchants ─────────────────────────────────────────────────────────────

export const MERCHANTS: Merchant[] = [
  { id: 'm1', name: '星巴克',   defaultCategoryId: 'drinks' },
  { id: 'm2', name: '全聯',     defaultCategoryId: 'daily'  },
  { id: 'm3', name: 'Uber',    defaultCategoryId: 'transport' },
  { id: 'm4', name: '八方雲集', defaultCategoryId: 'dinner' },
]

// ─── Expenses ──────────────────────────────────────────────────────────────
//
// Scenario A: 女友付 500 火鍋，我和女友平分 → 我欠女友 250
// Scenario B: 我付 120 飲料，我和女友平分 → 女友欠我 60
// Scenario C: 女友付 80 便利商店，我全額負擔 → 我欠女友 80
// Settlement: 我還女友 100
// Net: 250 - 60 + 80 - 100 = 170 (我淨欠女友 NT$170)

export const EXPENSES: Expense[] = [
  {
    id: 'exp1',
    date: today,
    time: '19:30',
    amount: 500,
    categoryId: 'dinner',
    merchantId: null,
    title: '火鍋',
    note: null,
    payerPersonId: 'girlfriend',
    splitType: 'equal',
    isSettled: false,
    createdAt: `${today}T19:30:00`,
    updatedAt: `${today}T19:30:00`,
  },
  {
    id: 'exp2',
    date: today,
    time: '15:00',
    amount: 120,
    categoryId: 'drinks',
    merchantId: null,
    title: '飲料',
    note: null,
    payerPersonId: 'me',
    splitType: 'equal',
    isSettled: false,
    createdAt: `${today}T15:00:00`,
    updatedAt: `${today}T15:00:00`,
  },
  {
    id: 'exp3',
    date: yesterday,
    time: '11:20',
    amount: 80,
    categoryId: 'daily',
    merchantId: null,
    title: '便利商店',
    note: '我全額',
    payerPersonId: 'girlfriend',
    splitType: 'single_person',
    isSettled: false,
    createdAt: `${yesterday}T11:20:00`,
    updatedAt: `${yesterday}T11:20:00`,
  },
]

// ─── Expense Shares ────────────────────────────────────────────────────────

export const EXPENSE_SHARES: ExpenseShare[] = [
  // exp1: 500 平分 → 各 250
  { id: 'es1a', expenseId: 'exp1', personId: 'me',         shareAmount: 250, shareRatio: 0.5 },
  { id: 'es1b', expenseId: 'exp1', personId: 'girlfriend', shareAmount: 250, shareRatio: 0.5 },

  // exp2: 120 平分 → 各 60
  { id: 'es2a', expenseId: 'exp2', personId: 'me',         shareAmount: 60,  shareRatio: 0.5 },
  { id: 'es2b', expenseId: 'exp2', personId: 'girlfriend', shareAmount: 60,  shareRatio: 0.5 },

  // exp3: 80 全由我負擔
  { id: 'es3a', expenseId: 'exp3', personId: 'me',         shareAmount: 80,  shareRatio: 1.0 },
]

// ─── Settlements ───────────────────────────────────────────────────────────

export const SETTLEMENTS: Settlement[] = [
  {
    id: 'set1',
    fromPersonId: 'me',
    toPersonId: 'girlfriend',
    amount: 100,
    date: today,
    note: '還部分欠款',
    createdAt: `${today}T20:00:00`,
  },
]
