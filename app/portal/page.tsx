'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { MotionButton, MotionItem, MotionStagger, PageContainer } from '@/components/motion/motion-primitives'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportTickets } from '@/lib/export-utils'
import { filterTickets } from '@/lib/ticket-filters'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion'
import { HumanStatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { mockTickets } from '@/lib/mock-data'
import type { TicketStatus } from '@/components/ui/status-badge'
import {
  Plus,
  Search,
  Package,
  DollarSign,
  Bug,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs: { label: string; value: TicketStatus | 'all' | 'awaiting' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Awaiting you', value: 'awaiting' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

// Requester sees only "their" tickets (first 6 from mock)
const myTickets = mockTickets.slice(0, 8)

export default function PortalHomePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [closedTickets, setClosedTickets] = useState<string[]>([])

  const filtered = useMemo(() => {
    const statusFilter =
      activeTab === 'all'
        ? ''
        : activeTab === 'awaiting'
          ? 'pending_requester'
          : activeTab
    return filterTickets(myTickets, {
      search,
      status: statusFilter,
    })
  }, [search, activeTab])

  const handleExport = () => {
    const count = exportTickets(`my-tickets-${Date.now()}.csv`, filtered)
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No tickets match the current filters.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} ticket(s) downloaded as CSV.`, variant: 'success' })
  }

  return (
    <PageContainer className="pb-6 pt-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariants}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <motion.div variants={staggerItemVariants}>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Hi Priya</h1>
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Meridian Freight
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">How can we help you today?</p>
          </motion.div>
          <motion.div variants={staggerItemVariants}>
          <Link href="/app/raise">
            <MotionButton className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand-hover">
              <Plus className="h-4 w-4" />
              Raise a ticket
            </MotionButton>
          </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainerVariants}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Package, label: 'Shipment / Tracking issue', href: '/app/raise?category=shipment', color: 'text-info bg-info-bg border-info/20' },
            { icon: DollarSign, label: 'Billing question', href: '/app/raise?category=billing', color: 'text-warning bg-warning-bg border-warning/20' },
            { icon: Bug, label: 'Report a bug', href: '/app/raise?category=bug', color: 'text-danger bg-danger-bg border-danger/20' },
          ].map(({ icon: Icon, label, href, color }) => (
            <motion.div key={label} variants={staggerItemVariants}>
            <Link href={href}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center shadow-sm transition-shadow hover:shadow-lg cursor-pointer', color)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[12px] font-medium leading-tight">{label}</span>
              </motion.div>
            </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* My Tickets */}
        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-foreground">My Tickets</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:w-56"
                />
              </div>
              <ClearFiltersButton visible={!!(search || activeTab !== 'all')} onClear={() => { setSearch(''); setActiveTab('all') }} />
              <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={cn(
                  'relative whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                  activeTab === t.value
                    ? 'text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {activeTab === t.value && (
                  <motion.span
                    layoutId="portal-tab"
                    className="absolute inset-0 rounded-lg bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
            <EmptyState
              icon={MessageSquare}
              title="No tickets found"
              description="You haven't raised any tickets in this category yet."
              action={
                <Link href="/app/raise">
                  <MotionButton className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover">
                    Raise a ticket
                  </MotionButton>
                </Link>
              }
            />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 8 }}
              variants={staggerContainerVariants}
              className="space-y-2"
            >
              {filtered.map((ticket) => (
                <motion.div key={ticket.id} variants={staggerItemVariants}>
                <Link href={`/portal/tickets/${ticket.id}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={cn(
                    'group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-brand/30 cursor-pointer',
                    ticket.status === 'pending_requester' && 'border-l-4 border-l-warning'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground" data-ticket-id>{ticket.id}</span>
                          <PriorityBadge priority={ticket.priority} size="sm" showLabel={false} />
                        </div>
                        <p className="mt-1 truncate text-[14px] font-semibold text-foreground group-hover:text-brand">
                          {ticket.subject}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <HumanStatusBadge status={ticket.status} />
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {ticket.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Updated {ticket.lastActivity}</span>
                    </div>

                    {ticket.status === 'pending_requester' && (
                      <div className="flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-warning" />
                        <span className="text-[12px] font-medium text-warning">Action needed: your reply is awaited</span>
                      </div>
                    )}

                    {ticket.status === 'resolved' && !closedTickets.includes(ticket.id) && (
                      <div className="flex items-center justify-between rounded-lg bg-success-bg px-3 py-1.5">
                        <span className="text-[12px] font-medium text-success">Did this solve it?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-success px-2 py-1 text-[11px] font-semibold text-white hover:opacity-90"
                            onClick={(e) => {
                              e.preventDefault()
                              setClosedTickets((ids) => [...ids, ticket.id])
                              toast({ title: 'Thanks for confirming', description: `${ticket.id} has been closed.`, variant: 'success' })
                            }}
                          >
                            <CheckCircle2 className="inline h-3 w-3 mr-1" />Confirm
                          </button>
                          <Link href={`/portal/tickets/${ticket.id}`} onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="rounded-md border border-success/30 px-2 py-1 text-[11px] font-semibold text-success hover:bg-success-bg">
                              <RefreshCw className="inline h-3 w-3 mr-1" />Reopen
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
    </PageContainer>
  )
}
