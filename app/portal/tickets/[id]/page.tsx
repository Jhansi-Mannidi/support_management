'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { HumanStatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import {
  Zap, ArrowLeft, Paperclip, Send, CheckCircle2, RefreshCw,
  Lock, User, AlertTriangle, Star, Bell, X, FileText, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

const THREAD = [
  {
    id: 'm1', type: 'system', time: 'Jul 22, 2025 · 09:00',
    text: 'Your ticket was received. We\'ll keep you updated here.'
  },
  {
    id: 'm2', type: 'system', time: 'Jul 22, 2025 · 09:02',
    text: 'A specialist is now looking into this.'
  },
  {
    id: 'm3', type: 'requester', time: 'Jul 22, 2025 · 09:00', author: 'Priya Nair',
    text: 'Hi, container MRSU2381746 was last updated 3 days ago at Nhava Sheva port. The system shows "In Transit" but our shipping line confirms it departed yesterday. Can you help reconcile this?\n\nShipment reference: MRSU2381746\nLast known event: "Gate Out" Nhava Sheva · 19 Jul 2025'
  },
  {
    id: 'm4', type: 'support', time: 'Jul 22, 2025 · 09:45', author: 'VoltusWave Support',
    text: 'Hi Priya,\n\nThank you for reaching out. I can see container MRSU2381746 in the system. There appears to be a lag in the carrier\'s EDI feed for this particular vessel.\n\nI\'ve triggered a manual data refresh. You should see the updated status within 30–60 minutes. I\'ll monitor and confirm once it propagates.'
  },
  {
    id: 'm5', type: 'requester', time: 'Jul 22, 2025 · 10:10', author: 'Priya Nair',
    text: 'Thanks! I can see the status has updated to "Departed" now, but the ETA is still showing the old date. Is that expected?'
  },
  {
    id: 'm6', type: 'support', time: 'Jul 22, 2025 · 10:28', author: 'VoltusWave Support',
    text: 'Good catch. The ETA recalculation depends on the vessel\'s updated ATA at the next port. This typically takes 1–2 hours to flow through. I\'ve escalated to our data team to check if there\'s a processing delay specifically for this vessel.\n\nI\'ll update you as soon as I have more information.'
  },
]

