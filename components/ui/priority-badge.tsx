'use client'

import { cn } from '@/lib/utils'
import { Flame, ArrowUp, Minus, ArrowDown } from 'lucide-react'

export type Priority = 'p1' | 'p2' | 'p3' | 'p4'

const priorityConfig: Record<
  Priority,
  { label: string; icon: React.ElementType; className: string; helper?: string }
> = {
  p1: {
    label: 'P1 Critical',
    icon: Flame,
    className: 'bg-danger-bg text-danger border-danger/30',
    helper: 'Operations are stopped',
  },
  p2: {
    label: 'P2 High',
    icon: ArrowUp,
    className: 'bg-warning-bg text-warning border-warning/30',
    helper: 'Major impact on operations',
  },
  p3: {
    label: 'P3 Normal',
    icon: Minus,
    className: 'bg-info-bg text-info border-info/30',
    helper: 'Minor impact, workaround exists',
  },
  p4: {
    label: 'P4 Low',
    icon: ArrowDown,
    className: 'bg-muted text-muted-foreground border-border',
    helper: 'No immediate impact',
  },
}

interface PriorityBadgeProps {
  priority: Priority
  className?: string
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function PriorityBadge({
  priority,
  className,
  size = 'md',
  showLabel = true,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium tabular-nums',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-[12px]',
        config.className,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {showLabel && (size === 'sm' ? priority.toUpperCase() : config.label)}
    </span>
  )
}

export function priorityHelper(priority: Priority): string {
  return priorityConfig[priority].helper || ''
}
