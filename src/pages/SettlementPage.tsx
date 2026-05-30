import { useState } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { toast } from '../stores/useToastStore'
import { getSettlementDetails, formatCurrency, formatBalanceSummary } from '../lib/settlement'
import { formatDisplayDate, todayStr } from '../lib/date'
import { clsx } from 'clsx'
import { Plus, ArrowRight, ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { Settlement } from '../types/database'

const SELF_ID = 'me'
const PARTNER_ID = 'girlfriend'

function generateId() {
  return `set_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function SettlementPage() {
  const { expenses, expenseShares, settlements, people, addSettlement } = useAppStore()
  const [showRepayForm, setShowRepayForm] = useState(false)
  const [repayAmount, setRepayAmount] = useState('')
  const [repayNote, setRepayNote] = useState('')
  const [showAllHistory, setShowAllHistory] = useState(false)

  const personNames: Record<string, string> = Object.fromEntries(people.map(p => [p.id, p.name]))

  const details = getSettlementDetails(SELF_ID, PARTNER_ID, expenses, expenseShares, settlements)
  const summary = formatBalanceSummary(
    { debtorId: details.debtorId, creditorId: details.creditorId, amount: details.amount },
    personNames,
    SELF_ID
  )
  const isSettled = details.amount === 0

  // Pre-fill repay form: current debtor pays creditor
  const repayFrom = details.debtorId || SELF_ID
  const repayTo   = details.creditorId || PARTNER_ID

  // Gross subtotal before settlements (all expense debts only)
  const debtEntries  = details.breakdown.filter(e => e.fromPersonId === SELF_ID)
  const creditEntries = details.breakdown.filter(e => e.toPersonId === SELF_ID)
  const grossDebt    = debtEntries.reduce((s, e) => s + e.amount, 0)
  const grossCredit  = creditEntries.reduce((s, e) => s + e.amount, 0)
  const totalRepaid  = settlements
    .filter(s => (s.fromPersonId === SELF_ID && s.toPersonId === PARTNER_ID) ||
                 (s.fromPersonId === PARTNER_ID && s.toPersonId === SELF_ID))
    .reduce((s, st) => {
      if (st.fromPersonId === SELF_ID) return s + st.amount
      return s - st.amount
    }, 0)

  // Only show last 3 history items unless expanded
  const visibleSettlements = showAllHistory ? settlements : settlements.slice(0, 3)

  function handleRepay() {
    const amount = parseFloat(repayAmount)
    if (!amount || amount <= 0) return

    const settlement: Settlement = {
      id: generateId(),
      fromPersonId: repayFrom,
      toPersonId: repayTo,
      amount,
      date: todayStr(),
      note: repayNote.trim() || null,
      createdAt: new Date().toISOString(),
    }
    addSettlement(settlement)
    toast.success(`已記錄還款 ${formatCurrency(amount)}`)
    setRepayAmount('')
    setRepayNote('')
    setShowRepayForm(false)
  }

  return (
    <div className="px-4 pt-6 space-y-4 pb-4">
      <h1 className="text-xl font-bold text-brand-primary">分帳結算</h1>

      {/* ── 淨額卡片 ── */}
      <div className={clsx(
        'rounded-3xl p-5 text-white',
        isSettled
          ? 'bg-brand-primary'
          : details.debtorId === SELF_ID
            ? 'bg-brand-danger'
            : 'bg-emerald-600'
      )}>
        <p className="text-xs font-medium opacity-70 mb-1">目前淨額</p>
        <p className="text-4xl font-bold tracking-tight mb-1">
          {isSettled ? '已結清 ✓' : formatCurrency(details.amount)}
        </p>
        <p className="text-sm opacity-85">{summary}</p>

        {/* 小計說明列 */}
        {!isSettled && (
          <div className="mt-3 pt-3 border-t border-white/20 flex gap-4 text-xs opacity-75">
            <span>欠出 {formatCurrency(grossDebt)}</span>
            <span>收回 {formatCurrency(grossCredit)}</span>
            {totalRepaid !== 0 && <span>已還 {formatCurrency(Math.abs(totalRepaid))}</span>}
          </div>
        )}
      </div>

      {/* ── 欠款明細 ── */}
      {details.breakdown.length > 0 && (
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-2">欠款明細</p>
          <div className="space-y-2">
            {[...details.breakdown]
              .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
              .map(entry => {
                const isMeOwing = entry.fromPersonId === SELF_ID
                return (
                  <div key={`${entry.expenseId}-${entry.fromPersonId}`}
                       className="card flex items-center gap-3">
                    {/* direction badge */}
                    <div className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                      isMeOwing ? 'bg-red-50' : 'bg-emerald-50'
                    )}>
                      <ArrowRight size={14} className={isMeOwing ? 'text-brand-danger' : 'text-emerald-600'} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{entry.expenseTitle}</p>
                      <p className="text-xs text-gray-400">
                        {formatDisplayDate(entry.expenseDate)} ·{' '}
                        <span className={isMeOwing ? 'text-brand-danger' : 'text-emerald-600'}>
                          {personNames[entry.fromPersonId]} → {personNames[entry.toPersonId]}
                        </span>
                      </p>
                    </div>

                    <p className={clsx(
                      'font-bold flex-shrink-0',
                      isMeOwing ? 'text-brand-danger' : 'text-emerald-600'
                    )}>
                      {isMeOwing ? '+' : '-'}{formatCurrency(entry.amount)}
                    </p>
                  </div>
                )
              })}
          </div>

          {/* 小計 bar */}
          <div className="mt-2 px-4 py-2.5 rounded-2xl bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-500">支出欠款小計</span>
            <span className="text-sm font-bold text-gray-700">
              {grossDebt - grossCredit >= 0
                ? `我欠女友 ${formatCurrency(grossDebt - grossCredit)}`
                : `女友欠我 ${formatCurrency(grossCredit - grossDebt)}`}
            </span>
          </div>
        </section>
      )}

      {/* ── 還款紀錄 ── */}
      {settlements.length > 0 && (
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-2">還款紀錄</p>
          <div className="space-y-2">
            {visibleSettlements.map(s => (
              <div key={s.id} className="card flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {personNames[s.fromPersonId]} 還 {personNames[s.toPersonId]}
                  </p>
                  {s.note && <p className="text-xs text-gray-400">{s.note}</p>}
                  <p className="text-xs text-gray-400">{formatDisplayDate(s.date)}</p>
                </div>
                <p className="font-bold text-brand-primary flex-shrink-0">
                  {formatCurrency(s.amount)}
                </p>
              </div>
            ))}
          </div>

          {settlements.length > 3 && (
            <button
              onClick={() => setShowAllHistory(v => !v)}
              className="w-full mt-2 py-2 text-xs text-gray-400 flex items-center justify-center gap-1"
            >
              {showAllHistory ? <><ChevronUp size={12} /> 收起</> : <><ChevronDown size={12} /> 查看全部 {settlements.length} 筆</>}
            </button>
          )}
        </section>
      )}

      {/* ── 新增還款 按鈕 ── */}
      {!isSettled && !showRepayForm && (
        <button
          onClick={() => setShowRepayForm(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-brand-primary/30
                     text-brand-primary font-semibold text-sm flex items-center justify-center gap-2
                     active:bg-brand-primary/5 transition-colors"
        >
          <Plus size={16} /> 新增還款
        </button>
      )}

      {/* ── 還款表單 ── */}
      {showRepayForm && (
        <div className="card space-y-4 border border-brand-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-primary">新增還款</p>
            <button
              onClick={() => { setShowRepayForm(false); setRepayAmount(''); setRepayNote('') }}
              className="text-xs text-gray-400 active:text-gray-600"
            >
              取消
            </button>
          </div>

          {/* 方向說明 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-bg">
            <span className="text-sm font-semibold text-gray-700">{personNames[repayFrom]}</span>
            <ArrowRight size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">{personNames[repayTo]}</span>
            <span className="text-xs text-gray-400 ml-1">還款</span>
          </div>

          {/* 金額 */}
          <div>
            <label className="label-sm mb-1 block">還款金額</label>
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="text-lg font-bold text-gray-400">NT$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                className="flex-1 text-3xl font-bold text-brand-primary bg-transparent outline-none"
                autoFocus
              />
            </div>
            {/* 快速金額按鈕 */}
            {details.amount > 0 && (
              <div className="flex gap-2 mt-2">
                {[details.amount, Math.ceil(details.amount / 2), 100, 500]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0)
                  .slice(0, 4)
                  .map(v => (
                    <button key={v}
                      onClick={() => setRepayAmount(String(v))}
                      className="flex-1 py-1.5 rounded-xl bg-brand-bg text-xs font-semibold text-brand-primary active:bg-brand-primary/10"
                    >
                      {v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 備註 */}
          <div>
            <label className="label-sm mb-1 block">備註（選填）</label>
            <input
              type="text"
              placeholder="例：Line Pay 轉帳、現金..."
              value={repayNote}
              onChange={e => setRepayNote(e.target.value)}
              className="w-full text-sm text-gray-700 bg-transparent outline-none border-b border-gray-200 pb-2"
            />
          </div>

          <button
            onClick={handleRepay}
            disabled={!repayAmount || parseFloat(repayAmount) <= 0}
            className={clsx(
              'w-full py-3 rounded-2xl font-semibold text-sm transition-all',
              repayAmount && parseFloat(repayAmount) > 0
                ? 'bg-brand-primary text-white active:scale-95'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            確認還款
          </button>
        </div>
      )}

      {/* ── 全部結清 ── */}
      {isSettled && (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm font-semibold text-gray-700 mb-1">帳目已結清，太棒了！</p>
          <p className="text-xs text-gray-400">繼續記錄下一次的消費</p>
        </div>
      )}
    </div>
  )
}
