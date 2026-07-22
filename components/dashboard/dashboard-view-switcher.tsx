'use client'

import { useEffect, useState } from 'react'
import { BarChart3, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

type DashboardView = 'overview' | 'reports'

export function DashboardViewSwitcher({ className }: { className?: string }) {
  const [view, setView] = useState<DashboardView>('overview')

  useEffect(() => {
    const sync = () => setView(window.location.hash === '#reports' ? 'reports' : 'overview')
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const goTo = (next: DashboardView) => {
    if (next === 'reports') {
      window.history.replaceState(null, '', '/app/dashboard#reports')
      setView('reports')
      document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.history.replaceState(null, '', '/app/dashboard')
    setView('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={cn('flex rounded-lg border border-border bg-muted p-0.5', className)}>
      <button
        type="button"
        onClick={() => goTo('overview')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors',
          view === 'overview'
            ? 'bg-card font-semibold text-foreground shadow-sm'
            : 'font-medium text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutDashboard className="h-3.5 w-3.5" /> Overview
      </button>
      <button
        type="button"
        onClick={() => goTo('reports')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors',
          view === 'reports'
            ? 'bg-card font-semibold text-foreground shadow-sm'
            : 'font-medium text-muted-foreground hover:text-foreground',
        )}
      >
        <BarChart3 className="h-3.5 w-3.5" /> Reports
      </button>
    </div>
  )
}

/** Scroll to reports when landing with #reports hash (e.g. bookmarked link). */
export function useDashboardHashScroll() {
  useEffect(() => {
    if (window.location.hash !== '#reports') return
    const timer = window.setTimeout(() => {
      document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [])
}
