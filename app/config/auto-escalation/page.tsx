'use client'

import React, { useMemo, useState } from 'react'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { downloadCsv } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Zap, Plus, ArrowLeft, Edit2, Trash2, ToggleLeft, ToggleRight,
  Clock, AlertTriangle, Tag, Building2, ArrowUpCircle, Info,
  PlayCircle, ChevronRight, ChevronDown, Filter, Copy, Search,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

interface Condition { field: string; operator: string; value: string }
interface EscalationRule {
  id: string; name: string; active: boolean; priority: number
  description: string; lastTriggered: string; triggerCount: number
  conditions: Condition[]; action: string; targetTier: number
}

const RULES: EscalationRule[] = [
  {
    id: 'rule-1', name: 'P1 First-Response Breach → Tier 2', active: true, priority: 1,
    description: 'Auto-escalate P1 tickets that breach first-response SLA to Branch Support',
    lastTriggered: '2 hours ago', triggerCount: 47,
    conditions: [
      { field: 'Priority', operator: 'is', value: 'P1 — Critical' },
      { field: 'SLA State', operator: 'is', value: 'First Response Breached' },
      { field: 'Current Tier', operator: 'is', value: 'Tier 1' },
    ],
    action: 'Escalate to Tier 2 + Notify Branch Admin', targetTier: 2,
  },
  {
    id: 'rule-2', name: 'Security Tickets → Skip to Tier 3', active: true, priority: 2,
    description: 'Security category tickets skip Tier 2 and go directly to Tenant Admin',
    lastTriggered: '1 day ago', triggerCount: 8,
    conditions: [
      { field: 'Category', operator: 'is', value: 'Security' },
      { field: 'Current Tier', operator: 'is', value: 'Tier 1' },
      { field: 'Time Open', operator: 'greater than', value: '30 minutes' },
    ],
    action: 'Skip-level escalate to Tier 3 + Page Tenant Admin', targetTier: 3,
  },
  {
    id: 'rule-3', name: 'Resolution SLA At-Risk → Re-assign', active: true, priority: 3,
    description: 'Re-assign ticket if resolution SLA reaches 80% with no activity',
    lastTriggered: '5 hours ago', triggerCount: 23,
    conditions: [
      { field: 'Resolution SLA Progress', operator: 'greater than', value: '80%' },
      { field: 'Last Activity', operator: 'greater than', value: '2 hours ago' },
      { field: 'Status', operator: 'is', value: 'Open or New' },
    ],
    action: 'Notify assigned agent + Branch Admin', targetTier: 2,
  },
  {
    id: 'rule-4', name: 'Unassigned P2 → Auto-Assign Tier 1', active: true, priority: 4,
    description: 'Auto-assign unowned P2 tickets to available Tier 1 agents after 15 minutes',
    lastTriggered: '30 minutes ago', triggerCount: 112,
    conditions: [
      { field: 'Priority', operator: 'is', value: 'P2 — High' },
      { field: 'Assignee', operator: 'is', value: 'Unassigned' },
      { field: 'Time Open', operator: 'greater than', value: '15 minutes' },
    ],
    action: 'Round-robin assign to available Tier 1 agent', targetTier: 1,
  },
  {
    id: 'rule-5', name: 'Repeated Escalation → Falcon Notification', active: true, priority: 5,
    description: 'Alert Falcon engineers when a ticket has been escalated more than twice',
    lastTriggered: '3 days ago', triggerCount: 6,
    conditions: [
      { field: 'Escalation Count', operator: 'greater than', value: '2' },
      { field: 'Current Tier', operator: 'is', value: 'Tier 3' },
    ],
    action: 'Notify Falcon Console + Create Falcon alert', targetTier: 4,
  },
  {
    id: 'rule-6', name: 'Stale Pending Requester → Close', active: false, priority: 6,
    description: 'Auto-close tickets in Pending Requester state after 7 business days with no reply',
    lastTriggered: 'Never triggered', triggerCount: 0,
    conditions: [
      { field: 'Status', operator: 'is', value: 'Pending Requester' },
      { field: 'Days Since Last Update', operator: 'greater than', value: '7 business days' },
    ],
    action: 'Send reminder email, close after 24h with no response', targetTier: 1,
  },
]

const TIER_COLORS: Record<number, string> = {
  1: 'bg-info-bg text-info',
  2: 'bg-warning-bg text-warning',
  3: 'bg-danger-bg text-danger',
  4: 'bg-brand/10 text-brand',
}

