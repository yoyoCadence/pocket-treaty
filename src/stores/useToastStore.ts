import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: ToastItem[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
    set(state => ({
      toasts: [...state.toasts.slice(-2), { id, message, type }],
    }))
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 2800)
  },

  dismiss: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))

// Standalone helper — call from anywhere without hooks
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error:   (message: string) => useToastStore.getState().show(message, 'error'),
  info:    (message: string) => useToastStore.getState().show(message, 'info'),
}
