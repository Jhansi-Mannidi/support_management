'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Bell, Plus, ArrowLeft, Edit2, Trash2, Mail, Smartphone,
  Monitor, Check, X, ToggleLeft, ToggleRight, ChevronRight, Eye,
  AlertTriangle, ArrowUpCircle, UserCheck, MessageSquare,
  CheckCircle2, Zap, AtSign, Clock,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

const TRIGGER_EVENTS = [
  {
    id: 'ev-1', event: 'Ticket Created', icon: CheckCircle2, color: 'text-info',
    channels: { email: true, inApp: true, push: false },
    recipients: ['Requester', 'Assigned Agent'],
    template: 'Your ticket {{ticket_id}} has been created and is being reviewed.',
    active: true,
  },
  {
    id: 'ev-2', event: 'SLA Breach — First Response', icon: AlertTriangle, color: 'text-danger',
    channels: { email: true, inApp: true, push: true },
    recipients: ['Assigned Agent', 'Branch Admin'],
    template: 'URGENT: Ticket {{ticket_id}} has breached first-response SLA. Immediate action required.',
    active: true,
  },
  {
    id: 'ev-3', event: 'SLA Breach — Resolution', icon: AlertTriangle, color: 'text-danger',
    channels: { email: true, inApp: true, push: true },
    recipients: ['Assigned Agent', 'Branch Admin', 'Tenant Admin'],
    template: 'BREACH: Resolution SLA for {{ticket_id}} has been exceeded. Escalation triggered.',
    active: true,
  },
  {
    id: 'ev-4', event: 'Ticket Escalated', icon: ArrowUpCircle, color: 'text-warning',
    channels: { email: true, inApp: true, push: false },
    recipients: ['New Owner', 'Previous Owner', 'Requester'],
    template: 'Ticket {{ticket_id}} has been escalated to {{new_tier}}. Assigned to: {{assignee}}.',
    active: true,
  },
  {
    id: 'ev-5', event: 'Ticket Assigned', icon: UserCheck, color: 'text-brand',
    channels: { email: false, inApp: true, push: false },
    recipients: ['Assigned Agent'],
    template: 'You have been assigned ticket {{ticket_id}}: {{subject}}.',
    active: true,
  },
  {
    id: 'ev-6', event: 'Reply / Comment Added', icon: MessageSquare, color: 'text-brand',
    channels: { email: true, inApp: true, push: false },
    recipients: ['Requester', 'Assigned Agent', 'Watchers'],
    template: '{{sender}} added a reply to ticket {{ticket_id}}: "{{preview}}".',
    active: true,
  },
  {
    id: 'ev-7', event: 'Ticket Resolved', icon: CheckCircle2, color: 'text-success',
    channels: { email: true, inApp: true, push: false },
    recipients: ['Requester'],
    template: 'Your ticket {{ticket_id}} has been resolved. Please rate your experience.',
    active: true,
  },
  {
    id: 'ev-8', event: 'CSAT Survey Sent', icon: AtSign, color: 'text-success',
    channels: { email: true, inApp: false, push: false },
    recipients: ['Requester'],
    template: 'How was your support experience for {{ticket_id}}? Please take a moment to rate us.',
    active: true,
  },
  {
    id: 'ev-9', event: 'SLA At-Risk Warning', icon: Clock, color: 'text-warning',
    channels: { email: false, inApp: true, push: true },
    recipients: ['Assigned Agent'],
    template: 'Warning: Ticket {{ticket_id}} SLA will breach in {{time_remaining}}. Please action.',
    active: false,
  },
]

