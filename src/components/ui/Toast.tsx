import { useToastStore } from '../../stores/useToastStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { clsx } from 'clsx'

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed left-4 right-4 z-[100] flex flex-col gap-2 max-w-lg mx-auto"
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl animate-toast-in',
            t.type === 'success' && 'bg-brand-primary text-white',
            t.type === 'error'   && 'bg-brand-danger text-white',
            t.type === 'info'    && 'bg-gray-800 text-white',
          )}
        >
          {t.type === 'success' && <CheckCircle2 size={16} className="flex-shrink-0" />}
          {t.type === 'error'   && <AlertCircle  size={16} className="flex-shrink-0" />}
          {t.type === 'info'    && <Info         size={16} className="flex-shrink-0" />}
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-60 hover:opacity-100 active:opacity-100 transition-opacity flex-shrink-0"
            aria-label="關閉"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
