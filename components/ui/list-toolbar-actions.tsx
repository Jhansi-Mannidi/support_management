'use client'

import { Download, RefreshCw, Columns3, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface ListToolbarActionsProps {
  onExport: () => void
  onSync?: () => void
  syncing?: boolean
  exportDisabled?: boolean
  exportLabel?: string
  showColumns?: boolean
  onToggleColumns?: () => void
  columnsOpen?: boolean
  className?: string
}

export function ListToolbarActions({
  onExport,
  onSync,
  syncing = false,
  exportDisabled = false,
  exportLabel = 'Export',
  showColumns = false,
  onToggleColumns,
  columnsOpen = false,
  className,
}: ListToolbarActionsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showColumns && onToggleColumns && (
        <button
          type="button"
          onClick={onToggleColumns}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-all',
            columnsOpen ? 'border-brand bg-accent text-brand' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Columns3 className="h-3.5 w-3.5" />
          Columns
        </button>
      )}
      {onSync && (
        <motion.button
          type="button"
          onClick={onSync}
          disabled={syncing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
          Sync
        </motion.button>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onExport}
        disabled={exportDisabled}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {exportLabel}
      </motion.button>
    </div>
  )
}

export function ClearFiltersButton({ onClear, visible }: { onClear: () => void; visible: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.button
          type="button"
          onClick={onClear}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-danger"
        >
          <X className="h-3 w-3" /> Clear filters
        </motion.button>
      )}
    </AnimatePresence>
  )
}
