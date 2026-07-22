'use client'

import { cn } from '@/lib/utils'
import {
  CircleDot,
  PlayCircle,
  Clock,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'

export type TicketStatus =
  | 'new'
  | 'open'
  | 'pending_requester'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'reopened'

const statusConfig: Record<
  TicketStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  new: {
    label: 'New',
    icon: CircleDot,
    className: 'bg-info-bg text-info border-info/20',
  },
  open: {
    label: 'Open',
    icon: PlayCircle,
    className: 'bg-brand-subtle text-brand border-brand/20',
  },
  pending_requester: {
    label: 'Pending Reply',
    icon: Clock,
    className: 'bg-warning-bg text-warning border-warning/20',
  },
  escalated: {
    label: 'Escalated',
    icon: ArrowUpCircle,
    className: 'bg-danger-bg text-danger border-danger/20',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    className: 'bg-success-bg text-success border-success/20',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
  reopened: {
    label: 'Reopened',
    icon: RefreshCw,
    className: 'bg-warning-bg text-warning border-warning/20',
  },
}

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
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
      {config.label}
    </span>
  )
}

// Human-friendly status for the requester portal
export function HumanStatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const humanLabels: Record<TicketStatus, { label: string; className: string }> = {
    new: { label: 'Received', className: 'bg-info-bg text-info border-info/20' },
    open: { label: 'Being worked on', className: 'bg-brand-subtle text-brand border-brand/20' },
    pending_requester: { label: 'Waiting on your reply', className: 'bg-warning-bg text-warning border-warning/20' },
    escalated: { label: 'Moved to specialist team', className: 'bg-danger-bg text-danger border-danger/20' },
    resolved: { label: 'Resolved', className: 'bg-success-bg text-success border-success/20' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
    reopened: { label: 'Reopened', className: 'bg-warning-bg text-warning border-warning/20' },
  }
  const cfg = humanLabels[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] font-medium',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  )
}
