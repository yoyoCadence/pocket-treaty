import { useAppStore } from '../stores/useAppStore'
import {
  getBalanceBetween,
  formatBalanceSummary,
  formatCurrency,
  sumExpensesInRange,
  calculateExpenseDebts,
} from '../lib/settlement'
import {
  todayStr, weekStartStr, weekEndStr,
  monthStartStr, monthEndStr, formatDisplayDateTime,
} from '../lib/date'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Wallet, CalendarDays, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

const SELF_ID = 'me'
const PARTNER_ID = 'girlfriend'

export default function DashboardPage() {
  const { expenses, expenseShares, settlements, people, categories } = useAppStore()
  const navigate = useNavigate()

  const today     = todayStr()
  const todayTotal = sumExpensesInRange(expenses, today, today)
  const weekTotal  = sumExpensesInRange(expenses, weekStartStr(), weekEndStr())
  const monthTotal = sumExpensesInRange(expenses, monthStartStr(), monthEndStr())

  const balance      = getBalanceBetween(SELF_ID, PARTNER_ID, expenses, expenseShares, settlements)
  const personNames  = Object.fromEntries(people.map(p => [p.id, p.name]))
  const balanceSummary = formatBalanceSummary(balance, personNames, SELF_ID)

  // 欠出 / 收回 gross totals (before settlements)
  const allDebts = expenses.flatMap(e =>
    calculateExpenseDebts(e, expenseShares.filter(s => s.expenseId === e.id))
  )
  const iOwe    = allDebts.filter(d => d.fromPersonId === SELF_ID && d.toPersonId === PARTNER_ID)
                          .reduce((s, d) => s + d.amount, 0)
  const theyOwe = allDebts.filter(d => d.fromPersonId === PARTNER_ID && d.toPersonId === SELF_ID)
                          .reduce((s, d) => s + d.amount, 0)

  const recent = [...expenses]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5)

  const getCategoryIcon = (id: string) => categories.find(c => c.id === id)?.icon ?? '📦'
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id
  const getPersonName   = (id: string) => people.find(p => p.id === id)?.name ?? id

  const isSettled  = balance.amount === 0
  const iAmDebtor  = balance.debtorId === SELF_ID

  return (
    <div className="px-4 pt-6 space-y-4 pb-2">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">口袋條約</p>
          <h1 className="text-2xl font-bold text-brand-primary mt-0.5">總覽</h1>
        </div>
        <button
          onClick={() => navigate('/add')}
          className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center
                     shadow-md active:scale-95 transition-transform"
          aria-label="新增支出"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* ── Balance card ── */}
      <div
        className={clsx(
          'rounded-3xl p-5 text-white relative overflow-hidden',
          isSettled ? 'bg-brand-primary' :
          iAmDebtor ? 'bg-brand-danger'  : 'bg-emerald-600'
        )}
      >
        {/* Subtle background circle decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/5" />

        <p className="text-xs font-semibold opacity-60 uppercase tracking-widest mb-2 relative">
          目前結算
        </p>
        <p className="text-4xl font-bold tracking-tight mb-1 relative">
          {isSettled ? '已結清 ✓' : formatCurrency(balance.amount)}
        </p>
        <p className="text-sm opacity-85 mb-4 relative">{balanceSummary}</p>

        {/* Mini breakdown */}
        {!isSettled && (iOwe > 0 || theyOwe > 0) && (
          <div className="relative flex gap-4 pt-3 border-t border-white/20 text-xs">
            {iOwe > 0 && (
              <div>
                <p className="opacity-55 mb-0.5">我欠出</p>
                <p className="font-bold opacity-90">{formatCurrency(iOwe)}</p>
              </div>
            )}
            {theyOwe > 0 && (
              <div>
                <p className="opacity-55 mb-0.5">對方欠我</p>
                <p className="font-bold opacity-90">{formatCurrency(theyOwe)}</p>
              </div>
            )}
            {settlements.length > 0 && (
              <div>
                <p className="opacity-55 mb-0.5">已還款</p>
                <p className="font-bold opacity-90">
                  {formatCurrency(settlements.reduce((s, st) => s + st.amount, 0))}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/settlement')}
          className="relative mt-3 flex items-center gap-1 text-xs font-semibold
                     opacity-65 hover:opacity-100 active:opacity-100 transition-opacity"
        >
          查看結算明細 <ArrowRight size={12} />
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<CalendarDays size={13} />} label="今日"  amount={todayTotal} />
        <StatCard icon={<Wallet       size={13} />} label="本週"  amount={weekTotal} />
        <StatCard icon={<TrendingUp   size={13} />} label="本月"  amount={monthTotal} />
      </div>

      {/* ── Recent expenses ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">最近紀錄</h2>
          <button
            onClick={() => navigate('/records')}
            className="text-xs text-brand-primary font-semibold flex items-center gap-0.5"
          >
            全部 <ArrowRight size={12} />
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyRecords />
        ) : (
          <div className="space-y-2">
            {recent.map(expense => (
              <div
                key={expense.id}
                onClick={() => navigate('/records')}
                className="card flex items-center gap-3 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(expense.categoryId)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{expense.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDisplayDateTime(expense.date, expense.time)}
                    {' · '}{getCategoryName(expense.categoryId)}
                    {' · '}{getPersonName(expense.payerPersonId)}付
                  </p>
                </div>
                <p className="font-bold text-gray-800 flex-shrink-0 text-[15px]">
                  NT${expense.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon, label, amount,
}: {
  icon: React.ReactNode
  label: string
  amount: number
}) {
  return (
    <div className="card text-center px-3 py-3">
      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className={clsx(
        'text-base font-bold',
        amount > 0 ? 'text-brand-primary' : 'text-gray-300'
      )}>
        {amount > 0 ? `$${amount.toLocaleString()}` : '—'}
      </p>
    </div>
  )
}

function EmptyRecords() {
  const navigate = useNavigate()
  return (
    <div className="card text-center py-10">
      <div className="w-14 h-14 rounded-3xl bg-brand-bg flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">📝</span>
      </div>
      <p className="text-sm font-semibold text-gray-600 mb-1">還沒有任何紀錄</p>
      <p className="text-xs text-gray-400 mb-5">記錄你們的第一筆共同支出</p>
      <button
        onClick={() => navigate('/add')}
        className="btn-primary text-sm px-6 py-2.5 mx-auto"
      >
        新增第一筆
      </button>
    </div>
  )
}
