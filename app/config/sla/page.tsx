'use client'

import React, { useMemo, useState } from 'react'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportSlaPolicies, downloadCsv } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Clock, Plus, ArrowLeft, Edit2, Trash2, Info, CheckCircle2,
  AlertTriangle, Zap, ToggleLeft, ToggleRight, ChevronRight,
  Building2, Tag, Search,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

interface SlaRow { priority: string; firstResponse: string; resolution: string; color: string }
interface SlaPolicy {
  id: string; name: string; description: string; active: boolean
  isDefault: boolean; appliesTo: string
  rows: SlaRow[]
  businessHours: string
  overrideCount: number
}

const SLA_POLICIES: SlaPolicy[] = [
  {
    id: 'sla-1', name: 'Standard SLA', description: 'Default policy for general tickets', active: true, isDefault: true,
    appliesTo: 'All tenants (default)', businessHours: 'Mon–Fri 09:00–18:00 IST', overrideCount: 2,
    rows: [
      { priority: 'P1 — Critical', firstResponse: '1 hour', resolution: '4 hours', color: 'text-danger' },
      { priority: 'P2 — High', firstResponse: '4 hours', resolution: '24 hours', color: 'text-warning' },
      { priority: 'P3 — Medium', firstResponse: '8 hours', resolution: '72 hours', color: 'text-info' },
      { priority: 'P4 — Low', firstResponse: '24 hours', resolution: '7 days', color: 'text-muted-foreground' },
    ],
  },
  {
    id: 'sla-2', name: 'Critical SLA', description: 'Accelerated policy for Security & P1 incidents', active: true, isDefault: false,
    appliesTo: 'Security category, P1 tickets', businessHours: '24 × 7', overrideCount: 0,
    rows: [
      { priority: 'P1 — Critical', firstResponse: '15 minutes', resolution: '2 hours', color: 'text-danger' },
      { priority: 'P2 — High', firstResponse: '1 hour', resolution: '8 hours', color: 'text-warning' },
      { priority: 'P3 — Medium', firstResponse: '4 hours', resolution: '24 hours', color: 'text-info' },
      { priority: 'P4 — Low', firstResponse: '8 hours', resolution: '3 days', color: 'text-muted-foreground' },
    ],
  },
  {
    id: 'sla-3', name: 'Finance SLA', description: 'Billing & invoice related tickets', active: true, isDefault: false,
    appliesTo: 'Billing category', businessHours: 'Mon–Fri 10:00–17:00 IST', overrideCount: 1,
    rows: [
      { priority: 'P1 — Critical', firstResponse: '2 hours', resolution: '8 hours', color: 'text-danger' },
      { priority: 'P2 — High', firstResponse: '8 hours', resolution: '48 hours', color: 'text-warning' },
      { priority: 'P3 — Medium', firstResponse: '16 hours', resolution: '5 days', color: 'text-info' },
      { priority: 'P4 — Low', firstResponse: '48 hours', resolution: '10 days', color: 'text-muted-foreground' },
    ],
  },
]

interface Override {
  id: string; tenant: string; category: string; policy: string; createdBy: string; created: string
}
const SLA_OVERRIDES: Override[] = [
  { id: 'ov-1', tenant: 'Apex Cold Chain', category: 'Technical', policy: 'Critical SLA', createdBy: 'Sneha Pillai', created: '2025-07-10' },
  { id: 'ov-2', tenant: 'Meridian Freight', category: 'Billing', policy: 'Finance SLA', createdBy: 'Sneha Pillai', created: '2025-07-05' },
  { id: 'ov-3', tenant: 'SilkRoute Express', category: 'Shipment/Tracking', policy: 'Standard SLA', createdBy: 'Arjun Mehta', created: '2025-06-28' },
]

