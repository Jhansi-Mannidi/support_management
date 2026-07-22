'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportTickets } from '@/lib/export-utils'
import { filterTickets, countSlaState, filterByRegion } from '@/lib/ticket-filters'
import type { SlaState } from '@/components/ui/sla-timer'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer } from '@/components/ui/sla-timer'
import { TierBadge } from '@/components/ui/tier-badge'
import { mockTickets } from '@/lib/mock-data'
import type { Ticket } from '@/lib/mock-data'
import type { TicketStatus } from '@/components/ui/status-badge'
import { CURRENT_USER } from '@/lib/support-team'
import { AssignToMeFlow } from '@/components/queue/assign-to-me-flow'
import { QueueViewSwitcher } from '@/components/queue/queue-view-switcher'
import {
  Filter, UserPlus, ArrowUpCircle,
  ExternalLink, MoreHorizontal, AlertTriangle, Clock, X,
  ChevronDown, SlidersHorizontal, Save, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { FlexPageContainer } from '@/components/motion/motion-primitives'
import { WorkspaceBody, WorkspacePanel, WorkspaceShell } from '@/components/layout/workspace-layout'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'

const COLUMNS: { id: TicketStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'new', label: 'New', color: 'text-info', bgColor: 'bg-info-bg' },
  { id: 'open', label: 'Open / In Progress', color: 'text-warning', bgColor: 'bg-warning-bg' },
  { id: 'pending_requester', label: 'Pending Requester', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  { id: 'escalated', label: 'Escalated', color: 'text-danger', bgColor: 'bg-danger-bg' },
  { id: 'resolved', label: 'Resolved', color: 'text-success', bgColor: 'bg-success-bg' },
]

function TicketCard({ ticket, onAssign }: { ticket: Ticket; onAssign: (id: string) => void }) {
  const isBreached = ticket.resolutionSla.state === 'breached' || ticket.firstResponseSla.state === 'breached'
  const isAtRisk = ticket.resolutionSla.state === 'at-risk' || ticket.firstResponseSla.state === 'at-risk'

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing',
        isBreached ? 'border-l-4 border-l-danger sla-pulse border-danger/30' : '',
        isAtRisk && !isBreached ? 'border-l-4 border-l-warning border-warning/20' : '',
        !isBreached && !isAtRisk ? 'border-border hover:border-brand/30' : '',
      )}
    >
      {/* Quick actions on hover */}
      <div className="absolute right-3 top-3 z-10 hidden gap-1 group-hover:flex">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAssign(ticket.id) }}
          className="rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:border-brand/30 hover:text-brand"
          aria-label="Assign to me"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
        <Link href={`/app/tickets/escalate?ticket=${ticket.id}`} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:border-danger/30 hover:text-danger"
            aria-label="Escalate"
          >
            <ArrowUpCircle className="h-3.5 w-3.5" />
          </button>
        </Link>
        <Link href={`/app/tickets/${ticket.id}`}>
          <button
            type="button"
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:text-foreground"
            aria-label="Open ticket"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

      {/* Header: ID + priority */}
      <div className="flex items-center gap-2 px-4 pt-4 pr-12">
        <span className="font-mono text-[11px] font-semibold tracking-tight text-muted-foreground" data-ticket-id>
          {ticket.id}
        </span>
        <PriorityBadge priority={ticket.priority} size="sm" showLabel={false} />
      </div>

      {/* Subject */}
      <div className="px-4 pt-3">
        <Link href={`/app/tickets/${ticket.id}`}>
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors hover:text-brand">
            {ticket.subject}
          </p>
        </Link>
      </div>

      {/* Requester + tenant */}
      <div className="mt-2.5 flex items-center gap-2 px-4 text-[11px] text-muted-foreground">
        <span className="min-w-0 truncate font-medium text-foreground/80">{ticket.requester}</span>
        <span className="shrink-0 text-border">·</span>
        <span
          className="shrink-0 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: `${ticket.tenantColor}cc` }}
        >
          {ticket.tenant.split(' ')[0]}
        </span>
      </div>

      {/* Category + tier */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-4">
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {ticket.category}
        </span>
        <TierBadge tier={ticket.currentTier} showSublabel={false} className="px-1.5 py-0.5 text-[10px]" />
      </div>

      {/* SLA — side by side for breathing room */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2.5 rounded-lg border border-border/60 bg-muted/25 p-2.5">
        <SlaTimer
          label="1st resp"
          display={ticket.firstResponseSla.display}
          state={ticket.firstResponseSla.state}
          progress={ticket.firstResponseSla.progress}
          size="sm"
          className="w-full min-w-0"
        />
        <SlaTimer
          label="Resolution"
          display={ticket.resolutionSla.display}
          state={ticket.resolutionSla.state}
          progress={ticket.resolutionSla.progress}
          size="sm"
          className="w-full min-w-0"
        />
      </div>

      {/* Footer: assignee + time */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
        {ticket.assignee ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {ticket.assigneeInitials}
            </div>
            <span className="truncate text-[12px] font-medium text-foreground">
              {ticket.assignee.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="rounded-md bg-warning-bg px-2 py-1 text-[10px] font-semibold text-warning">
            Unassigned
          </span>
        )}
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{ticket.lastActivity}</span>
      </div>
    </div>
  )
}

export default function QueueBoardPage() {
  const { toast } = useToast()
  const { region } = useAppPreferences()
  const [tickets, setTickets] = useState<Ticket[]>(() => [...mockTickets])
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterSla, setFilterSla] = useState<SlaState | ''>('')
  const [syncing, setSyncing] = useState(false)
  const [assignFlowOpen, setAssignFlowOpen] = useState(false)
  const [assignPreselectedId, setAssignPreselectedId] = useState<string | null>(null)

  const filteredTickets = useMemo(
    () =>
      filterByRegion(
        filterTickets(tickets, {
          search,
          priority: filterPriority,
          slaState: filterSla,
        }),
        region,
      ),
    [tickets, search, filterPriority, filterSla, region]
  )

  const atRiskCount = useMemo(() => countSlaState(filteredTickets, 'at-risk'), [filteredTickets])
  const breachedCount = useMemo(() => countSlaState(filteredTickets, 'breached'), [filteredTickets])

  const getColumnTickets = (status: TicketStatus) =>
    filteredTickets.filter((t) => t.status === status)

  const clearFilters = () => {
    setSearch('')
    setFilterPriority('')
    setFilterSla('')
  }

  const handleExport = () => {
    const count = exportTickets(`queue-board-${Date.now()}.csv`, filteredTickets)
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No tickets match the current filters.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} ticket(s) downloaded as CSV.`, variant: 'success' })
  }

  const handleAssignToMe = (ticketId?: string) => {
    setAssignPreselectedId(ticketId ?? null)
    setAssignFlowOpen(true)
  }

  const handleAssignComplete = (ticketIds: string[]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticketIds.includes(ticket.id)
          ? {
              ...ticket,
              assignee: CURRENT_USER.name,
              assigneeInitials: CURRENT_USER.initials,
              lastActivity: 'Just now',
            }
          : ticket,
      ),
    )
  }

  const handleAssignFlowClose = () => {
    setAssignFlowOpen(false)
    setAssignPreselectedId(null)
  }

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast({ title: 'Board synced', description: `${filteredTickets.length} ticket(s) refreshed.`, variant: 'success' })
    }, 900)
  }

  return (
    <FlexPageContainer>
      <WorkspaceShell>
        <WorkspacePanel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="page-title">My Queue</h1>
              <p className="page-subtitle">Branch Support Admin · Tier 2 · Meridian Freight — Hyderabad</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <QueueViewSwitcher />
              <button
                type="button"
                onClick={() => handleAssignToMe()}
                className="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-accent px-3 py-1.5 text-[12px] font-semibold text-brand shadow-sm transition-colors hover:bg-accent/80"
              >
                <UserPlus className="h-3.5 w-3.5" /> Assign to me
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets, requesters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-[12px] text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            {/* SLA alerts */}
            {atRiskCount > 0 && (
              <button
                onClick={() => setFilterSla(filterSla === 'at-risk' ? '' : 'at-risk')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-all',
                  filterSla === 'at-risk'
                    ? 'border-warning bg-warning-bg text-warning'
                    : 'border-warning/40 bg-warning-bg/50 text-warning hover:border-warning'
                )}
              >
                <Clock className="h-3 w-3" /> At risk ({atRiskCount})
              </button>
            )}
            {breachedCount > 0 && (
              <button
                onClick={() => setFilterSla(filterSla === 'breached' ? '' : 'breached')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-all',
                  filterSla === 'breached'
                    ? 'border-danger bg-danger-bg text-danger'
                    : 'border-danger/40 bg-danger-bg/50 text-danger hover:border-danger'
                )}
              >
                <AlertTriangle className="h-3 w-3" /> Breached ({breachedCount})
              </button>
            )}

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Priority filter */}
            {['p1', 'p2', 'p3', 'p4'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(filterPriority === p ? '' : p)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-semibold transition-all uppercase',
                  filterPriority === p
                    ? 'border-brand bg-accent text-brand'
                    : 'border-border bg-muted text-muted-foreground hover:border-brand/40 hover:text-foreground'
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}

            {(filterPriority || filterSla || search) && (
              <ClearFiltersButton visible onClear={clearFilters} />
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-[11px] text-muted-foreground sm:inline">{filteredTickets.length} tickets</span>
              <ListToolbarActions
                onExport={handleExport}
                onSync={handleSync}
                syncing={syncing}
                exportDisabled={filteredTickets.length === 0}
              />
            </div>
          </div>
        </WorkspacePanel>

        <WorkspaceBody>
          <div className="kanban-board overflow-x-auto">
            <div className="flex h-full min-h-0 w-full min-w-0 gap-3">
              {COLUMNS.map((col, colIndex) => {
                const tickets = getColumnTickets(col.id)
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: colIndex * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="kanban-column"
                  >
                  {/* Column header */}
                  <div className="flex items-center justify-between rounded-t-xl border-b border-border bg-card/50 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', col.bgColor.replace('bg-', 'bg-').replace('-bg', ''), col.color)} />
                      <span className="text-[12px] font-semibold text-foreground">{col.label}</span>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', col.bgColor, col.color)}>
                      {tickets.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin">
                    {tickets.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-[16px]">·</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">No tickets</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onAssign={handleAssignToMe} />)
                    )}
                  </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </WorkspaceBody>

        <AssignToMeFlow
          open={assignFlowOpen}
          tickets={filteredTickets}
          preselectedId={assignPreselectedId}
          onClose={handleAssignFlowClose}
          onAssign={handleAssignComplete}
        />

        <div className="shrink-0 border-t border-border bg-muted/50 px-4 py-2 text-center text-[11px] text-muted-foreground lg:hidden">
          Tip: Switch to List view for a better experience on mobile
        </div>
      </WorkspaceShell>
    </FlexPageContainer>
  )
}
