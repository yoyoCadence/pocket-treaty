import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, ArrowLeftRight, List, Settings } from 'lucide-react'
import { clsx } from 'clsx'

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm
                 border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end max-w-lg mx-auto">

        <NavTab to="/" label="首頁" end>
          {active => <Home size={22} className={active ? 'stroke-[2.5]' : ''} />}
        </NavTab>

        <NavTab to="/settlement" label="分帳">
          {active => <ArrowLeftRight size={22} className={active ? 'stroke-[2.5]' : ''} />}
        </NavTab>

        {/* Centre Add button */}
        <div className="flex-1 flex flex-col items-center pb-2">
          <button
            onClick={() => navigate('/add')}
            className="w-14 h-14 -mt-6 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/30
                       flex items-center justify-center active:scale-95 transition-transform"
            aria-label="新增支出"
          >
            <PlusCircle size={28} className="text-white" />
          </button>
          <span className="text-[10px] font-medium text-gray-400 mt-0.5 leading-none">新增</span>
        </div>

        <NavTab to="/records" label="明細">
          {active => <List size={22} className={active ? 'stroke-[2.5]' : ''} />}
        </NavTab>

        <NavTab to="/settings" label="設定">
          {active => <Settings size={22} className={active ? 'stroke-[2.5]' : ''} />}
        </NavTab>

      </div>
    </nav>
  )
}

function NavTab({
  to, label, end, children,
}: {
  to: string
  label: string
  end?: boolean
  children: (active: boolean) => React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex-1 flex flex-col items-center justify-center pt-2 pb-2 gap-0.5 transition-colors relative',
          isActive ? 'text-brand-primary' : 'text-gray-400'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active dot indicator */}
          {isActive && (
            <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-primary" />
          )}
          {children(isActive)}
          <span className={clsx(
            'text-[10px] font-medium leading-none',
            isActive ? 'font-semibold' : ''
          )}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}
