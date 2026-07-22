'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QueueViewSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()
  const isBoard = pathname === '/app/queue/board'
  const isList = pathname === '/app/queue/list'

  return (
    <div className={cn('flex rounded-lg border border-border bg-muted p-0.5', className)}>
      <Link href="/app/queue/board">
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors',
            isBoard
              ? 'bg-card font-semibold text-foreground shadow-sm'
              : 'font-medium text-muted-foreground hover:text-foreground',
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Board
        </button>
      </Link>
      <Link href="/app/queue/list">
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors',
            isList
              ? 'bg-card font-semibold text-foreground shadow-sm'
              : 'font-medium text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="h-3.5 w-3.5" /> List
        </button>
      </Link>
    </div>
  )
}
