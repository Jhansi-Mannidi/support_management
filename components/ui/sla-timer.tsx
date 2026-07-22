'use client'

import { cn } from '@/lib/utils'
import { Clock, PauseCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

export type SlaState = 'on-track' | 'at-risk' | 'breached' | 'paused' | 'met'

interface SlaTimerProps {
  label?: string
  display: string
  state: SlaState
  className?: string
  size?: 'xs' | 'sm' | 'md'
  progress?: number // 0-100
}

const stateConfig: Record<SlaState, { icon: React.ElementType; className: string }> = {
  'on-track': { icon: Clock, className: 'bg-success-bg text-success border-success/20' },
  'at-risk':  { icon: AlertTriangle, className: 'bg-warning-bg text-warning border-warning/20' },
  breached:   { icon: AlertTriangle, className: 'bg-danger-bg text-danger border-danger/25 sla-pulse' },
  paused:     { icon: PauseCircle, className: 'bg-muted text-muted-foreground border-border' },
  met:        { icon: CheckCircle2, className: 'bg-success-bg text-success border-success/20' },
}

export function SlaTimer({ label, display, state, className, size = 'md', progress }: SlaTimerProps) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-1 rounded-lg border',
        size === 'xs' ? 'px-2 py-1.5' : size === 'sm' ? 'px-2.5 py-2' : 'px-2.5 py-1.5',
        config.className,
        className
      )}
      data-timer
    >
      {label && (
        <span className={cn('font-medium uppercase tracking-wide opacity-70', size === 'xs' ? 'text-[9px]' : 'text-[10px]')}>
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <Icon className={size === 'xs' ? 'h-2.5 w-2.5 shrink-0' : size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
        <span className={cn('min-w-0 truncate font-mono font-semibold tabular-nums', size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-[11px]' : 'text-[13px]')}>
          {display}
        </span>
      </div>
      {progress !== undefined && state !== 'paused' && state !== 'met' && (
        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-current/20">
          <div
            className="h-full rounded-full bg-current transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Compact inline badge variant for tables & dashboards
export function SlaBadge({ state, display, size = 'sm' }: { state: SlaState; display: string; size?: 'xs' | 'sm' }) {
  return <SlaTimer display={display} state={state} size={size} />
}
