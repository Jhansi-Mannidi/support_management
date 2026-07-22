'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportFalconTickets } from '@/lib/export-utils'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer } from '@/components/ui/sla-timer'
import { TierBadge } from '@/components/ui/tier-badge'
import { mockTickets } from '@/lib/mock-data'
import {
  Zap, Shield, Globe, AlertTriangle, Clock, ArrowDownCircle,
  UserCheck, MoreHorizontal, ChevronDown, Filter, X, Info, Search
} from 'lucide-react'
import { computeFalconKpis } from '@/lib/analytics'
import { matchesRegion } from '@/lib/regions'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'
import { cn } from '@/lib/utils'
import { FlexPageContainer, MotionRow, MotionTableBody } from '@/components/motion/motion-primitives'
import { WorkspaceBody, WorkspaceHeader, WorkspaceShell, WorkspaceToolbar } from '@/components/layout/workspace-layout'

const FALCON_TICKETS = [
  {
    id: 'TKT-10440', priority: 'p1' as const, tenant: 'Hanseatic Logistics', tenantColor: '#16A34A',
    subject: 'Security: unauthorized API access attempt detected', category: 'Security',
    escalatedVia: 'Skip-level from Tier 2 · Security', timeAtFalcon: { display: '2h 14m', state: 'at-risk' as const, progress: 82 },
    assignee: 'Vikram Rao', assigneeInitials: 'VR', status: 'escalated' as const,
  },
  {
    id: 'TKT-10431', priority: 'p2' as const, tenant: 'Meridian Freight', tenantColor: '#2563EB',
    subject: 'Duplicate invoice on August billing run', category: 'Billing',
    escalatedVia: 'SLA breach Tier 3 → Falcon', timeAtFalcon: { display: 'OVERDUE 1h 12m', state: 'breached' as const, progress: 100 },
    assignee: undefined, assigneeInitials: undefined, status: 'escalated' as const,
  },
  {
    id: 'TKT-10455', priority: 'p1' as const, tenant: 'Apex Cold Chain', tenantColor: '#7C3AED',
    subject: 'Platform-wide EDI ingestion failure for 2M Alliance carrier', category: 'Technical',
    escalatedVia: 'Skip-level from Tier 3 · Platform defect', timeAtFalcon: { display: '45m', state: 'on-track' as const, progress: 40 },
    assignee: 'Neha Kapoor', assigneeInitials: 'NK', status: 'escalated' as const,
  },
  {
    id: 'TKT-10461', priority: 'p2' as const, tenant: 'SilkRoute Express', tenantColor: '#D97706',
    subject: 'GPS telemetry pipeline dropping events for GJ-14 vehicles', category: 'Technical',
    escalatedVia: 'Manual escalation Tier 3 → Falcon', timeAtFalcon: { display: '4h 02m', state: 'on-track' as const, progress: 30 },
    assignee: 'Vikram Rao', assigneeInitials: 'VR', status: 'escalated' as const,
  },
  {
    id: 'TKT-10463', priority: 'p2' as const, tenant: 'BlueSky Freight', tenantColor: '#0891B2',
    subject: 'Bulk CSV export times out for files > 50k rows', category: 'Bug',
    escalatedVia: 'SLA breach Tier 3 → Falcon', timeAtFalcon: { display: '1h 30m', state: 'on-track' as const, progress: 55 },
    assignee: undefined, assigneeInitials: undefined, status: 'escalated' as const,
  },
]

