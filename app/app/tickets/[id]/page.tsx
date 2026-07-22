'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-provider'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer } from '@/components/ui/sla-timer'
import { TierBadge } from '@/components/ui/tier-badge'
import { mockTickets, mockEscalationHistory, mockChildTasks } from '@/lib/mock-data'
import {
  ArrowUpCircle, ArrowDownCircle, Send, Paperclip, Lock, ChevronDown,
  MoreHorizontal, Plus, CheckCircle2, AlertTriangle, Clock, User,
  Tag, Link2, FileText, History, ListTodo, X, ChevronRight, Shield,
  RefreshCw, Zap, Globe, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { FlexPageContainer } from '@/components/motion/motion-primitives'
import { WorkspaceBody, WorkspaceHeader, WorkspaceShell } from '@/components/layout/workspace-layout'
import { usePageBreadcrumb } from '@/components/providers/breadcrumb-provider'
import { fadeUpVariants } from '@/lib/motion'

const THREAD = [
  { id: 'm1', type: 'system', time: 'Jul 22, 09:00', text: 'Ticket created · routed to Tier 1 Dept Support' },
  { id: 'm2', type: 'public', author: 'Priya Nair', initials: 'PN', side: 'requester', time: 'Jul 22, 09:00',
    text: 'Container MRSU2381746 was last updated 3 days ago at Nhava Sheva. Our shipping line confirms it departed yesterday but the system still shows "In Transit". Shipment ref: MRSU2381746, Gate-Out: 19 Jul.' },
  { id: 'm3', type: 'event', time: 'Jul 22, 09:03', text: 'Escalated · Tier 1 → Tier 2 (Branch Support) · Trigger: SLA breach · Auto', variant: 'escalation' },
  { id: 'm4', type: 'internal', author: 'Arjun Mehta', initials: 'AM', time: 'Jul 22, 09:10',
    text: 'Checked EDI feed — carrier 2M Alliance has a reported API maintenance window until 10:00 IST. Triggered manual event pull. Monitoring.' },
  { id: 'm5', type: 'public', author: 'Arjun Mehta', initials: 'AM', side: 'support', time: 'Jul 22, 09:45',
    text: 'Hi Priya, there\'s a lag in the carrier EDI feed for this vessel. I\'ve triggered a manual refresh — status should update within 30–60 minutes. I\'ll confirm once propagated.' },
  { id: 'm6', type: 'public', author: 'Priya Nair', initials: 'PN', side: 'requester', time: 'Jul 22, 10:10',
    text: 'Status updated to "Departed" — but ETA still shows old date. Is that expected?' },
  { id: 'm7', type: 'event', time: 'Jul 22, 10:15', text: 'Child task created · CT-002 "Patch billing engine config" · Assigned: Devika Rao', variant: 'task' },
  { id: 'm8', type: 'public', author: 'Arjun Mehta', initials: 'AM', side: 'support', time: 'Jul 22, 10:28',
    text: 'Good catch. ETA recalculation depends on the vessel\'s updated ATA at the next port — typically 1–2 hours. Escalated to our data team to check for a processing delay.' },
]

const ESCALATION_CHAIN = [
  { tier: 1, label: 'Tier 1', sub: 'Dept Support', done: true },
  { tier: 2, label: 'Tier 2', sub: 'Branch Support', active: true },
  { tier: 3, label: 'Tier 3', sub: 'Company Support', done: false },
  { tier: 4, label: 'Tier 4', sub: 'Falcon', done: false },
]

export default function TicketCockpitPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const composerRef = useRef<HTMLDivElement>(null)
  const ticketId = (params.id as string) || ''
  const ticket = mockTickets.find((t) => t.id === ticketId)

  usePageBreadcrumb({
    ticketLabel: ticket
      ? `${ticket.id.toUpperCase()} · ${ticket.subject.length > 34 ? `${ticket.subject.slice(0, 33)}…` : ticket.subject}`
      : ticketId.toUpperCase() || 'Ticket',
  })

  const [composerMode, setComposerMode] = useState<'public' | 'internal'>('public')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [activeRail, setActiveRail] = useState<'activity' | 'escalation'>('escalation')
  const [showMore, setShowMore] = useState(false)
  const [resolved, setResolved] = useState(false)

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
        <h1 className="text-xl font-bold">Ticket not found</h1>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-sm">
          <span className="font-mono font-semibold">{ticketId}</span> doesn&apos;t exist or you don&apos;t have access to view it.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/app/queue/board" className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover">
            Back to queue
          </Link>
          <Link href="/search" className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium hover:bg-muted">
            Search tickets
          </Link>
        </div>
      </div>
    )
  }

  const scrollToComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSend = () => {
    if (!reply.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setReply('')
      toast({
        title: composerMode === 'public' ? 'Reply sent' : 'Internal note added',
        description: 'The requester will be notified.' ,
        variant: 'success',
      })
    }, 900)
  }

  const handleResolve = () => {
    setResolved(true)
    toast({ title: 'Ticket resolved', description: `${ticket.id} marked as resolved. CSAT survey will be sent.`, variant: 'success' })
  }

  return (
    <FlexPageContainer className="overflow-hidden">
      <WorkspaceShell>
        <WorkspaceHeader>
          {/* Top row: ID + status + actions */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[13px] font-bold text-muted-foreground">{ticket.id}</span>
                <StatusBadge status={resolved ? 'resolved' : ticket.status} size="sm" />
                <PriorityBadge priority={ticket.priority} size="sm" />
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{ticket.category}</span>
                {ticket.isPortalPartner && (
                  <span className="flex items-center gap-1 rounded-md border border-info/30 bg-info-bg px-2 py-0.5 text-[11px] font-medium text-info">
                    <Globe className="h-3 w-3" /> Portal partner
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{ticket.subject}</h1>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {ticket.requester} · {ticket.tenant} · Raised {new Date(ticket.created).toLocaleDateString()}
              </p>
            </div>

            {/* Action cluster */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={scrollToComposer}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted"
              >
                <Send className="h-3.5 w-3.5" /> Reply
              </button>
              <div className="flex items-center rounded-lg border border-danger/40 bg-danger-bg/50">
                <button
                  type="button"
                  onClick={() => router.push(`/app/tickets/escalate?ticket=${ticket.id}`)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-danger hover:bg-danger-bg rounded-l-lg"
                >
                  <ArrowUpCircle className="h-3.5 w-3.5" /> Escalate
                </button>
                <Link href={`/app/tickets/escalate?ticket=${ticket.id}`}>
                  <button type="button" className="border-l border-danger/20 px-2 py-2 text-danger hover:bg-danger-bg rounded-r-lg">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
              <button
                type="button"
                onClick={handleResolve}
                disabled={resolved}
                className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {resolved ? 'Resolved' : 'Resolve'}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMore && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} aria-hidden />
                    <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-card py-1 shadow-xl">
                      <Link href={`/app/tickets/child-tasks?ticket=${ticket.id}`} className="block px-4 py-2 text-[13px] hover:bg-muted" onClick={() => setShowMore(false)}>Linked work</Link>
                      <Link href={`/app/tickets/escalate?ticket=${ticket.id}`} className="block px-4 py-2 text-[13px] hover:bg-muted" onClick={() => setShowMore(false)}>Escalation actions</Link>
                      <Link href="/help" className="block px-4 py-2 text-[13px] hover:bg-muted" onClick={() => setShowMore(false)}>Help</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SLA strip */}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <SlaTimer label="1st response" display={ticket.firstResponseSla.display} state={ticket.firstResponseSla.state} progress={ticket.firstResponseSla.progress} size="md" />
            <div className="h-8 w-px bg-border" />
            <SlaTimer label="Resolution" display={ticket.resolutionSla.display} state={ticket.resolutionSla.state} progress={ticket.resolutionSla.progress} size="md" />
            <div className="h-8 w-px bg-border" />
            <TierBadge tier={ticket.currentTier} size="md" />
            <div className="hidden h-8 w-px bg-border lg:block" />
            {/* Escalation chain stepper */}
            <div className="hidden items-center gap-1 lg:flex">
              {ESCALATION_CHAIN.map((step, i) => (
                <div key={step.tier} className="flex items-center gap-1">
                  <div className={cn(
                    'flex flex-col items-center',
                  )}>
                    <div className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2',
                      step.active ? 'border-brand bg-brand text-white' : step.done ? 'border-success bg-success text-white' : 'border-border bg-muted text-muted-foreground'
                    )}>
                      {step.done && !step.active ? <CheckCircle2 className="h-3 w-3" /> : step.tier}
                    </div>
                  </div>
                  {i < ESCALATION_CHAIN.length - 1 && (
                    <div className={cn('h-px w-6', step.done ? 'bg-success' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              SLA: Technical · P2 · Standard
            </span>
          </div>
        </WorkspaceHeader>

        <WorkspaceBody className="flex min-w-0 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Left rail */}
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-card p-4 space-y-4 scrollbar-thin xl:block">
            {/* Requester card */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">{ticket.requesterInitials}</div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{ticket.requester}</p>
                  <p className="text-[11px] text-muted-foreground">{ticket.tenant}</p>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-border pt-2">
                {[
                  { label: 'Account tier', value: 'Standard' },
                  { label: 'Channel', value: ticket.channel === 'portal' ? 'Requester portal' : 'Email' },
                  { label: 'Open tickets', value: '3' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className="text-[11px] font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-[12px] font-semibold text-foreground">Properties</p>
              {[
                { label: 'Category', value: ticket.category },
                { label: 'Priority', value: <PriorityBadge priority={ticket.priority} size="sm" /> },
                { label: 'Channel', value: ticket.channel },
                { label: 'Tags', value: <span className="text-[11px] text-muted-foreground">Add tags...</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-t border-border pt-2 first:border-0 first:pt-0">
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                  <span>{typeof value === 'string' ? <span className="text-[11px] text-foreground">{value}</span> : value}</span>
                </div>
              ))}
              {ticket.shipmentRef && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-[11px] text-muted-foreground">Shipment ref</span>
                  <span className="font-mono text-[11px] text-info">{ticket.shipmentRef}</span>
                </div>
              )}
            </div>

            {/* Child tasks */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-foreground">Linked work</p>
                <Link href={`/app/tickets/child-tasks?ticket=${ticket.id}`}>
                  <button className="flex items-center gap-1 text-[11px] text-brand hover:underline">
                    <Plus className="h-3 w-3" /> Create
                  </button>
                </Link>
              </div>
              <div className="text-[11px] text-muted-foreground">
                2 of 3 tasks done
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-success" style={{ width: '66%' }} />
                </div>
              </div>
              {mockChildTasks.map((ct) => (
                <div key={ct.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    ct.status === 'done' ? 'bg-success' : ct.status === 'in_progress' ? 'bg-info' : 'bg-warning'
                  )} />
                  <span className="flex-1 truncate text-[11px] text-foreground">{ct.title}</span>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">{ct.assigneeInitials.slice(0,1)}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center — conversation */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {THREAD.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <motion.div key={msg.id} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] text-muted-foreground">{msg.text}</span>
                      <div className="h-px flex-1 bg-border" />
                    </motion.div>
                  )
                }
                if (msg.type === 'event') {
                  return (
                    <motion.div key={msg.id} variants={fadeUpVariants} initial="hidden" animate="visible" className={cn(
                      'flex items-start gap-2 rounded-lg px-3 py-2 text-[12px]',
                      msg.variant === 'escalation' ? 'bg-danger-bg border border-danger/20 text-danger' : 'bg-info-bg border border-info/20 text-info'
                    )}>
                      {msg.variant === 'escalation' ? <ArrowUpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <ListTodo className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                      <span>{msg.text}</span>
                      <span className="ml-auto text-[11px] opacity-70 whitespace-nowrap">{msg.time}</span>
                    </motion.div>
                  )
                }
                if (msg.type === 'internal') {
                  return (
                    <motion.div key={msg.id} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-[11px] font-bold text-warning border border-warning/30">
                        {msg.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="h-3 w-3 text-warning" />
                          <span className="text-[12px] font-semibold text-warning">Internal note</span>
                          <span className="text-[11px] text-muted-foreground">· {msg.author} · {msg.time}</span>
                        </div>
                        <div className="rounded-xl rounded-tl-sm border border-warning/30 bg-warning-bg/30 px-4 py-3 text-[13px] text-foreground leading-relaxed">
                          {msg.text}
                        </div>
                        <p className="mt-1 text-[10px] text-warning/70 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> Only responders can see this
                        </p>
                      </div>
                    </motion.div>
                  )
                }
                // Public message
                const isRequester = msg.side === 'requester'
                return (
                  <motion.div key={msg.id} variants={fadeUpVariants} initial="hidden" animate="visible" className={cn('flex gap-3', isRequester ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      isRequester ? 'bg-brand text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                      {msg.initials}
                    </div>
                    <div className={cn('max-w-[70%]', isRequester && 'items-end')}>
                      <div className={cn('flex items-center gap-2 mb-1', isRequester && 'flex-row-reverse')}>
                        <span className="text-[12px] font-semibold text-foreground">{msg.author}</span>
                        <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className={cn(
                        'rounded-2xl px-4 py-3 text-[13px] leading-relaxed',
                        isRequester ? 'rounded-tr-sm bg-secondary border border-border text-foreground' : 'rounded-tl-sm bg-card border border-border text-foreground'
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Composer */}
            <div ref={composerRef} className="shrink-0 border-t border-border bg-card p-4">
              <div className="rounded-xl border border-border overflow-hidden">
                {/* Mode tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setComposerMode('public')}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-all',
                      composerMode === 'public' ? 'bg-card text-foreground border-b-2 border-brand -mb-px' : 'text-muted-foreground hover:text-foreground bg-muted/50'
                    )}
                  >
                    <Globe className="h-3.5 w-3.5" /> Public reply
                  </button>
                  <button
                    onClick={() => setComposerMode('internal')}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-all',
                      composerMode === 'internal' ? 'bg-warning-bg/50 text-warning border-b-2 border-warning -mb-px' : 'text-muted-foreground hover:text-foreground bg-muted/50'
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" /> Internal note
                    {composerMode === 'internal' && <span className="text-[10px] opacity-70 ml-1">· Responders only</span>}
                  </button>
                </div>
                <div className={cn('p-3', composerMode === 'internal' && 'bg-warning-bg/20')}>
                  <textarea
                    placeholder={composerMode === 'public' ? 'Write a reply to the requester...' : 'Add an internal note (only visible to responders)...'}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey && !e.nativeEvent.isComposing) handleSend()
                    }}
                    rows={3}
                    className={cn(
                      'w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none',
                    )}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Attach file', description: 'File picker would open here.', variant: 'info' })}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        aria-label="Attach file"
                      ><Paperclip className="h-3.5 w-3.5" /></button>
                      <button
                        type="button"
                        onClick={() => { setReply('Hi, thank you for reaching out. We are looking into this and will update you shortly.'); toast({ title: 'Canned response inserted', variant: 'info' }) }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        aria-label="Canned response"
                      ><BookOpen className="h-3.5 w-3.5" /></button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!reply.trim() || sending}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50',
                        composerMode === 'public' ? 'bg-brand hover:bg-brand-hover' : 'bg-warning hover:opacity-90'
                      )}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {composerMode === 'public' ? 'Send reply' : 'Add note'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-card scrollbar-thin xl:flex xl:flex-col">
            {/* Rail tabs */}
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              {(['escalation', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRail(tab)}
                  className={cn(
                    'flex-1 py-3 text-[12px] font-semibold capitalize transition-all',
                    activeRail === tab ? 'border-b-2 border-brand text-brand' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === 'escalation' ? 'Escalation' : 'Activity'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {activeRail === 'escalation' ? (
                <>
                  <p className="text-[12px] font-semibold text-foreground">Escalation history</p>
                  <p className="text-[11px] text-muted-foreground">Immutable audit log — append-only</p>
                  {mockEscalationHistory.map((e) => (
                    <div key={e.id} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={e.fromTier} size="xs" />
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <TierBadge tier={e.toTier} size="xs" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            'rounded-sm px-1.5 py-0.5 text-[10px] font-semibold',
                            e.trigger === 'SLA Breach' ? 'bg-danger-bg text-danger' : 'bg-info-bg text-info'
                          )}>
                            {e.trigger}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Actor: <span className="text-foreground font-medium">{e.actor}</span></p>
                        <p className="text-[11px] text-foreground leading-relaxed">{e.reason}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-dashed border-border p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">Ticket currently at <span className="font-semibold text-foreground">Tier 2 · Branch Support</span></p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[12px] font-semibold text-foreground">Activity log</p>
                  {[
                    { icon: '🎫', text: 'Ticket created by Priya Nair', time: 'Jul 22, 09:00' },
                    { icon: '⬆', text: 'Auto-escalated Tier 1→2 (SLA breach)', time: 'Jul 22, 09:03' },
                    { icon: '👤', text: 'Assigned to Arjun Mehta', time: 'Jul 22, 09:05' },
                    { icon: '💬', text: 'Public reply sent by Arjun', time: 'Jul 22, 09:45' },
                    { icon: '🔒', text: 'Internal note added', time: 'Jul 22, 09:10' },
                    { icon: '🗂', text: 'Child task CT-002 created', time: 'Jul 22, 10:15' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[14px] shrink-0">{a.icon}</span>
                      <div>
                        <p className="text-[12px] text-foreground leading-tight">{a.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </aside>
        </div>
        </WorkspaceBody>
      </WorkspaceShell>
      </FlexPageContainer>
  )
}
