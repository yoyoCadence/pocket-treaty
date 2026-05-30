import { useAppStore } from '../stores/useAppStore'
import {
  getBalanceBetween,
  formatBalanceSummary,
  formatCurrency,
  sumExpensesInRange,
} from '../lib/settlement'
import { todayStr, weekStartStr, weekEndStr, monthStartStr, monthEndStr, formatDisplayDateTime } from '../lib/date'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

const SELF_ID = 'me'
const PARTNER_ID = 'girlfriend'

export default function DashboardPage() {
  const { expenses, expenseShares, settlements, people, categories } = useAppStore()
  const navigate = useNavigate()

  const today = todayStr()
  const todayTotal = sumExpensesInRange(expenses, today, today)
  const weekTotal  = sumExpensesInRange(expenses, weekStartStr(), weekEndStr())
  const monthTotal = sumExpensesInRange(expenses, monthStartStr(), monthEndStr())

  const balance = getBalanceBetween(SELF_ID, PARTNER_ID, expenses, expenseShares, settlements)
  const personNames: Record<string, string> = Object.fromEntries(people.map(p => [p.id, p.name]))
  const balanceSummary = formatBalanceSummary(balance, personNames, SELF_ID)

  const recent = [...expenses]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5)

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id
  const getCategoryIcon = (id: string) => categories.find(c => c.id === id)?.icon ?? '📦'
  const getPersonName   = (id: string) => people.find(p => p.id === id)?.name ?? id

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">口袋條約</p>
          <h1 className="text-xl font-bold text-brand-primary">總覽</h1>
        </div>
        <TrendingUp size={20} className="text-brand-accent" />
      </div>

      {/* Balance card */}
      <div className={clsx(
        'rounded-3xl p-5 text-white',
        balance.amount === 0
          ? 'bg-brand-primary'
          : balance.debtorId === SELF_ID
            ? 'bg-brand-danger'
            : 'bg-brand-primary'
      )}>
        <p className="text-xs font-medium opacity-70 mb-1">目前結算</p>
        <p className="text-3xl font-bold tracking-tight mb-1">
          {balance.amount === 0 ? '已結清' : formatCurrency(balance.amount)}
        </p>
        <p className="text-sm opacity-80">{balanceSummary}</p>
        <button
          onClick={() => navigate('/settlement')}
          className="mt-3 flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          查看明細 <ArrowRight size={12} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="今日" amount={todayTotal} />
        <StatCard label="本週" amount={weekTotal} />
        <StatCard label="本月" amount={monthTotal} />
      </div>

      {/* Recent expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">最近紀錄</h2>
          <button
            onClick={() => navigate('/records')}
            className="text-xs text-brand-primary font-medium flex items-center gap-0.5"
          >
            全部 <ArrowRight size={12} />
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {recent.map(expense => {
              const payerName = getPersonName(expense.payerPersonId)
              return (
                <div key={expense.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryIcon(expense.categoryId)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{expense.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatDisplayDateTime(expense.date, expense.time)} · {getCategoryName(expense.categoryId)} · {payerName}付
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800">NT${expense.amount.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="card text-center">
      <p className="text-[10px] font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-brand-primary">
        {amount === 0 ? '$0' : `$${amount.toLocaleString()}`}
      </p>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="card text-center py-8">
      <p className="text-3xl mb-2">📝</p>
      <p className="text-sm font-medium text-gray-500 mb-1">還沒有任何紀錄</p>
      <p className="text-xs text-gray-400 mb-4">按下中間的 + 開始記帳</p>
      <button onClick={() => navigate('/add')} className="btn-primary text-sm px-6 py-2">
        新增第一筆
      </button>
    </div>
  )
}
