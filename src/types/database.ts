export interface Person {
  id: string
  name: string
  color: string
  isDefault: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
}

export interface Merchant {
  id: string
  name: string
  defaultCategoryId: string | null
}

export type SplitType = 'equal' | 'none' | 'single_person' | 'custom'

export interface Expense {
  id: string
  date: string       // YYYY-MM-DD
  time: string       // HH:mm
  amount: number
  categoryId: string
  merchantId: string | null
  title: string
  note: string | null
  payerPersonId: string
  splitType: SplitType
  isSettled: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseShare {
  id: string
  expenseId: string
  personId: string
  shareAmount: number
  shareRatio: number | null
}

export interface Settlement {
  id: string
  fromPersonId: string
  toPersonId: string
  amount: number
  date: string       // YYYY-MM-DD
  note: string | null
  createdAt: string
}

// Derived types used by settlement calculation
export interface DebtEntry {
  fromPersonId: string
  toPersonId: string
  amount: number
  expenseId: string
  expenseTitle: string
  expenseDate: string
}

export interface NetBalance {
  personAId: string
  personBId: string
  // positive = personA owes personB; negative = personB owes personA
  netAmount: number
}

export interface BalanceSummary {
  debtorId: string
  creditorId: string
  amount: number
  breakdown: DebtEntry[]
}
