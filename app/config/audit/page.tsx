'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { downloadCsv } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, ArrowLeft, Search, Filter, User, Settings,
  Shield, Tag, Zap, Clock,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

interface AuditEntry {
  id: string
  action: string
  actor: string
  target: string
  category: 'config' | 'role' | 'sla' | 'escalation' | 'security'
  time: string
  ip: string
}

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', action: 'Updated SLA policy "Finance SLA"', actor: 'Sneha Pillai', target: 'Billing category', category: 'sla', time: '2 hours ago', ip: '10.0.4.22' },
  { id: 'a2', action: 'Added team member invite', actor: 'Sneha Pillai', target: 'kiran.bose@meridianfreight.com', category: 'role', time: '5 hours ago', ip: '10.0.4.22' },
  { id: 'a3', action: 'Modified auto-escalation rule #3', actor: 'Arjun Mehta', target: 'Resolution SLA At-Risk', category: 'escalation', time: 'Yesterday', ip: '10.0.4.18' },
  { id: 'a4', action: 'Created category "Compliance"', actor: 'Sneha Pillai', target: 'Categories', category: 'config', time: 'Yesterday', ip: '10.0.4.22' },
  { id: 'a5', action: 'Falcon impersonation session started', actor: 'Vikram Rao', target: 'Meridian Freight / Priya Nair', category: 'security', time: '2 days ago', ip: '172.16.8.4' },
  { id: 'a6', action: 'Disabled notification template', actor: 'Sneha Pillai', target: 'CSAT Reminder', category: 'config', time: '3 days ago', ip: '10.0.4.22' },
  { id: 'a7', action: 'Updated role permissions', actor: 'Sneha Pillai', target: 'Branch Support Admin', category: 'role', time: 'Jul 18', ip: '10.0.4.22' },
  { id: 'a8', action: 'Tenant SLA override added', actor: 'Sneha Pillai', target: 'Apex Cold Chain', category: 'sla', time: 'Jul 10', ip: '10.0.4.22' },
]

const CATEGORY_CONFIG = {
  config: { icon: Settings, color: 'text-brand bg-brand/10', label: 'Configuration' },
  role: { icon: User, color: 'text-info bg-info-bg', label: 'Role' },
  sla: { icon: Clock, color: 'text-warning bg-warning-bg', label: 'SLA' },
  escalation: { icon: Zap, color: 'text-danger bg-danger-bg', label: 'Escalation' },
  security: { icon: Shield, color: 'text-success bg-success-bg', label: 'Security' },
}

export default function AuditPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return AUDIT_LOG.filter((e) => {
      const matchSearch = !q || e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || e.target.toLowerCase().includes(q)
      const matchCategory = !categoryFilter || e.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [search, categoryFilter])

  const handleExport = () => {
    const count = downloadCsv(`audit-log-${Date.now()}.csv`, filtered, [
      { header: 'Action', accessor: (e) => e.action },
      { header: 'Actor', accessor: (e) => e.actor },
      { header: 'Target', accessor: (e) => e.target },
      { header: 'Category', accessor: (e) => e.category },
      { header: 'Time', accessor: (e) => e.time },
      { header: 'IP Address', accessor: (e) => e.ip },
    ])
    toast({ title: 'Export complete', description: `${count} audit entries exported.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Configuration Hub
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> Audit Log</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Immutable record of configuration changes, role updates, and admin actions</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actions, actors, targets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium outline-none"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <ClearFiltersButton visible={!!(search || categoryFilter)} onClear={() => { setSearch(''); setCategoryFilter('') }} />
        <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-muted-foreground">No audit entries match your filters.</div>
          ) : filtered.map((entry) => {
            const cfg = CATEGORY_CONFIG[entry.category]
            const Icon = cfg.icon
            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{entry.action}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{entry.actor}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{entry.target}</span>
                    <span>·</span>
                    <span>{entry.time}</span>
                    <span>·</span>
                    <span className="font-mono">{entry.ip}</span>
                  </div>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-info/20 bg-info-bg/40 px-4 py-3 text-[12px] text-info">
        <Filter className="h-4 w-4 shrink-0 mt-0.5" />
        Audit entries are retained for 7 years and cannot be modified or deleted.
      </div>
    </PageContainer>
  )
}