export default function NotificationConfigPage() {
  const [events, setEvents] = useState(TRIGGER_EVENTS)
  const [editId, setEditId] = useState<string | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [activeTab, setActiveTab] = useState<'triggers' | 'preferences'>('triggers')

  const toggleActive = (id: string) => setEvents(es => es.map(e => e.id === id ? { ...e, active: !e.active } : e))
  const toggleChannel = (id: string, ch: 'email' | 'inApp' | 'push') =>
    setEvents(es => es.map(e => e.id === id ? { ...e, channels: { ...e.channels, [ch]: !e.channels[ch] } } : e))

  const startEdit = (id: string, template: string) => { setEditId(id); setEditedTemplate(template) }
  const saveEdit = () => {
    setEvents(es => es.map(e => e.id === editId ? { ...e, template: editedTemplate } : e))
    setEditId(null)
  }

  return (
    <PageContainer className="space-y-4">
        <div>
          <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Configuration Hub
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-warning" /> Notification Templates</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Configure trigger events, delivery channels, and message templates</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all shrink-0">
              <Plus className="h-4 w-4" /> Custom Template
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-0.5 w-fit">
          {[
            { key: 'triggers', label: 'Trigger Events' },
            { key: 'preferences', label: 'Default Preferences' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'rounded-md px-4 py-1.5 text-[13px] font-medium transition-all',
                activeTab === tab.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'triggers' && (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Event</span>
              <span className="w-8 text-center">Email</span>
              <span className="w-8 text-center">In-App</span>
              <span className="w-8 text-center">Push</span>
              <span className="w-12 text-center">Status</span>
              <span className="w-16 text-center">Actions</span>
            </div>

            {events.map(ev => {
              const Icon = ev.icon
              const isEditing = editId === ev.id
              return (
                <div key={ev.id} className={cn('rounded-xl border bg-card overflow-hidden transition-all', ev.active ? 'border-border' : 'border-border/50 opacity-60')}>
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:items-center gap-3 sm:gap-4 p-4">
                    {/* Event info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', 'bg-muted')}>
                        <Icon className={cn('h-4 w-4', ev.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold">{ev.event}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Recipients: {ev.recipients.join(', ')}</p>
                      </div>
                    </div>
                    {/* Channels */}
                    {(['email', 'inApp', 'push'] as const).map(ch => (
                      <div key={ch} className="flex flex-row sm:flex-col items-center gap-1 w-8">
                        <span className="text-[10px] text-muted-foreground sm:hidden capitalize">{ch}</span>
                        <button onClick={() => toggleChannel(ev.id, ch)} className={cn('flex h-6 w-6 items-center justify-center rounded-full transition-all', ev.channels[ch] ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                          {ev.channels[ch] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </button>
                      </div>
                    ))}
                    {/* Toggle */}
                    <button onClick={() => toggleActive(ev.id)} className={cn('shrink-0', ev.active ? 'text-success' : 'text-muted-foreground')}>
                      {ev.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => isEditing ? setEditId(null) : startEdit(ev.id, ev.template)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Template editor */}
                  {isEditing && (
                    <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Message Template</p>
                        <div className="flex gap-1.5 text-[11px] text-muted-foreground">
                          {['{{ticket_id}}', '{{subject}}', '{{assignee}}', '{{new_tier}}', '{{time_remaining}}', '{{sender}}'].map(v => (
                            <button key={v} onClick={() => setEditedTemplate(t => t + v)} className="rounded bg-muted px-1.5 py-0.5 font-mono hover:bg-brand/10 hover:text-brand transition-colors">{v}</button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={editedTemplate}
                        onChange={e => setEditedTemplate(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-mono outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditId(null)} className="rounded-lg border border-border bg-muted px-3 py-1.5 text-[12px] font-medium hover:bg-muted/80 transition-all">Cancel</button>
                        <button onClick={saveEdit} className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-hover transition-all">Save Template</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-[14px] font-semibold">Default Channel Preferences by Role</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Role', 'Email', 'In-App', 'Push', 'Digest Frequency'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'Requester', email: true, inApp: true, push: false, digest: 'Immediate' },
                      { role: 'Dept Support Admin', email: true, inApp: true, push: true, digest: 'Immediate' },
                      { role: 'Branch Support Admin', email: true, inApp: true, push: true, digest: 'Hourly' },
                      { role: 'Tenant Admin', email: true, inApp: true, push: false, digest: 'Daily' },
                      { role: 'Falcon Engineer', email: true, inApp: true, push: true, digest: 'Immediate' },
                    ].map(row => (
                      <tr key={row.role} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.role}</td>
                        {(['email', 'inApp', 'push'] as const).map(ch => (
                          <td key={ch} className="px-4 py-3">
                            <div className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full', row[ch] ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground')}>
                              {row[ch] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <select className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[12px] outline-none focus:border-brand cursor-pointer">
                            {['Immediate', 'Hourly', 'Daily', 'Weekly'].map(d => (
                              <option key={d} selected={d === row.digest}>{d}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
  )
}
