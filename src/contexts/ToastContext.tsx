import { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (title: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((title: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, title }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
