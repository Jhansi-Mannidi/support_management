'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { downloadCsv } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import {
  Users, Plus, ArrowLeft, Search, Edit2, Mail, Clock,
  ToggleLeft, ToggleRight, Shield,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  tier: number
  initials: string
  active: boolean
  capacity: number
  assigned: number
  hours: string
}

const MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Arjun Mehta', email: 'arjun.mehta@meridianfreight.com', role: 'Branch Support Admin', tier: 2, initials: 'AM', active: true, capacity: 40, assigned: 38, hours: 'Mon–Fri 09:00–18:00' },
  { id: 'm2', name: 'Sneha Pillai', email: 'sneha.pillai@meridianfreight.com', role: 'Tenant Admin', tier: 3, initials: 'SP', active: true, capacity: 45, assigned: 41, hours: 'Mon–Fri 09:00–18:00' },
  { id: 'm3', name: 'Devika Rao', email: 'devika.rao@meridianfreight.com', role: 'Branch Support Admin', tier: 2, initials: 'DR', active: true, capacity: 35, assigned: 29, hours: 'Mon–Fri 10:00–19:00' },
  { id: 'm4', name: 'Kiran Bose', email: 'kiran.bose@meridianfreight.com', role: 'Dept Support Admin', tier: 1, initials: 'KB', active: true, capacity: 30, assigned: 33, hours: 'Mon–Sat 08:00–17:00' },
  { id: 'm5', name: 'Vikram Rao', email: 'vikram.rao@voltuswave.com', role: 'Falcon Engineer', tier: 4, initials: 'VR', active: true, capacity: 25, assigned: 22, hours: '24 × 7 on-call' },
  { id: 'm6', name: 'Neha Kapoor', email: 'neha.kapoor@voltuswave.com', role: 'Falcon Engineer', tier: 4, initials: 'NK', active: true, capacity: 25, assigned: 18, hours: 'Mon–Fri 09:00–18:00 IST' },
  { id: 'm7', name: 'Priya Nair', email: 'priya.nair@meridianfreight.com', role: 'Requester', tier: 0, initials: 'PN', active: false, capacity: 0, assigned: 0, hours: '—' },
]

const TIER_COLORS: Record<number, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-info-bg text-info',
  2: 'bg-warning-bg text-warning',
  3: 'bg-danger-bg text-danger',
  4: 'bg-brand/10 text-brand',
}

export default function TeamsPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState(MEMBERS)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
      const matchTier = !tierFilter || String(m.tier) === tierFilter
      return matchSearch && matchTier
    })
  }, [members, search, tierFilter])

  const toggleActive = (id: string) =>
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    toast({ title: 'Invitation sent', description: `${inviteEmail} will receive an invite to join the team.`, variant: 'success' })
    setInviteEmail('')
    setShowInvite(false)
  }

  const handleExport = () => {
    const count = downloadCsv(`team-members-${Date.now()}.csv`, filtered, [
      { header: 'Name', accessor: (m) => m.name },
      { header: 'Email', accessor: (m) => m.email },
      { header: 'Role', accessor: (m) => m.role },
      { header: 'Tier', accessor: (m) => m.tier },
      { header: 'Active', accessor: (m) => (m.active ? 'Yes' : 'No') },
      { header: 'Capacity', accessor: (m) => m.capacity },
      { header: 'Assigned', accessor: (m) => m.assigned },
      { header: 'Working Hours', accessor: (m) => m.hours },
    ])
    toast({ title: 'Export complete', description: `${count} member(s) exported.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Configuration Hub
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-brand" /> Team Members</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage responders, roles, working hours, and capacity limits</p>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Invite member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Active members', value: filtered.filter((m) => m.active).length },
          { label: 'Total capacity', value: filtered.reduce((a, m) => a + m.capacity, 0) },
          { label: 'Currently assigned', value: filtered.reduce((a, m) => a + m.assigned, 0) },
          { label: 'Tiers covered', value: new Set(filtered.filter((m) => m.active).map((m) => m.tier)).size },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold tabular-nums">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium outline-none"
        >
          <option value="">All tiers</option>
          {[0, 1, 2, 3, 4].map((t) => (
            <option key={t} value={String(t)}>Tier {t}</option>
          ))}
        </select>
        <ClearFiltersButton visible={!!(search || tierFilter)} onClear={() => { setSearch(''); setTierFilter('') }} />
        <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {['Member', 'Role', 'Tier', 'Load', 'Hours', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">{m.initials}</div>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-bold', TIER_COLORS[m.tier])}>T{m.tier}</span>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className={cn('font-semibold', m.assigned > m.capacity ? 'text-danger' : 'text-foreground')}>{m.assigned}</span>
                  <span className="text-muted-foreground"> / {m.capacity}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{m.hours}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toggleActive(m.id)} className={cn(m.active ? 'text-success' : 'text-muted-foreground')}>
                    {m.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Link href="/config/roles" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-brand" /> Invite team member</h2>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@meridianfreight.com"
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowInvite(false)} className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-muted">Cancel</button>
              <button type="button" onClick={handleInvite} className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover">Send invite</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
