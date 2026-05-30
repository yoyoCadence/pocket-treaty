import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { toast } from '../stores/useToastStore'
import { formatDisplayDateTime } from '../lib/date'
import { clsx } from 'clsx'
import { Pencil, Trash2, ChevronDown, X } from 'lucide-react'

const SPLIT_LABEL: Record<string, string> = {
  equal: '平分',
  single_person: '單人全擔',
  none: '不分帳',
  custom: '自訂',
}

export default function RecordsPage() {
  const navigate = useNavigate()
  const { expenses, people, categories, deleteExpense } = useAppStore()

  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPayer,    setFilterPayer]    = useState('all')
  const [deleteTarget,   setDeleteTarget]   = useState<string | null>(null)
  const [showFilters,    setShowFilters]    = useState(false)

  const getPersonName   = (id: string) => people.find(p => p.id === id)?.name ?? id
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id
  const getCategoryIcon = (id: string) => categories.find(c => c.id === id)?.icon ?? '📦'

  // ── Filtering ─────────────────────────────────────────────────────────
  const filtered = [...expenses]
    .filter(e => filterCategory === 'all' || e.categoryId === filterCategory)
    .filter(e => filterPayer    === 'all' || e.payerPersonId === filterPayer)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))

  const activeFilterCount =
    (filterCategory !== 'all' ? 1 : 0) + (filterPayer !== 'all' ? 1 : 0)

  function clearFilters() {
    setFilterCategory('all')
    setFilterPayer('all')
  }

  // ── Delete ────────────────────────────────────────────────────────────
  function confirmDelete() {
    if (deleteTarget) {
      const title = expenses.find(e => e.id === deleteTarget)?.title ?? '支出'
      deleteExpense(deleteTarget)
      setDeleteTarget(null)
      toast.success(`「${title}」已刪除`)
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────
  if (expenses.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-brand-primary mb-6">消費明細</h1>
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">🗂️</p>
          <p className="text-sm font-medium text-gray-500 mb-1">還沒有任何記錄</p>
          <p className="text-xs text-gray-400">按下中間的 + 開始記帳</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">消費明細</h1>
          <p className="text-xs text-gray-400 mt-0.5">共 {expenses.length} 筆</p>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
            activeFilterCount > 0
              ? 'bg-brand-primary text-white'
              : 'bg-brand-bg text-gray-600'
          )}
        >
          篩選
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown size={14} className={clsx('transition-transform', showFilters && 'rotate-180')} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card space-y-3">
          {/* Category filter */}
          <div>
            <p className="label-sm mb-2 block">類別</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                active={filterCategory === 'all'}
                onClick={() => setFilterCategory('all')}
                label="全部"
              />
              {categories.map(cat => (
                <FilterChip
                  key={cat.id}
                  active={filterCategory === cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  label={`${cat.icon} ${cat.name}`}
                />
              ))}
            </div>
          </div>

          {/* Payer filter */}
          <div>
            <p className="label-sm mb-2 block">付款者</p>
            <div className="flex gap-1.5">
              <FilterChip active={filterPayer === 'all'} onClick={() => setFilterPayer('all')} label="全部" />
              {people.filter(p => ['me', 'girlfriend'].includes(p.id)).map(p => (
                <FilterChip
                  key={p.id}
                  active={filterPayer === p.id}
                  onClick={() => setFilterPayer(p.id)}
                  label={p.name}
                />
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-danger flex items-center gap-1"
            >
              <X size={12} /> 清除篩選
            </button>
          )}
        </div>
      )}

      {/* Result count when filtering */}
      {activeFilterCount > 0 && (
        <p className="text-xs text-gray-400 px-1">
          篩選結果：{filtered.length} 筆
        </p>
      )}

      {/* Empty filter result */}
      {filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm text-gray-500">找不到符合的記錄</p>
          <button onClick={clearFilters} className="text-xs text-brand-primary mt-2">清除篩選</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(expense => (
            <div key={expense.id} className="card">
              <div className="flex items-center gap-3">
                {/* Category icon */}
                <div className="w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(expense.categoryId)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{expense.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDisplayDateTime(expense.date, expense.time)}
                    {' · '}{getCategoryName(expense.categoryId)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getPersonName(expense.payerPersonId)}付
                    {' · '}{SPLIT_LABEL[expense.splitType] ?? expense.splitType}
                  </p>
                </div>

                {/* Amount + actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="font-bold text-gray-800">
                    NT${expense.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/edit/${expense.id}`)}
                      className="p-1.5 rounded-lg text-gray-400 active:bg-gray-100 transition-colors"
                      aria-label="編輯"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(expense.id)}
                      className="p-1.5 rounded-lg text-gray-400 active:bg-red-50 active:text-brand-danger transition-colors"
                      aria-label="刪除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Note */}
              {expense.note && (
                <p className="text-xs text-gray-400 mt-2 pl-13 ml-[52px]">
                  📝 {expense.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation sheet ── */}
      {deleteTarget && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDeleteTarget(null)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto"
               style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-2" />
            <div>
              <p className="text-base font-bold text-gray-800 mb-1">刪除這筆支出？</p>
              <p className="text-sm text-gray-500">
                「{expenses.find(e => e.id === deleteTarget)?.title}」將被永久刪除，
                分帳結果也會同步更新。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-2xl bg-brand-bg text-gray-700 font-semibold text-sm"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl bg-brand-danger text-white font-semibold text-sm active:scale-95 transition-transform"
              >
                確認刪除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FilterChip({
  active, onClick, label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
        active ? 'bg-brand-primary text-white' : 'bg-brand-bg text-gray-600'
      )}
    >
      {label}
    </button>
  )
}
