'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success-bg/90 text-success' },
  error: { icon: AlertTriangle, className: 'border-danger/30 bg-danger-bg/90 text-danger' },
  warning: { icon: AlertTriangle, className: 'border-warning/30 bg-warning-bg/90 text-warning' },
  info: { icon: Info, className: 'border-info/30 bg-info-bg/90 text-info' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...options, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const variant = t.variant ?? 'info'
            const { icon: Icon, className } = variantStyles[variant]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md',
                  className
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
