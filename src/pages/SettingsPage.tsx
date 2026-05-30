import type { ReactNode } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { exportExpensesCSV, exportSettlementsCSV } from '../lib/csv'
import { Users, Tag, Store, Download, Info } from 'lucide-react'

export default function SettingsPage() {
  const { people, categories, merchants } = useAppStore()

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-brand-primary">設定</h1>

      {/* People */}
      <Section icon={<Users size={16} />} title="成員">
        <div className="space-y-2">
          {people.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                   style={{ backgroundColor: p.color }}>
                {p.name[0]}
              </div>
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              {p.isDefault && <span className="text-xs text-gray-400 ml-auto">預設</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">成員管理功能將於 Phase 7 完成</p>
      </Section>

      {/* Categories */}
      <Section icon={<Tag size={16} />} title="類別">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span key={cat.id} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-bg text-sm font-medium text-gray-700">
              {cat.icon} {cat.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">類別管理功能將於 Phase 7 完成</p>
      </Section>

      {/* Merchants */}
      <Section icon={<Store size={16} />} title="商家">
        <div className="space-y-1">
          {merchants.map(m => (
            <p key={m.id} className="text-sm text-gray-700">{m.name}</p>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">商家管理功能將於 Phase 7 完成</p>
      </Section>

      {/* Export */}
      <Section icon={<Download size={16} />} title="匯出資料">
        <div className="space-y-2">
          <button onClick={exportExpensesCSV}
            className="w-full py-2.5 rounded-xl bg-brand-bg text-sm font-semibold text-brand-primary active:scale-95 transition-transform">
            匯出消費明細 CSV
          </button>
          <button onClick={exportSettlementsCSV}
            className="w-full py-2.5 rounded-xl bg-brand-bg text-sm font-semibold text-brand-primary active:scale-95 transition-transform">
            匯出結算紀錄 CSV
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">CSV 匯出功能將於 Phase 8 完成</p>
      </Section>

      {/* About */}
      <Section icon={<Info size={16} />} title="關於">
        <p className="text-sm text-gray-600">口袋條約 Pocket Treaty</p>
        <p className="text-xs text-gray-400 mt-1">版本 0.1.0 · Mock Data 模式</p>
        <p className="text-xs text-gray-400">Supabase 同步功能將於 Phase 7 啟用</p>
      </Section>
    </div>
  )
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 text-brand-primary">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}
