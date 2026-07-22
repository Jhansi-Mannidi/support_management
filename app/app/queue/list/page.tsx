'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader } from '@/components/ui/page-header'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { listItemVariants } from '@/lib/motion'
import { exportTickets } from '@/lib/export-utils'
import { filterTickets, countSlaState, filterByRegion } from '@/lib/ticket-filters'
import type { SlaState } from '@/components/ui/sla-timer'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer } from '@/components/ui/sla-timer'
import { TierBadge } from '@/components/ui/tier-badge'
import { mockTickets } from '@/lib/mock-data'
import type { Ticket } from '@/lib/mock-data'
import {
  Search, UserPlus, ArrowUpCircle,
  ChevronDown, ChevronUp, AlertTriangle,
  Clock, X, Columns,
  Rows, CheckSquare, Square, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlexPageContainer } from '@/components/motion/motion-primitives'
import { WorkspaceBody, WorkspaceShell, WorkspaceToolbar } from '@/components/layout/workspace-layout'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'
import {
  BulkTicketActions,
  type BulkActionPayload,
  type BulkActionType,
} from '@/components/queue/bulk-ticket-actions'
import { QueueViewSwitcher } from '@/components/queue/queue-view-switcher'
import type { TierLevel } from '@/components/ui/tier-badge'
import type { Priority } from '@/components/ui/priority-badge'
import { CURRENT_USER } from '@/lib/support-team'
import {
  TicketRowActionsMenu,
  type RowActionType,
} from '@/components/queue/ticket-row-actions-menu'

type SortKey = 'id' | 'priority' | 'firstResponseSla' | 'resolutionSla' | 'lastActivity'
type SortDir = 'asc' | 'desc'

type ColumnKey = 'category' | 'status' | 'tier' | 'firstResponseSla' | 'resolutionSla' | 'assignee' | 'lastActivity'

const COLUMN_LABELS: Record<ColumnKey, string> = {
  category: 'Category',
  status: 'Status',
  tier: 'Tier',
  firstResponseSla: '1st Resp SLA',
  resolutionSla: 'Resolution SLA',
  assignee: 'Assignee',
  lastActivity: 'Last activity',
}

const DEFAULT_COLUMNS: Record<ColumnKey, boolean> = {
  category: true,
  status: true,
  tier: true,
  firstResponseSla: true,
  resolutionSla: true,
  assignee: true,
  lastActivity: true,
}

const PRIORITY_ORDER: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4 }

function sortTickets(tickets: Ticket[], key: SortKey, dir: SortDir): Ticket[] {
  return [...tickets].sort((a, b) => {
    let va: number | string = 0
    let vb: number | string = 0
    if (key === 'priority') { va = PRIORITY_ORDER[a.priority]; vb = PRIORITY_ORDER[b.priority] }
    else if (key === 'firstResponseSla') { va = a.firstResponseSla.progress; vb = b.firstResponseSla.progress }
    else if (key === 'resolutionSla') { va = a.resolutionSla.progress; vb = b.resolutionSla.progress }
    else if (key === 'id') { va = a.id; vb = b.id }
    else { va = a.lastActivity; vb = b.lastActivity }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })
}

function SortHeader({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th
      className="cursor-pointer whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground select-none"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : (
          <span className="h-3 w-3 opacity-0 group-hover:opacity-50">↕</span>
        )}
      </span>
    </th>
  )
}

function ticketNeedsSlaAttention(ticket: Ticket): boolean {
  return (
    ticket.resolutionSla.state === 'at-risk' ||
    ticket.resolutionSla.state === 'breached' ||
    ticket.firstResponseSla.state === 'at-risk' ||
    ticket.firstResponseSla.state === 'breached'
  )
}

function QueueListContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { region } = useAppPreferences()
  const [tickets, setTickets] = useState<Ticket[]>(() => [...mockTickets])
  const [selected, setSelected] = useState<string[]>([])
  const [activeAction, setActiveAction] = useState<BulkActionType | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('resolutionSla')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterSla, setFilterSla] = useState<SlaState | ''>('')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [syncing, setSyncing] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS)
  const [slaAttention, setSlaAttention] = useState(false)
  const [fromDashboard, setFromDashboard] = useState(false)

  useEffect(() => {
    const sla = searchParams.get('sla')
    const from = searchParams.get('from')
    if (sla === 'attention') {
      setSlaAttention(true)
      setFilterSla('')
    } else if (sla === 'at-risk' || sla === 'breached') {
      setFilterSla(sla)
      setSlaAttention(false)
    }
    if (from === 'dashboard') {
      setFromDashboard(true)
      toast({
        title: 'SLA focus view',
        description: 'Showing tickets that need immediate attention from your dashboard.',
        variant: 'info',
      })
    }
  }, [searchParams, toast])

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('desc') }
  }

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((t) => t.id))

  const baseFiltered = useMemo(() => {
    let result = filterByRegion(
      filterTickets(tickets, {
        search,
        priority: filterPriority,
        slaState: slaAttention ? '' : filterSla,
      }),
      region,
    )
    if (slaAttention) {
      result = result.filter(ticketNeedsSlaAttention)
    }
    return result
  }, [tickets, search, filterPriority, filterSla, slaAttention, region])

  const filtered = useMemo(
    () => sortTickets(baseFiltered, sortKey, sortDir),
    [baseFiltered, sortKey, sortDir]
  )

  const atRiskCount = useMemo(() => countSlaState(baseFiltered, 'at-risk'), [baseFiltered])
  const breachedCount = useMemo(() => countSlaState(baseFiltered, 'breached'), [baseFiltered])

  const clearFilters = () => {
    setSearch('')
    setFilterPriority('')
    setFilterSla('')
    setSlaAttention(false)
    setFromDashboard(false)
  }

  const handleExport = () => {
    const rows = selected.length > 0 ? filtered.filter((t) => selected.includes(t.id)) : filtered
    const count = exportTickets(`queue-${Date.now()}.csv`, rows)
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No tickets match the current filters.', variant: 'warning' })
      return
    }
    toast({
      title: 'Export complete',
      description: `${count} ticket(s) downloaded as CSV${selected.length ? ' (selection)' : ''}.`,
      variant: 'success',
    })
  }

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast({ title: 'Queue synced', description: `${filtered.length} ticket(s) up to date.`, variant: 'success' })
    }, 900)
  }

  const toggleColumn = (key: ColumnKey) =>
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))

  const selectedTickets = useMemo(
    () => tickets.filter((t) => selected.includes(t.id)),
    [tickets, selected],
  )

  const handleBulkConfirm = (payload: BulkActionPayload) => {
    const ids = [...selected]
    let updatedCount = 0

    setTickets((prev) =>
      prev.map((ticket) => {
        if (!ids.includes(ticket.id)) return ticket

        if (payload.type === 'assign') {
          updatedCount++
          return {
            ...ticket,
            assignee: payload.assignee,
            assigneeInitials: payload.assigneeInitials,
            lastActivity: 'Just now',
          }
        }

        if (payload.type === 'escalate') {
          if (ticket.currentTier >= 4) return ticket
          updatedCount++
          const nextTier = Math.min(ticket.currentTier + 1, 4) as TierLevel
          return {
            ...ticket,
            status: 'escalated',
            currentTier: nextTier,
            lastActivity: 'Just now',
          }
        }

        if (payload.type === 'priority') {
          updatedCount++
          return { ...ticket, priority: payload.priority, lastActivity: 'Just now' }
        }

        if (payload.type === 'close') {
          if (ticket.status === 'closed' || ticket.status === 'resolved') return ticket
          updatedCount++
          return {
            ...ticket,
            status: 'closed',
            resolutionSla: { display: 'Met', state: 'met', progress: 100 },
            lastActivity: 'Just now',
          }
        }

        return ticket
      }),
    )

    const messages: Record<BulkActionPayload['type'], { title: string; description: string }> = {
      assign: {
        title: 'Tickets assigned',
        description: `${updatedCount} ticket(s) assigned to ${payload.assignee}.`,
      },
      escalate: {
        title: 'Tickets escalated',
        description: `${updatedCount} ticket(s) escalated to Tier ${payload.targetTier}. Reason: ${payload.reason}`,
      },
      priority: {
        title: 'Priority updated',
        description: `${updatedCount} ticket(s) set to ${payload.priority.toUpperCase()}.`,
      },
      close: {
        title: 'Tickets closed',
        description: `${updatedCount} ticket(s) resolved and closed${payload.notifyRequester ? '. Requesters notified.' : '.'}`,
      },
    }

    toast({ ...messages[payload.type], variant: 'success' })
    setSelected([])
    setActiveAction(null)
  }

  const bulkActions: { id: BulkActionType; label: string }[] = [
    { id: 'assign', label: 'Assign' },
    { id: 'escalate', label: 'Escalate' },
    { id: 'priority', label: 'Change priority' },
    { id: 'close', label: 'Close' },
  ]

  const openRowBulkAction = (ticketId: string, action: RowActionType) => {
    setSelected([ticketId])
    setActiveAction(action)
  }

  const handleRowAssignToMe = (ticket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              assignee: CURRENT_USER.name,
              assigneeInitials: CURRENT_USER.initials,
              lastActivity: 'Just now',
            }
          : t,
      ),
    )
  }

  const handleRowChangePriority = (ticket: Ticket, priority: Priority) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, priority, lastActivity: 'Just now' } : t)),
    )
  }

  const handleRowMarkPending = (ticket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              status: 'pending_requester',
              firstResponseSla: { display: 'Paused', state: 'paused', progress: 0 },
              resolutionSla: { display: 'Paused', state: 'paused', progress: 0 },
              lastActivity: 'Just now',
            }
          : t,
      ),
    )
  }

  const handleRowResolve = (ticket: Ticket, _note: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              status: 'resolved',
              resolutionSla: { display: 'Met', state: 'met', progress: 100 },
              lastActivity: 'Just now',
            }
          : t,
      ),
    )
  }

  const handleRowAddNote = (ticket: Ticket, _note: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, lastActivity: 'Just now' } : t)),
    )
  }

  return (
    <FlexPageContainer>
      <WorkspaceShell>
        <PageHeader
          title="My Queue"
          description="Branch Support Admin · Tier 2 · Meridian Freight — Hyderabad"
          actions={
            <div className="flex items-center gap-2">
              <QueueViewSwitcher />
            </div>
          }
        />

        {fromDashboard && (slaAttention || filterSla) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-0 mt-0 rounded-xl border border-danger/30 bg-gradient-to-r from-danger-bg/80 via-warning-bg/40 to-card px-4 py-3 lg:mx-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">SLA attention queue</p>
                  <p className="text-[12px] text-muted-foreground">
                    {filtered.length} ticket{filtered.length !== 1 ? 's' : ''} breached or at-risk · filtered from dashboard
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/app/dashboard">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
                >
                  Clear SLA filter
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <WorkspaceToolbar>
          <div className="flex flex-wrap items-center gap-2 w-full">
            <button
              onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
              title={`Switch to ${density === 'comfortable' ? 'compact' : 'comfortable'} density`}
            >
              {density === 'comfortable' ? <Rows className="h-3.5 w-3.5" /> : <Columns className="h-3.5 w-3.5" />}
            </button>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets, requesters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-[12px] text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {atRiskCount > 0 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={() => setFilterSla(filterSla === 'at-risk' ? '' : 'at-risk')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-all',
                  filterSla === 'at-risk'
                    ? 'border-warning bg-warning-bg text-warning'
                    : 'border-warning/40 bg-warning-bg/50 text-warning hover:border-warning'
                )}
              >
                <Clock className="h-3 w-3" /> At risk ({atRiskCount})
              </motion.button>
            )}
            {breachedCount > 0 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={() => setFilterSla(filterSla === 'breached' ? '' : 'breached')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-all',
                  filterSla === 'breached'
                    ? 'border-danger bg-danger-bg text-danger'
                    : 'border-danger/40 bg-danger-bg/50 text-danger hover:border-danger'
                )}
              >
                <AlertTriangle className="h-3 w-3" /> Breached ({breachedCount})
              </motion.button>
            )}

            <div className="flex gap-1">
              {['p1', 'p2', 'p3', 'p4'].map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterPriority(filterPriority === p ? '' : p)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase transition-all',
                    filterPriority === p ? 'border-brand bg-accent text-brand' : 'border-border text-muted-foreground hover:border-brand/40'
                  )}
                >
                  {p.toUpperCase()}
                </motion.button>
              ))}
            </div>

            <ClearFiltersButton visible={!!(search || filterPriority || filterSla || slaAttention)} onClear={clearFilters} />

            <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{filtered.length} tickets</span>
              <ListToolbarActions
                onExport={handleExport}
                onSync={handleSync}
                syncing={syncing}
                exportDisabled={filtered.length === 0}
                showColumns
                columnsOpen={columnsOpen}
                onToggleColumns={() => setColumnsOpen((o) => !o)}
              />
            </div>
          </div>

          <AnimatePresence>
            {columnsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-border/60 pt-2"
              >
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleColumn(key)}
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all',
                        visibleColumns[key]
                          ? 'border-brand bg-accent text-brand'
                          : 'border-border text-muted-foreground hover:border-brand/40'
                      )}
                    >
                      {COLUMN_LABELS[key]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </WorkspaceToolbar>

        {/* Bulk action bar */}
        <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border bg-accent/60"
          >
          <div className="flex items-center gap-3 px-4 py-2.5 lg:px-5">
            <span className="text-[13px] font-semibold text-brand">{selected.length} selected</span>
            <div className="h-4 w-px bg-brand/20" />
            {bulkActions.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveAction(id)}
                className="rounded-md border border-brand/30 px-3 py-1 text-[12px] font-medium text-brand hover:bg-accent"
              >
                {label}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="ml-auto text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="h-3 w-3" /> Clear selection
            </button>
          </div>
          </motion.div>
        )}
        </AnimatePresence>

        <BulkTicketActions
          action={activeAction}
          selectedTickets={selectedTickets}
          onClose={() => setActiveAction(null)}
          onConfirm={handleBulkConfirm}
        />

        <WorkspaceBody className="overflow-auto scrollbar-thin">
        <div className="hidden min-w-0 lg:block">
          <table className="w-full min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-card border-b border-border">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                    {selected.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-brand" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <SortHeader label="Priority" sortKey="priority" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Ticket ID" sortKey="id" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                {visibleColumns.category && (
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                )}
                {visibleColumns.status && (
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                )}
                {visibleColumns.tier && (
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tier</th>
                )}
                {visibleColumns.firstResponseSla && (
                  <SortHeader label="1st Resp SLA" sortKey="firstResponseSla" current={sortKey} dir={sortDir} onSort={handleSort} />
                )}
                {visibleColumns.resolutionSla && (
                  <SortHeader label="Resolution SLA" sortKey="resolutionSla" current={sortKey} dir={sortDir} onSort={handleSort} />
                )}
                {visibleColumns.assignee && (
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Assignee</th>
                )}
                {visibleColumns.lastActivity && (
                  <SortHeader label="Last activity" sortKey="lastActivity" current={sortKey} dir={sortDir} onSort={handleSort} />
                )}
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ticket, index) => {
                const isSelected = selected.includes(ticket.id)
                const isBreached = ticket.resolutionSla.state === 'breached'
                return (
                  <motion.tr
                    key={ticket.id}
                    initial="hidden"
                    animate="visible"
                    variants={listItemVariants}
                    transition={{ delay: index * 0.03 }}
                    layout
                    className={cn(
                      'group transition-colors hover:bg-muted/30',
                      isSelected && 'bg-accent/30',
                      isBreached && 'bg-danger-bg/10'
                    )}
                  >
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(ticket.id)} className="text-muted-foreground hover:text-foreground">
                        {isSelected ? <CheckSquare className="h-4 w-4 text-brand" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <PriorityBadge priority={ticket.priority} size="sm" showLabel={false} />
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/app/tickets/${ticket.id}`}>
                        <span className="font-mono text-[12px] font-semibold text-brand hover:underline">{ticket.id}</span>
                      </Link>
                    </td>
                    <td className="max-w-[240px] px-3 py-3">
                      <Link href={`/app/tickets/${ticket.id}`}>
                        <p className="truncate text-[13px] font-medium text-foreground hover:text-brand">{ticket.subject}</p>
                      </Link>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {ticket.requester} · {ticket.tenant}
                      </p>
                    </td>
                    {visibleColumns.category && (
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{ticket.category}</span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-3 py-3">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>
                    )}
                    {visibleColumns.tier && (
                      <td className="px-3 py-3">
                        <TierBadge tier={ticket.currentTier} size="sm" />
                      </td>
                    )}
                    {visibleColumns.firstResponseSla && (
                      <td className={cn('px-3 py-3', density === 'compact' ? 'py-2' : '')}>
                        <SlaTimer
                          label=""
                          display={ticket.firstResponseSla.display}
                          state={ticket.firstResponseSla.state}
                          progress={ticket.firstResponseSla.progress}
                          size="sm"
                        />
                      </td>
                    )}
                    {visibleColumns.resolutionSla && (
                      <td className="px-3 py-3">
                        <SlaTimer
                          label=""
                          display={ticket.resolutionSla.display}
                          state={ticket.resolutionSla.state}
                          progress={ticket.resolutionSla.progress}
                          size="sm"
                        />
                      </td>
                    )}
                    {visibleColumns.assignee && (
                      <td className="px-3 py-3">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                              {ticket.assigneeInitials}
                            </div>
                            <span className="text-[12px] text-foreground">{ticket.assignee?.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.lastActivity && (
                      <td className="px-3 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{ticket.lastActivity}</td>
                    )}
                    <td className="px-3 py-3">
                      <TicketRowActionsMenu
                        ticket={ticket}
                        onOpenBulkAction={openRowBulkAction}
                        onAssignToMe={handleRowAssignToMe}
                        onChangePriority={handleRowChangePriority}
                        onMarkPending={handleRowMarkPending}
                        onResolve={handleRowResolve}
                        onAddNote={handleRowAddNote}
                      />
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 lg:hidden">
          {filtered.map((ticket) => {
            const isBreached = ticket.resolutionSla.state === 'breached'
            const isAtRisk = ticket.resolutionSla.state === 'at-risk'
            return (
              <div
                key={ticket.id}
                className={cn(
                  'relative rounded-xl border bg-card p-4 transition-all',
                  isBreached ? 'border-l-4 border-l-danger border-danger/20' : '',
                  isAtRisk && !isBreached ? 'border-l-4 border-l-warning border-warning/20' : '',
                  !isBreached && !isAtRisk ? 'border-border hover:border-brand/30' : '',
                )}
              >
                <div className="absolute right-3 top-3">
                  <TicketRowActionsMenu
                    ticket={ticket}
                    onOpenBulkAction={openRowBulkAction}
                    onAssignToMe={handleRowAssignToMe}
                    onChangePriority={handleRowChangePriority}
                    onMarkPending={handleRowMarkPending}
                    onResolve={handleRowResolve}
                    onAddNote={handleRowAddNote}
                  />
                </div>
                <Link href={`/app/tickets/${ticket.id}`}>
                  <div className="flex items-start justify-between gap-8 pr-6">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={ticket.priority} size="sm" showLabel={false} />
                      <span className="font-mono text-[12px] text-muted-foreground">{ticket.id}</span>
                    </div>
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-foreground line-clamp-2">{ticket.subject}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SlaTimer label="1st resp" display={ticket.firstResponseSla.display} state={ticket.firstResponseSla.state} progress={ticket.firstResponseSla.progress} size="xs" />
                    <SlaTimer label="Resolution" display={ticket.resolutionSla.display} state={ticket.resolutionSla.state} progress={ticket.resolutionSla.progress} size="xs" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{ticket.requester}</span>
                    <span>{ticket.lastActivity}</span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
        </WorkspaceBody>
      </WorkspaceShell>
    </FlexPageContainer>
  )
}

export default function QueueListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      }
    >
      <QueueListContent />
    </Suspense>
  )
}