export default function RequesterTicketDetailPage() {
  const params = useParams()
  const ticketId = (params.id as string) || 'TKT-10428'
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showCsat, setShowCsat] = useState(false)
  const [reopenMode, setReopenMode] = useState(false)
  const [reopenReason, setReopenReason] = useState('')

  const isResolved = ticketId === 'TKT-10443'

  const handleSend = () => {
    if (!replyText.trim()) return
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true); setReplyText('') }, 900)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/portal">
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Back to portal">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand" />
              <span className="font-mono text-[13px] font-bold text-muted-foreground">{ticketId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">PN</div>
          </div>
        </div>
      </header>

      <PageContainer className="w-full px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main thread */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <HumanStatusBadge status={isResolved ? 'resolved' : 'open'} />
                <PriorityBadge priority="p2" size="sm" />
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Shipment/Tracking</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Container MRSU2381746 not showing latest status</h1>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Raised Jul 22, 2025 · Ticket <span className="font-mono">{ticketId}</span>
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {isResolved ? (
                  <span className="font-medium text-success">Support has resolved this ticket.</span>
                ) : (
                  <span>Support is currently handling your ticket.</span>
                )}
              </p>
            </div>

            {/* Resolution banner */}
            {isResolved && (
              <div className="rounded-xl border border-success/30 bg-success-bg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h3 className="text-[14px] font-semibold text-success">Support marked this resolved</h3>
                </div>
                <p className="text-[13px] text-success/80 mb-4">
                  The VoltusWave Support team resolved this ticket. The issue was addressed by updating the business rules for carrier API fallback logic. Auto-closes in 3 days if no response.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setShowCsat(true)} className="rounded-lg bg-success px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90">
                    <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Confirm — it&apos;s fixed
                  </button>
                  <button onClick={() => setReopenMode(!reopenMode)} className="rounded-lg border border-success/40 px-4 py-2 text-[13px] font-semibold text-success hover:bg-success-bg">
                    <RefreshCw className="inline h-3.5 w-3.5 mr-1" />Reopen — still broken
                  </button>
                </div>
                {reopenMode && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      placeholder="What's still not working? (required)"
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-success/30 bg-card px-3 py-2 text-[13px] focus:border-success focus:outline-none focus:ring-1 focus:ring-success"
                    />
                    <button className="rounded-lg bg-warning px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90">
                      Reopen ticket
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CSAT inline */}
            {showCsat && (
              <div className="rounded-xl border border-brand/20 bg-accent p-5">
                <p className="text-[14px] font-semibold text-foreground mb-3">How was your support experience?</p>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-[16px] hover:bg-brand hover:text-white hover:border-brand transition-all">
                      {['😞','😕','😐','🙂','😊'][s-1]}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCsat(false)} className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover">
                  Skip for now
                </button>
                <Link href={`/portal/tickets/${ticketId}/feedback`}>
                  <button className="ml-2 text-[12px] text-muted-foreground hover:text-brand underline-offset-2 hover:underline">
                    Full feedback form
                  </button>
                </Link>
              </div>
            )}

            {/* Thread */}
            <div className="space-y-1">
              {THREAD.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] text-muted-foreground">{msg.text}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )
                }
                const isReq = msg.type === 'requester'
                return (
                  <div key={msg.id} className={cn('flex gap-3', isReq ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      isReq ? 'bg-brand text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                      {isReq ? 'PN' : 'VW'}
                    </div>
                    <div className={cn('max-w-[75%] space-y-1', isReq ? 'items-end' : 'items-start')}>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-foreground">{msg.author}</span>
                        <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className={cn(
                        'rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line',
                        isReq
                          ? 'rounded-tr-sm bg-brand text-white'
                          : 'rounded-tl-sm bg-card border border-border text-foreground'
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              {sent && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">PN</div>
                  <div className="max-w-[75%]">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[12px] font-semibold text-foreground">Priya Nair</span>
                      <span className="text-[11px] text-muted-foreground">Just now</span>
                    </div>
                    <div className="rounded-2xl rounded-tr-sm bg-brand px-4 py-3 text-[13px] text-white">
                      Thanks for the update, appreciate the quick response!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reply box */}
            <div className="sticky bottom-0 rounded-xl border border-border bg-card p-4 shadow-lg">
              <textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey && !e.nativeEvent.isComposing) handleSend()
                }}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <div className="mt-2 flex items-center justify-between">
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send reply
                </button>
              </div>
            </div>
          </div>

          {/* Right info rail */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-foreground">Ticket details</h3>
              {[
                { label: 'Status', value: <HumanStatusBadge status={isResolved ? 'resolved' : 'open'} /> },
                { label: 'Priority', value: <PriorityBadge priority="p2" size="sm" /> },
                { label: 'Category', value: <span className="text-[13px] text-foreground">Shipment/Tracking</span> },
                { label: 'Raised', value: <span className="text-[13px] text-foreground">Jul 22, 2025</span> },
                { label: 'Shipment ref', value: <span className="font-mono text-[12px] text-muted-foreground">MRSU2381746</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-t border-border pt-2 first:border-0 first:pt-0">
                  <span className="text-[12px] text-muted-foreground">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-[13px] font-semibold text-foreground mb-3">Activity summary</h3>
              <div className="space-y-2">
                {[
                  { dot: 'bg-brand', text: 'Ticket raised', time: 'Jul 22 · 09:00' },
                  { dot: 'bg-info', text: 'Support responded', time: 'Jul 22 · 09:45' },
                  { dot: 'bg-success', text: 'Manual data refresh triggered', time: 'Jul 22 · 10:15' },
                  { dot: 'bg-warning', text: 'Escalated to data team', time: 'Jul 22 · 10:28' },
                ].map((a) => (
                  <div key={a.text} className="flex items-start gap-2">
                    <div className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', a.dot)} />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{a.text}</p>
                      <p className="text-[11px] text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