export default function SlaPage() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState(SLA_POLICIES)
  const [expanded, setExpanded] = useState<string | null>('sla-1')
  const [activeTab, setActiveTab] = useState<'policies' | 'overrides'>('policies')
  const [search, setSearch] = useState('')

  const toggle = (id: string) => setExpanded(p => p === id ? null : id)
  const toggleActive = (id: string) => setPolicies(ps => ps.map(p => p.id === id ? { ...p, active: !p.active } : p))

  const filteredPolicies = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return policies
    return policies.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.appliesTo.toLowerCase().includes(q)
    )
  }, [policies, search])

  const filteredOverrides = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SLA_OVERRIDES
    return SLA_OVERRIDES.filter(
      (o) =>
        o.tenant.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.policy.toLowerCase().includes(q) ||
        o.createdBy.toLowerCase().includes(q)
    )
  }, [search])

  const handleExport = () => {
    if (activeTab === 'policies') {
      const rows = filteredPolicies.flatMap((policy) =>
        policy.rows.map((row) => ({
          policy: policy.name,
          priority: row.priority,
          firstResponse: row.firstResponse,
          resolution: row.resolution,
          appliesTo: policy.appliesTo,
          businessHours: policy.businessHours,
          active: policy.active,
        }))
      )
      const count = exportSlaPolicies(`sla-policies-${Date.now()}.csv`, rows)
      toast({ title: 'Export complete', description: `${count} SLA row(s) downloaded as CSV.`, variant: 'success' })
      return
    }
    const count = downloadCsv(`sla-overrides-${Date.now()}.csv`, filteredOverrides, [
      { header: 'Tenant', accessor: (o) => o.tenant },
      { header: 'Category', accessor: (o) => o.category },
      { header: 'Policy', accessor: (o) => o.policy },
      { header: 'Created By', accessor: (o) => o.createdBy },
      { header: 'Date', accessor: (o) => o.created },
    ])
    toast({ title: 'Export complete', description: `${count} override row(s) downloaded as CSV.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-4">

        <div>
          <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Configuration Hub
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-info" /> SLA Policies</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Configure first-response and resolution SLA windows per priority and category</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all shrink-0">
              <Plus className="h-4 w-4" /> New Policy
            </button>
          </div>
        </div>

        {/* Search + export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'policies' ? 'Search policies…' : 'Search overrides…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <ClearFiltersButton visible={!!search} onClear={() => setSearch('')} />
          <ListToolbarActions
            onExport={handleExport}
            exportDisabled={activeTab === 'policies' ? filteredPolicies.length === 0 : filteredOverrides.length === 0}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-0.5 w-fit">
          {(['policies', 'overrides'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-md px-4 py-1.5 text-[13px] font-medium capitalize transition-all',
                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'policies' ? 'Policies' : `Tenant Overrides (${SLA_OVERRIDES.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'policies' && (
          <div className="space-y-3">
            {filteredPolicies.map(policy => (
              <div key={policy.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <button onClick={() => toggle(policy.id)}>
                    <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform mt-0.5', expanded === policy.id && 'rotate-90')} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold">{policy.name}</span>
                      {policy.isDefault && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">Default</span>
                      )}
                      {policy.overrideCount > 0 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {policy.overrideCount} override{policy.overrideCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{policy.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{policy.appliesTo}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{policy.businessHours}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(policy.id)} className={cn('shrink-0', policy.active ? 'text-success' : 'text-muted-foreground')}>
                    {policy.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                    {!policy.isDefault && (
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>

                {expanded === policy.id && (
                  <div className="border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-border bg-muted/40">
                            {['Priority', 'First Response', 'Resolution', ''].map(h => (
                              <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {policy.rows.map(row => (
                            <tr key={row.priority} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                              <td className={cn('px-4 py-2.5 font-semibold text-[12px]', row.color)}>{row.priority}</td>
                              <td className="px-4 py-2.5 tabular-nums font-medium">{row.firstResponse}</td>
                              <td className="px-4 py-2.5 tabular-nums font-medium">{row.resolution}</td>
                              <td className="px-4 py-2.5">
                                <button className="text-[12px] text-brand hover:underline">Edit</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-border/50 px-4 py-2 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground">SLA clock pauses when status is <b>Pending Requester</b> or <b>On Hold</b>.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overrides' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-muted-foreground">Override the default policy for specific tenant + category combinations</p>
              <button className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-hover transition-all">
                <Plus className="h-3.5 w-3.5" /> Add Override
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Tenant', 'Category', 'Applied Policy', 'Created By', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOverrides.map(ov => (
                    <tr key={ov.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{ov.tenant}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ov.category}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-info-bg text-info text-[11px] font-semibold px-2 py-0.5">{ov.policy}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ov.createdBy}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{ov.created}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageContainer>
  )
}
