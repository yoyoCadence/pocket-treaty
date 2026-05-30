import { useAppStore } from '../stores/useAppStore'
import { formatDisplayDateTime } from '../lib/date'

export default function RecordsPage() {
  const { expenses, people, categories } = useAppStore()

  const sorted = [...expenses].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
  )

  const getPersonName   = (id: string) => people.find(p => p.id === id)?.name ?? id
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id
  const getCategoryIcon = (id: string) => categories.find(c => c.id === id)?.icon ?? '📦'

  if (sorted.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-brand-primary mb-6">消費明細</h1>
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">🗂️</p>
          <p className="text-sm text-gray-500">還沒有任何記錄</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-brand-primary">消費明細</h1>

      <div className="space-y-2">
        {sorted.map(expense => (
          <div key={expense.id} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center text-xl flex-shrink-0">
              {getCategoryIcon(expense.categoryId)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{expense.title}</p>
              <p className="text-xs text-gray-400">
                {formatDisplayDateTime(expense.date, expense.time)} · {getCategoryName(expense.categoryId)}
              </p>
              <p className="text-xs text-gray-400">
                {getPersonName(expense.payerPersonId)}付 · {
                  expense.splitType === 'equal' ? '平分' :
                  expense.splitType === 'single_person' ? '單人負擔' :
                  expense.splitType === 'none' ? '不分帳' : '自訂'
                }
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-800">NT${expense.amount.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        篩選、編輯、刪除功能將於 Phase 4 完成
      </p>
    </div>
  )
}
