import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { todayStr, nowTimeStr } from '../lib/date'
import { suggestCategoryByTime } from '../lib/autofill'
import { formatCurrency } from '../lib/settlement'
import type { SplitType, Expense, ExpenseShare } from '../types/database'
import { clsx } from 'clsx'
import { ChevronLeft, Check } from 'lucide-react'

const SELF_ID = 'me'
const PARTNER_ID = 'girlfriend'

function generateId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function AddExpensePage() {
  const navigate = useNavigate()
  const { categories, people, addExpense } = useAppStore()

  const nowTime = nowTimeStr()
  const [amount, setAmount]       = useState('')
  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState(todayStr())
  const [time, setTime]           = useState(nowTime)
  const [categoryId, setCategoryId] = useState(suggestCategoryByTime(nowTime))
  const [payerId, setPayerId]     = useState(PARTNER_ID)
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [participants]            = useState<string[]>([SELF_ID, PARTNER_ID])
  const [note, setNote]           = useState('')

  const numAmount = parseFloat(amount) || 0

  // Preview calculation
  function getPreview(): string {
    if (numAmount <= 0) return ''
    if (splitType === 'none') return `${people.find(p => p.id === payerId)?.name}全額負擔，不分帳`
    if (splitType === 'equal') {
      const each = numAmount / participants.length
      const debtor = participants.find(p => p !== payerId)
      if (!debtor) return '全由付款者負擔'
      const debtorName = people.find(p => p.id === debtor)?.name ?? debtor
      const creditorName = people.find(p => p.id === payerId)?.name ?? payerId
      if (debtor === SELF_ID) {
        return `你欠${creditorName} ${formatCurrency(each)}`
      }
      return `${debtorName}欠你 ${formatCurrency(each)}`
    }
    if (splitType === 'single_person') {
      const debtor = participants.find(p => p !== payerId) ?? SELF_ID
      const debtorName = people.find(p => p.id === debtor)?.name ?? debtor
      const creditorName = people.find(p => p.id === payerId)?.name ?? payerId
      if (debtor === SELF_ID) return `你欠${creditorName} ${formatCurrency(numAmount)}`
      return `${debtorName}欠你 ${formatCurrency(numAmount)}`
    }
    return ''
  }

  function handleSave() {
    if (!title.trim() || numAmount <= 0) return

    const id = generateId()
    const now = new Date().toISOString()

    const shares: ExpenseShare[] = []
    if (splitType === 'equal') {
      const each = Math.round((numAmount / participants.length) * 100) / 100
      participants.forEach((pId, i) => {
        shares.push({
          id: `${id}_s${i}`,
          expenseId: id,
          personId: pId,
          shareAmount: each,
          shareRatio: 1 / participants.length,
        })
      })
    } else if (splitType === 'single_person') {
      const debtor = participants.find(p => p !== payerId) ?? SELF_ID
      shares.push({
        id: `${id}_s0`,
        expenseId: id,
        personId: debtor,
        shareAmount: numAmount,
        shareRatio: 1,
      })
    }

    const expense: Expense = {
      id,
      date,
      time,
      amount: numAmount,
      categoryId,
      merchantId: null,
      title: title.trim(),
      note: note.trim() || null,
      payerPersonId: payerId,
      splitType,
      isSettled: false,
      createdAt: now,
      updatedAt: now,
    }

    addExpense(expense, shares)
    navigate('/')
  }

  const preview = getPreview()

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-gray-500 active:bg-gray-100">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-brand-primary flex-1">新增支出</h1>
        <button
          onClick={handleSave}
          disabled={!title.trim() || numAmount <= 0}
          className={clsx(
            'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            title.trim() && numAmount > 0
              ? 'bg-brand-primary text-white active:scale-95'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          <Check size={16} /> 儲存
        </button>
      </div>

      {/* Amount */}
      <div className="card">
        <label className="label-sm mb-2 block">金額</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-400">NT$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 text-4xl font-bold text-brand-primary bg-transparent outline-none w-full"
          />
        </div>
      </div>

      {/* Title */}
      <div className="card">
        <label className="label-sm mb-2 block">項目</label>
        <input
          type="text"
          placeholder="例：火鍋、飲料、計程車"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-base font-medium text-gray-800 bg-transparent outline-none"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <label className="label-sm mb-2 block">日期</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-sm font-medium text-gray-800 bg-transparent outline-none w-full" />
        </div>
        <div className="card">
          <label className="label-sm mb-2 block">時間</label>
          <input type="time" value={time} onChange={e => { setTime(e.target.value); setCategoryId(suggestCategoryByTime(e.target.value)) }}
            className="text-sm font-medium text-gray-800 bg-transparent outline-none w-full" />
        </div>
      </div>

      {/* Category */}
      <div className="card">
        <label className="label-sm mb-3 block">類別</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={clsx(
                'flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
                categoryId === cat.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-bg text-gray-600'
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Payer */}
      <div className="card">
        <label className="label-sm mb-3 block">付款者</label>
        <div className="flex gap-2">
          {people.filter(p => [SELF_ID, PARTNER_ID].includes(p.id)).map(person => (
            <button key={person.id}
              onClick={() => setPayerId(person.id)}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                payerId === person.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-bg text-gray-600'
              )}
            >
              {person.name}
            </button>
          ))}
        </div>
      </div>

      {/* Split type */}
      <div className="card">
        <label className="label-sm mb-3 block">分帳方式</label>
        <div className="flex gap-2">
          {([
            { value: 'equal',         label: '平分' },
            { value: 'single_person', label: '單人全擔' },
            { value: 'none',          label: '不分帳' },
          ] as const).map(opt => (
            <button key={opt.value}
              onClick={() => setSplitType(opt.value)}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                splitType === opt.value
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-bg text-gray-600'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-2xl bg-brand-primary/10 border border-brand-primary/20 px-4 py-3">
          <p className="text-xs font-medium text-brand-primary/60 mb-0.5">分帳預覽</p>
          <p className="text-base font-bold text-brand-primary">{preview}</p>
        </div>
      )}

      {/* Note */}
      <div className="card">
        <label className="label-sm mb-2 block">備註（選填）</label>
        <input
          type="text"
          placeholder="新增備註..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-none"
        />
      </div>
    </div>
  )
}
