'use client'

import React, { useMemo, useState } from 'react'
import { mockNotifications } from '@/lib/mock-data'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportNotifications } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PageContainer } from '@/components/motion/motion-primitives'
import { listItemVariants } from '@/lib/motion'
import Link from 'next/link'
import {
  Bell, AlertTriangle, ArrowUpCircle, UserCheck, MessageSquare,
  CheckCircle2, AtSign, CheckCheck, Trash2, Filter, SlidersHorizontal,
  Zap, Info, Search,
} from 'lucide-react'

type NotifType = 'all' | 'breach' | 'escalation' | 'assignment' | 'reply' | 'resolved' | 'mention'

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  breach: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-bg', label: 'SLA Breach' },
  escalation: { icon: ArrowUpCircle, color: 'text-warning', bg: 'bg-warning-bg', label: 'Escalation' },
  assignment: { icon: UserCheck, color: 'text-info', bg: 'bg-info-bg', label: 'Assignment' },
  reply: { icon: MessageSquare, color: 'text-brand', bg: 'bg-brand-subtle', label: 'Reply' },
  resolved: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: 'Resolved' },
  mention: { icon: AtSign, color: 'text-info', bg: 'bg-info-bg', label: 'Mention' },
}

// Extended mock notifications
const allNotifications = [
  ...mockNotifications,
  { id: 'n7', type: 'breach', title: 'TKT-10450 resolution SLA at risk — 47 minutes remaining', ticket: 'TKT-10450', time: '10 min ago', read: false },
  { id: 'n8', type: 'assignment', title: 'TKT-10445 assigned to you — Freight cost calculation issue', ticket: 'TKT-10445', time: '1h ago', read: false },
  { id: 'n9', type: 'escalation', title: 'TKT-10431 escalated from Tier 2 to Tier 3 by Arjun Mehta', ticket: 'TKT-10431', time: '2h ago', read: true },
  { id: 'n10', type: 'reply', title: 'TKT-10437: Kabir Singh added a new comment', ticket: 'TKT-10437', time: '3h ago', read: true },
  { id: 'n11', type: 'resolved', title: 'TKT-10420 closed after CSAT received (4 stars)', ticket: 'TKT-10420', time: 'Yesterday', read: true },
  { id: 'n12', type: 'mention', title: 'Devika Rao mentioned you in TKT-10431 resolution note', ticket: 'TKT-10431', time: 'Yesterday', read: true },
  { id: 'n13', type: 'breach', title: 'TKT-10428 first-response SLA breached — requires attention', ticket: 'TKT-10428', time: '2 days ago', read: true },
  { id: 'n14', type: 'assignment', title: 'TKT-10419 unassigned — requires attention', ticket: 'TKT-10419', time: '2 days ago', read: true },
]

export default function NotificationsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<NotifType>('all')
  const [notifications, setNotifications] = useState(allNotifications)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [search, setSearch] = useState('')

  const unreadCount = notifications.filter(n => !n.read).length

  const tabs: { key: NotifType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'breach', label: 'SLA Breach' },
    { key: 'escalation', label: 'Escalation' },
    { key: 'assignment', label: 'Assignment' },
    { key: 'reply', label: 'Reply / Mention' },
    { key: 'resolved', label: 'Resolved' },
  ]

  const filtered = useMemo(() => notifications.filter(n => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      (n.ticket?.toLowerCase().includes(q) ?? false) ||
      n.type.toLowerCase().includes(q)
    const matchType = filter === 'all'
      ? true
      : filter === 'reply'
        ? n.type === 'reply' || n.type === 'mention'
        : n.type === filter
    const matchRead = showUnreadOnly ? !n.read : true
    return matchSearch && matchType && matchRead
  }), [notifications, search, filter, showUnreadOnly])

  const clearFilters = () => {
    setSearch('')
    setFilter('all')
    setShowUnreadOnly(false)
  }

  const handleExport = () => {
    const count = exportNotifications(`notifications-${Date.now()}.csv`, filtered)
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No notifications match the current filters.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} notification(s) downloaded as CSV.`, variant: 'success' })
  }

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id: string) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  const dismiss = (id: string) => setNotifications(n => n.filter(x => x.id !== id))
  const clearAll = () => setNotifications([])

  return (
    <PageContainer className="space-y-4">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand" />
              Notification Centre
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Stay informed about tickets, SLAs, and team activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium transition-all',
                showUnreadOnly ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Unread only
            </button>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-danger transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        </div>

        {/* Search + export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notifications, ticket IDs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <ClearFiltersButton visible={!!(search || filter !== 'all' || showUnreadOnly)} onClear={clearFilters} />
          <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
        </div>

        {/* Type tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map(tab => {
            const count = tab.key === 'all'
              ? notifications.filter(n => !n.read).length
              : tab.key === 'reply'
                ? notifications.filter(n => !n.read && (n.type === 'reply' || n.type === 'mention')).length
                : notifications.filter(n => !n.read && n.type === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all shrink-0',
                  filter === tab.key
                    ? 'bg-brand text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    'flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    filter === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-brand/10 text-brand',
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-medium">No notifications</p>
            <p className="text-[12px] text-muted-foreground">
              {showUnreadOnly ? 'All caught up! No unread notifications.' : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Group: Today */}
            {['Today', 'Yesterday', '2 days ago'].map(group => {
              const groupItems = filtered.filter(n =>
                group === 'Today' ? !n.time.includes('day') && !n.time.includes('Yesterday')
                  : group === 'Yesterday' ? n.time === 'Yesterday'
                  : n.time === '2 days ago'
              )
              if (groupItems.length === 0) return null
              return (
                <div key={group}>
                  <div className="px-4 py-2 bg-muted/40 border-b border-border">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                  </div>
                  {groupItems.map((notif, i) => {
                    const config = typeConfig[notif.type] || typeConfig.reply
                    const Icon = config.icon
                    return (
                      <motion.div
                        key={notif.id}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        className={cn(
                          'flex items-start gap-3 px-4 py-3.5 transition-all hover:bg-muted/30',
                          i < groupItems.length - 1 && 'border-b border-border',
                          !notif.read && 'bg-brand/[0.03]',
                        )}
                      >
                        {/* Unread dot */}
                        <div className="mt-1 shrink-0">
                          <div className={cn('h-1.5 w-1.5 rounded-full', !notif.read ? 'bg-brand' : 'bg-transparent')} />
                        </div>

                        {/* Icon */}
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={cn('text-[13px] leading-snug', !notif.read && 'font-semibold')}>{notif.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', config.bg, config.color)}>{config.label}</span>
                                {notif.ticket && (
                                  <Link
                                    href={`/app/tickets/${notif.ticket}`}
                                    onClick={() => markRead(notif.id)}
                                    className="text-[11px] font-mono text-muted-foreground hover:text-brand transition-colors"
                                  >
                                    {notif.ticket}
                                  </Link>
                                )}
                                <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={() => markRead(notif.id)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => dismiss(notif.id)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all"
                                title="Dismiss"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* Notification settings hint */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-muted">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium">Customise notification preferences</p>
            <p className="text-[12px] text-muted-foreground">Control which events trigger emails, in-app, or push notifications</p>
          </div>
          <Link
            href="/config/notifications"
            className="text-[12px] font-semibold text-brand hover:underline shrink-0"
          >
            Manage &rarr;
          </Link>
        </div>

      </PageContainer>
  )
}
