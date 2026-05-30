import { Routes, Route } from 'react-router-dom'
import BottomNav from '../components/layout/BottomNav'
import DashboardPage from '../pages/DashboardPage'
import AddExpensePage from '../pages/AddExpensePage'
import SettlementPage from '../pages/SettlementPage'
import RecordsPage from '../pages/RecordsPage'
import SettingsPage from '../pages/SettingsPage'

export default function App() {
  return (
    <div className="min-h-dvh bg-brand-bg flex flex-col">
      {/* Page content — padded so bottom nav doesn't cover it */}
      <main className="flex-1 pb-24 max-w-lg mx-auto w-full">
        <Routes>
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/add"         element={<AddExpensePage />} />
          <Route path="/edit/:id"    element={<AddExpensePage />} />
          <Route path="/settlement"  element={<SettlementPage />} />
          <Route path="/records"     element={<RecordsPage />} />
          <Route path="/settings"    element={<SettingsPage />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}