export default function FalconConsolePage() {
  const { toast } = useToast()
  const { region } = useAppPreferences()
  const [search, setSearch] = useState('')
  const [filterTenant, setFilterTenant] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [groupBy, setGroupBy] = useState(false)

  const tenants = [...new Set(FALCON_TICKETS.map((t) => t.tenant))]

  const filtered = useMemo(() => {
    return FALCON_TICKETS.filter((t) => {
      const q = search.toLowerCase()
      const matchSearch = !q || t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.tenant.toLowerCase().includes(q)
      const matchTenant = !filterTenant || t.tenant === filterTenant
      const matchCategory = !filterCategory || t.category === filterCategory
      const matchRegion = matchesRegion(t.tenant, region)
      return matchSearch && matchTenant && matchCategory && matchRegion
    })
  }, [search, filterTenant, filterCategory, region])

  const kpiTiles = useMemo(() => computeFalconKpis(filtered), [filtered])

  const clearFilters = () => {
    setSearch('')
    setFilterTenant('')
    setFilterCategory('')
  }

  const handleExport = () => {
    const count = exportFalconTickets(
      `falcon-console-${Date.now()}.csv`,
      filtered.map((t) => ({
        id: t.id,
        priority: t.priority,
        tenant: t.tenant,
        subject: t.subject,
        category: t.category,
        escalatedVia: t.escalatedVia,
        timeAtFalcon: t.timeAtFalcon.display,
        slaState: t.timeAtFalcon.state,
        assignee: t.assignee ?? 'Unassigned',
        status: t.status,
      }))
    )
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No tickets match the current filters.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} Falcon ticket(s) downloaded as CSV.`, variant: 'success' })
  }

  return (
    <FlexPageContainer>
      <WorkspaceShell>
        <WorkspaceHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h1 className="page-title">Falcon Console</h1>
                <span className="rounded-full border border-brand/30 bg-accent px-2.5 py-0.5 text-[11px] font-bold text-brand">Platform Support · Tier 4</span>
              </div>
              <p className="page-subtitle">Only tickets escalated to the Falcon tier are visible here — cross-tenant access is scope-limited and audited.</p>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {kpiTiles.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                <p className={cn('text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Safety notice */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-info/20 bg-info-bg px-3 py-2">
            <Shield className="h-3.5 w-3.5 shrink-0 text-info mt-0.5" />
            <p className="text-[12px] text-info">
              Falcon actions are logged to the audit trail. Other tenants&apos; non-escalated tickets are never visible from this console.
            </p>
          </div>
        </WorkspaceHeader>

        <WorkspaceToolbar>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, subject, tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-[12px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">All tenants</option>
            {tenants.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">All categories</option>
            {['Technical', 'Billing', 'Security', 'Bug'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || filterTenant || filterCategory) && (
            <ClearFiltersButton visible onClear={clearFilters} />
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{filtered.length} tickets</span>
            <button
              type="button"
              onClick={() => setGroupBy(!groupBy)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all',
                groupBy ? 'border-brand bg-accent text-brand' : 'border-border bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              {groupBy ? 'Ungrouped' : 'Group by tenant'}
            </button>
            <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
          </div>
        </WorkspaceToolbar>

        <WorkspaceBody className="overflow-auto scrollbar-thin">
          {/* Desktop */}
          <table className="hidden w-full min-w-[1000px] lg:table">
            <thead className="sticky top-0 z-10 border-b border-border bg-card">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ticket</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tenant</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Subject</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Escalated via</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Time at Falcon</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Assignee</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <MotionTableBody className="divide-y divide-border">
              {filtered.map((t) => (
                <MotionRow key={t.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} size="sm" showLabel={false} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/app/tickets/${t.id}`}>
                      <span className="font-mono text-[12px] font-semibold text-brand hover:underline">{t.id}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: t.tenantColor }} />
                      <span className="text-[12px] font-medium text-foreground">{t.tenant}</span>
                    </div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate text-[13px] text-foreground">{t.subject}</p>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium',
                      t.escalatedVia.includes('Security') || t.escalatedVia.includes('Skip') ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'
                    )}>
                      {t.escalatedVia}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SlaTimer label="" display={t.timeAtFalcon.display} state={t.timeAtFalcon.state} progress={t.timeAtFalcon.progress} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {t.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{t.assigneeInitials}</div>
                        <span className="text-[12px] text-foreground">{t.assignee}</span>
                      </div>
                    ) : (
                      <span className="rounded-md bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/app/tickets/${t.id}`}>
                        <button className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted">Open</button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Ticket assigned', description: `${t.id} assigned to you.`, variant: 'success' })}
                        className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                      >Assign to me</button>
                      <Link href="/falcon/impersonate">
                        <button className="rounded-md border border-warning/30 bg-warning-bg px-2 py-1 text-[11px] font-medium text-warning hover:opacity-90">Impersonate</button>
                      </Link>
                      <button className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </MotionRow>
              ))}
            </MotionTableBody>
          </table>

          {/* Mobile cards */}
          <div className="p-4 space-y-3 lg:hidden">
            {filtered.map((t) => (
              <div key={t.id} className={cn(
                'rounded-xl border bg-card p-4 space-y-3',
                t.timeAtFalcon.state === 'breached' ? 'border-l-4 border-l-danger border-danger/20' : 'border-border'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} size="sm" showLabel={false} />
                    <span className="font-mono text-[12px] text-muted-foreground">{t.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.tenantColor }} />
                    <span className="text-[12px] font-medium text-foreground">{t.tenant}</span>
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-foreground line-clamp-2">{t.subject}</p>
                <div className="flex flex-wrap gap-2">
                  <SlaTimer label="Falcon timer" display={t.timeAtFalcon.display} state={t.timeAtFalcon.state} progress={t.timeAtFalcon.progress} size="xs" />
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t.category}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/app/tickets/${t.id}`} className="flex-1">
                    <button className="w-full rounded-lg border border-border bg-muted py-2 text-[12px] font-medium text-foreground">Open ticket</button>
                  </Link>
                  <Link href="/falcon/impersonate">
                    <button className="rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-[12px] font-medium text-warning">Impersonate</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Zap className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-[16px] font-semibold text-foreground">No tickets currently escalated to Falcon</p>
              <p className="text-[13px] text-muted-foreground">All tenant tiers are resolving tickets independently. Nice work.</p>
            </div>
          )}
        </WorkspaceBody>
      </WorkspaceShell>
    </FlexPageContainer>
  )
}