export default function AutoEscalationPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState(RULES)
  const [expanded, setExpanded] = useState<string | null>('rule-1')
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)

  const toggle = (id: string) => setExpanded(p => p === id ? null : id)
  const toggleActive = (id: string) => setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r))

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rules.filter((r) => {
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q)
      const matchActive = activeOnly ? r.active : true
      return matchSearch && matchActive
    })
  }, [rules, search, activeOnly])

  const activeCount = filteredRules.filter(r => r.active).length
  const pausedCount = filteredRules.filter(r => !r.active).length
  const triggerTotal = filteredRules.reduce((a, r) => a + r.triggerCount, 0)

  const handleExport = () => {
    const count = downloadCsv(`escalation-rules-${Date.now()}.csv`, filteredRules, [
      { header: 'Name', accessor: (r) => r.name },
      { header: 'Active', accessor: (r) => (r.active ? 'Yes' : 'No') },
      { header: 'Priority', accessor: (r) => r.priority },
      { header: 'Description', accessor: (r) => r.description },
      { header: 'Action', accessor: (r) => r.action },
      { header: 'Target Tier', accessor: (r) => r.targetTier },
      { header: 'Last Triggered', accessor: (r) => r.lastTriggered },
      { header: 'Trigger Count', accessor: (r) => r.triggerCount },
    ])
    toast({ title: 'Export complete', description: `${count} rule(s) downloaded as CSV.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-4">

        <div>
          <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Configuration Hub
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Zap className="h-5 w-5 text-danger" /> Auto-Escalation Rules</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Create condition-based rules that trigger automatic escalations, assignments, and alerts</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all shrink-0"
            >
              <Plus className="h-4 w-4" /> New Rule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-success">{activeCount}</p>
            <p className="text-[11px] text-muted-foreground">Active Rules</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold tabular-nums">{triggerTotal}</p>
            <p className="text-[11px] text-muted-foreground">Total Triggers (30d)</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-warning">{pausedCount}</p>
            <p className="text-[11px] text-muted-foreground">Paused Rules</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info-bg/40 px-4 py-3">
          <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
          <p className="text-[12px] text-info leading-relaxed">
            Rules are evaluated in priority order (lower number = higher priority). When multiple conditions match, the highest-priority rule fires first. Rules run every 5 minutes.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rules…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveOnly(!activeOnly)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium transition-all',
              activeOnly ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Active only
          </button>
          <ClearFiltersButton visible={!!(search || activeOnly)} onClear={() => { setSearch(''); setActiveOnly(false) }} />
          <ListToolbarActions onExport={handleExport} exportDisabled={filteredRules.length === 0} />
        </div>

        {/* Rules list */}
        <div className="space-y-2">
          {filteredRules.map(rule => (
            <div key={rule.id} className={cn('rounded-xl border bg-card overflow-hidden transition-all', rule.active ? 'border-border' : 'border-border/50 opacity-60')}>
              {/* Rule header */}
              <div className="flex items-start gap-3 p-4">
                {/* Priority badge */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[12px] font-bold text-muted-foreground">
                  {rule.priority}
                </div>
                {/* Expand */}
                <button onClick={() => toggle(rule.id)} className="mt-0.5">
                  {expanded === rule.id
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold">{rule.name}</span>
                    <span className={cn('text-[11px] font-bold rounded-full px-2 py-0.5', TIER_COLORS[rule.targetTier])}>
                      → T{rule.targetTier}
                    </span>
                    {rule.triggerCount > 0 && (
                      <span className="text-[11px] text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                        {rule.triggerCount} triggers
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{rule.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Last triggered: {rule.lastTriggered}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(rule.id)} className={cn('transition-colors', rule.active ? 'text-success' : 'text-muted-foreground')}>
                    {rule.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Copy className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {/* Expanded: Conditions + Action */}
              {expanded === rule.id && (
                <div className="border-t border-border bg-muted/20 p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Conditions */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                      <Filter className="h-3 w-3" /> Conditions (ALL must match)
                    </p>
                    <div className="space-y-1.5">
                      {rule.conditions.map((cond, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12px]">
                          <span className="font-semibold text-foreground">{cond.field}</span>
                          <span className="text-muted-foreground">{cond.operator}</span>
                          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono font-medium">{cond.value}</span>
                          <button className="ml-auto shrink-0 text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button className="flex items-center gap-1 text-[12px] font-medium text-brand hover:underline mt-1">
                        <Plus className="h-3.5 w-3.5" /> Add condition
                      </button>
                    </div>
                  </div>
                  {/* Action */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Action
                    </p>
                    <div className="rounded-lg border border-border bg-card px-3 py-3 text-[13px]">
                      <div className="flex items-start gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <p>{rule.action}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-muted transition-all">
                        <Edit2 className="h-3.5 w-3.5" /> Edit action
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-bg text-success px-3 py-1.5 text-[12px] font-medium hover:opacity-80 transition-all">
                        <PlayCircle className="h-3.5 w-3.5" /> Test rule
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Rule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[15px] font-bold">New Auto-Escalation Rule</h2>
                <button onClick={() => setShowAddModal(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                  <Zap className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Rule Name</label>
                  <input type="text" placeholder="e.g. P2 Unassigned after 30 min" className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Trigger Priority</label>
                  <input type="number" placeholder="1" min={1} max={20} className="w-32 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
                  <textarea rows={2} placeholder="Describe what this rule does…" className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" />
                </div>
                <div className="rounded-lg border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
                  Conditions and actions can be configured after creation
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-border bg-muted px-4 py-2 text-[13px] font-medium hover:bg-muted/80 transition-all">Cancel</button>
                <button onClick={() => setShowAddModal(false)} className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all">
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}

      </PageContainer>
  )
}
