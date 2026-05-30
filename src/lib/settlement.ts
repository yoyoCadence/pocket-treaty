import type {
  Expense,
  ExpenseShare,
  Settlement,
  DebtEntry,
  BalanceSummary,
} from '../types/database'

/**
 * For a single expense, derive who owes whom.
 *
 * Rule: if a participant's personId !== payerPersonId,
 * that participant owes the payer their shareAmount.
 */
export function calculateExpenseDebts(
  expense: Expense,
  shares: ExpenseShare[]
): DebtEntry[] {
  const result: DebtEntry[] = []
  for (const share of shares) {
    if (share.expenseId !== expense.id) continue
    if (share.personId === expense.payerPersonId) continue
    if (share.shareAmount <= 0) continue
    result.push({
      fromPersonId: share.personId,
      toPersonId: expense.payerPersonId,
      amount: share.shareAmount,
      expenseId: expense.id,
      expenseTitle: expense.title,
      expenseDate: expense.date,
    })
  }
  return result
}

/**
 * Aggregate all debts from expenses, then subtract repayments (settlements).
 *
 * Returns a map: `${debtorId}→${creditorId}` → net amount owed.
 * Only entries with amount > 0 remain.
 */
export function calculateNetBalances(
  expenses: Expense[],
  allShares: ExpenseShare[],
  settlements: Settlement[]
): Map<string, number> {
  // key = `${debtorId}:${creditorId}`, value = gross amount owed
  const ledger = new Map<string, number>()

  const add = (debtor: string, creditor: string, amount: number) => {
    // Always normalise so the smaller id is first to merge A→B and B→A
    const [a, b] = [debtor, creditor].sort()
    const key = `${a}:${b}`
    // sign convention: positive = a owes b
    const sign = a === debtor ? 1 : -1
    ledger.set(key, (ledger.get(key) ?? 0) + sign * amount)
  }

  for (const expense of expenses) {
    const shares = allShares.filter(s => s.expenseId === expense.id)
    const debts = calculateExpenseDebts(expense, shares)
    for (const debt of debts) {
      add(debt.fromPersonId, debt.toPersonId, debt.amount)
    }
  }

  for (const settlement of settlements) {
    // A settlement reduces the debt from fromPerson to toPerson
    add(settlement.toPersonId, settlement.fromPersonId, settlement.amount)
  }

  return ledger
}

/**
 * Get the directional net balance between two specific people.
 *
 * Returns:
 *  { debtorId, creditorId, amount } where amount > 0
 *  or { debtorId: '', creditorId: '', amount: 0 } if balanced
 */
export function getBalanceBetween(
  personAId: string,
  personBId: string,
  expenses: Expense[],
  allShares: ExpenseShare[],
  settlements: Settlement[]
): { debtorId: string; creditorId: string; amount: number } {
  const ledger = calculateNetBalances(expenses, allShares, settlements)
  const [a, b] = [personAId, personBId].sort()
  const key = `${a}:${b}`
  const net = ledger.get(key) ?? 0

  if (Math.abs(net) < 0.01) {
    return { debtorId: '', creditorId: '', amount: 0 }
  }

  // positive net → a owes b
  if (net > 0) {
    return { debtorId: a, creditorId: b, amount: Math.round(net * 100) / 100 }
  }
  return { debtorId: b, creditorId: a, amount: Math.round(-net * 100) / 100 }
}

/**
 * Human-readable description of the balance.
 * personNames: id → display name
 */
export function formatBalanceSummary(
  balance: { debtorId: string; creditorId: string; amount: number },
  personNames: Record<string, string>,
  selfId: string
): string {
  if (balance.amount === 0) return '目前帳目已結清'

  const debtor = personNames[balance.debtorId] ?? balance.debtorId
  const creditor = personNames[balance.creditorId] ?? balance.creditorId

  if (balance.debtorId === selfId) {
    return `你欠${creditor} NT$${balance.amount.toLocaleString()}`
  }
  if (balance.creditorId === selfId) {
    return `${debtor}欠你 NT$${balance.amount.toLocaleString()}`
  }
  return `${debtor}欠${creditor} NT$${balance.amount.toLocaleString()}`
}

/**
 * Full breakdown: list every expense debt and settlement that contributes
 * to the balance between two people.
 */
export function getSettlementDetails(
  personAId: string,
  personBId: string,
  expenses: Expense[],
  allShares: ExpenseShare[],
  settlements: Settlement[]
): BalanceSummary {
  const breakdown: DebtEntry[] = []

  for (const expense of expenses) {
    const shares = allShares.filter(s => s.expenseId === expense.id)
    const debts = calculateExpenseDebts(expense, shares)
    for (const debt of debts) {
      const involves =
        (debt.fromPersonId === personAId && debt.toPersonId === personBId) ||
        (debt.fromPersonId === personBId && debt.toPersonId === personAId)
      if (involves) breakdown.push(debt)
    }
  }

  const balance = getBalanceBetween(personAId, personBId, expenses, allShares, settlements)
  return {
    debtorId: balance.debtorId,
    creditorId: balance.creditorId,
    amount: balance.amount,
    breakdown,
  }
}

// ─── Utility ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return `NT$${Math.abs(amount).toLocaleString()}`
}

/** Sum expenses within a date range (inclusive). */
export function sumExpensesInRange(
  expenses: Expense[],
  from: string,
  to: string
): number {
  return expenses
    .filter(e => e.date >= from && e.date <= to)
    .reduce((sum, e) => sum + e.amount, 0)
}
