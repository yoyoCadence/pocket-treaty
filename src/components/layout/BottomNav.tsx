import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, ArrowLeftRight, List, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/',           label: '首頁',   Icon: Home           },
  { to: '/settlement', label: '分帳',   Icon: ArrowLeftRight },
  { to: '/records',    label: '明細',   Icon: List           },
  { to: '/settings',   label: '設定',   Icon: Settings       },
]

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-end max-w-lg mx-auto">
        {/* Home */}
        <NavLink to={NAV_ITEMS[0].to} end className={({ isActive }) =>
          clsx('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
               isActive ? 'text-brand-primary' : 'text-gray-400')
        }>
          <Home size={22} />
          <span className="text-[10px] font-medium">首頁</span>
        </NavLink>

        {/* Settlement */}
        <NavLink to={NAV_ITEMS[1].to} className={({ isActive }) =>
          clsx('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
               isActive ? 'text-brand-primary' : 'text-gray-400')
        }>
          <ArrowLeftRight size={22} />
          <span className="text-[10px] font-medium">分帳</span>
        </NavLink>

        {/* Centre Add button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={() => navigate('/add')}
            className="w-14 h-14 -mt-5 rounded-full bg-brand-primary shadow-lg
                       flex items-center justify-center active:scale-95 transition-transform"
            aria-label="新增支出"
          >
            <PlusCircle size={28} className="text-white" />
          </button>
          <span className="text-[10px] font-medium text-gray-400 mt-0.5">新增</span>
        </div>

        {/* Records */}
        <NavLink to={NAV_ITEMS[2].to} className={({ isActive }) =>
          clsx('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
               isActive ? 'text-brand-primary' : 'text-gray-400')
        }>
          <List size={22} />
          <span className="text-[10px] font-medium">明細</span>
        </NavLink>

        {/* Settings */}
        <NavLink to={NAV_ITEMS[3].to} className={({ isActive }) =>
          clsx('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
               isActive ? 'text-brand-primary' : 'text-gray-400')
        }>
          <Settings size={22} />
          <span className="text-[10px] font-medium">設定</span>
        </NavLink>
      </div>
    </nav>
  )
}
