'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { downloadCsv } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import {
  Database, Plus, ArrowLeft, Search, Edit2, Globe, Users,
  ToggleLeft, ToggleRight, Palette,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

interface Tenant {
  id: string
  name: string
  region: string
  color: string
  users: number
  ticketsOpen: number
  slaPolicy: string
  retention: string
  portalEnabled: boolean
  active: boolean
}

const TENANTS: Tenant[] = [
  { id: 't1', name: 'Meridian Freight', region: 'IN-South', color: '#2563EB', users: 124, ticketsOpen: 47, slaPolicy: 'Standard SLA', retention: '7 years', portalEnabled: true, active: true },
  { id: 't2', name: 'Hanseatic Logistics', region: 'EU-West', color: '#16A34A', users: 89, ticketsOpen: 23, slaPolicy: 'Standard SLA', retention: '5 years', portalEnabled: true, active: true },
  { id: 't3', name: 'Apex Cold Chain', region: 'IN-South', color: '#7C3AED', users: 56, ticketsOpen: 18, slaPolicy: 'Critical SLA override', retention: '7 years', portalEnabled: true, active: true },
  { id: 't4', name: 'SilkRoute Express', region: 'GCC', color: '#D97706', users: 42, ticketsOpen: 31, slaPolicy: 'Finance SLA override', retention: '3 years', portalEnabled: false, active: true },
]

export default function TenantsPage() {
  const { toast } = useToast()
  const [tenants, setTenants] = useState(TENANTS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Tenant | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tenants
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.region.toLowerCase().includes(q))
  }, [tenants, search])

  const toggleActive = (id: string) =>
    setTenants((ts) => ts.map((t) => (t.id === id ? { ...t, active: !t.active } : t)))

  const handleExport = () => {
    const count = downloadCsv(`tenants-${Date.now()}.csv`, filtered, [
      { header: 'Tenant', accessor: (t) => t.name },
      { header: 'Region', accessor: (t) => t.region },
      { header: 'Users', accessor: (t) => t.users },
      { header: 'Open Tickets', accessor: (t) => t.ticketsOpen },
      { header: 'SLA Policy', accessor: (t) => t.slaPolicy },
      { header: 'Retention', accessor: (t) => t.retention },
      { header: 'Portal', accessor: (t) => (t.portalEnabled ? 'Enabled' : 'Disabled') },
      { header: 'Active', accessor: (t) => (t.active ? 'Yes' : 'No') },
    ])
    toast({ title: 'Export complete', description: `${count} tenant(s) exported.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Configuration Hub
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Database className="h-5 w-5 text-info" /> Tenant Configuration</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage tenant profiles, portal settings, branding, and data retention</p>
          </div>
          <button
            type="button"
            onClick={() => toast({ title: 'New tenant wizard', description: 'Tenant onboarding flow would open here.', variant: 'info' })}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover shrink-0"
          >
            <Plus className="h-4 w-4" /> Add tenant
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <ClearFiltersButton visible={!!search} onClear={() => setSearch('')} />
        <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((tenant) => (
          <div
            key={tenant.id}
            className={cn(
              'rounded-xl border bg-card p-4 transition-all cursor-pointer hover:border-brand/30',
              selected?.id === tenant.id ? 'border-brand/40 ring-2 ring-brand/20' : 'border-border',
              !tenant.active && 'opacity-60',
            )}
            onClick={() => setSelected(tenant)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-[13px]" style={{ backgroundColor: tenant.color }}>
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{tenant.name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{tenant.region}</p>
                </div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleActive(tenant.id) }} className={cn(tenant.active ? 'text-success' : 'text-muted-foreground')}>
                {tenant.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-lg bg-muted/50 px-2.5 py-2"><Users className="h-3 w-3 inline mr-1 text-muted-foreground" />{tenant.users} users</div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2">{tenant.ticketsOpen} open tickets</div>
              <div className="rounded-lg bg-muted/50 px-2.5 py-2 col-span-2">SLA: {tenant.slaPolicy}</div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold flex items-center gap-2"><Palette className="h-4 w-4 text-brand" /> {selected.name} settings</h2>
            <button type="button" onClick={() => setSelected(null)} className="text-[12px] text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><span className="text-muted-foreground">Data retention</span><p className="font-medium mt-0.5">{selected.retention}</p></div>
            <div><span className="text-muted-foreground">Customer portal</span><p className="font-medium mt-0.5">{selected.portalEnabled ? 'Enabled' : 'Disabled'}</p></div>
            <div><span className="text-muted-foreground">Brand colour</span><div className="mt-1 flex items-center gap-2"><span className="h-5 w-5 rounded-full border border-border" style={{ background: selected.color }} /><span className="font-mono text-[12px]">{selected.color}</span></div></div>
            <div><span className="text-muted-foreground">Default SLA</span><p className="font-medium mt-0.5">{selected.slaPolicy}</p></div>
          </div>
          <Link href="/config/sla" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline">
            <Edit2 className="h-3.5 w-3.5" /> Manage SLA overrides
          </Link>
        </div>
      )}
    </PageContainer>
  )
}
