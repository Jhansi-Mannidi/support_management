'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TierBadge } from '@/components/ui/tier-badge'
import {
  ArrowUpCircle, ArrowDownCircle, Zap, ChevronRight, AlertTriangle,
  CheckCircle2, Loader2, X, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

type Mode = 'escalate' | 'skip' | 'routedown'

const TIER_LABELS: Record<number, string> = {
  1: 'Tier 1 · Department Support',
  2: 'Tier 2 · Branch Support',
  3: 'Tier 3 · Company Support',
  4: 'Tier 4 · Falcon Engineering',
}

export default function EscalatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-muted-foreground">Loading escalation…</div>}>
      <EscalatePageContent />
    </Suspense>
  )
}

function EscalatePageContent() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticket') || 'TKT-10428'
  const [mode, setMode] = useState<Mode>('escalate')
  const [reason, setReason] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [notifyRequester, setNotifyRequester] = useState(true)
  const [skipTarget, setSkipTarget] = useState(4)
  const [routeTarget, setRouteTarget] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reason.trim()) return
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 1200)
  }

  if (submitted) {
    return (
      <div className="flex h-full items-center justify-center p-8">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === 'escalate' ? 'Escalated successfully' : mode === 'skip' ? 'Skip-level escalation logged' : 'Routed down successfully'}
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              The escalation has been logged to the immutable audit trail and the receiving tier has been notified.
            </p>
            <div className="mt-6 flex gap-2 justify-center">
              <Link href={`/app/tickets/${ticketId}`}>
                <button className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover">
                  View ticket
                </button>
              </Link>
              <Link href="/app/queue/board">
                <button className="rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted">
                  Back to queue
                </button>
              </Link>
            </div>
          </div>
        </div>
    )
  }

  return (
      <PageContainer className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-3">
            <Link href={`/app/tickets/${ticketId}`} className="hover:text-brand">{ticketId}</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Escalation</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Escalation actions</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Every action is logged to the immutable escalation audit trail.</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl border border-border bg-muted p-1 gap-1">
          {([
            { id: 'escalate', label: 'Escalate (one tier up)', icon: ArrowUpCircle },
            { id: 'skip', label: 'Skip-level', icon: Zap },
            { id: 'routedown', label: 'Route down', icon: ArrowDownCircle },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-all',
                mode === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Escalate */}
        {mode === 'escalate' && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <TierBadge tier={2} size="md" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <TierBadge tier={3} size="md" />
            </div>
            <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-[13px] text-muted-foreground">
              This ticket will move to <span className="font-semibold text-foreground">Tier 3 · Company Support</span>.
              The SLA clock continues under the new tier&apos;s policy.
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Reason <span className="text-danger">*</span>
              </label>
              <textarea
                placeholder="Explain why this ticket needs to escalate to the next tier..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">Internal note (optional)</label>
              <textarea
                placeholder="Notes for the receiving tier only..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifyRequester} onChange={(e) => setNotifyRequester(e.target.checked)} className="accent-brand" />
              <span className="text-[13px] text-foreground">Notify requester (public)</span>
            </label>
            {notifyRequester && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-[12px] text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Preview message to requester:</p>
                "Your ticket is being reviewed by a specialist team. We&apos;ll keep you updated."
              </div>
            )}
            {/* Audit preview */}
            <div className="rounded-lg border border-dashed border-brand/30 bg-accent/30 p-3 text-[12px] space-y-1">
              <p className="font-semibold text-brand">Escalation log preview</p>
              <p className="text-muted-foreground">From: Tier 2 → To: Tier 3 · Trigger: Manual · Actor: Arjun Mehta · {new Date().toLocaleString()}</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4" />}
              Escalate to Tier 3
            </button>
          </div>
        )}

        {/* Skip-level */}
        {mode === 'skip' && (
          <div className="rounded-xl border border-danger/30 bg-card p-6 space-y-5">
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
              <p className="text-[13px] text-danger">Skip-level escalation bypasses intermediate tiers. This action is always logged and may be reviewed.</p>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-foreground">Target tier</label>
              <div className="space-y-2">
                {([3, 4] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSkipTarget(t)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left',
                      skipTarget === t ? 'border-brand bg-accent ring-1 ring-brand' : 'border-border bg-background hover:border-brand/30'
                    )}
                  >
                    <div className={cn('h-3 w-3 rounded-full border-2 shrink-0', skipTarget === t ? 'border-brand bg-brand' : 'border-border')} />
                    <TierBadge tier={t} size="sm" />
                    <span className="text-[13px] text-foreground">{TIER_LABELS[t]}</span>
                    {t === 4 && <span className="ml-auto rounded-md bg-danger-bg px-2 py-0.5 text-[10px] font-semibold text-danger">Platform tier</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Reason <span className="text-danger">*</span></label>
              <textarea
                placeholder="Required. Justify why intermediate tiers are being bypassed..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="rounded-lg border border-dashed border-brand/30 bg-accent/30 p-3 text-[12px] space-y-1">
              <p className="font-semibold text-brand">Escalation log preview</p>
              <p className="text-muted-foreground">From: Tier 2 → To: {TIER_LABELS[skipTarget]} · Trigger: Skip-level · Actor: Arjun Mehta</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Skip-level escalate to {TIER_LABELS[skipTarget].split(' · ')[0]}
            </button>
          </div>
        )}

        {/* Route down */}
        {mode === 'routedown' && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <p className="text-[13px] text-muted-foreground">Route this ticket down to a lower tier. Typically used when a Falcon engineer determines the issue belongs at the department or branch level.</p>
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-foreground">Target tier</label>
              <div className="space-y-2">
                {([1, 2] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setRouteTarget(t)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left',
                      routeTarget === t ? 'border-brand bg-accent ring-1 ring-brand' : 'border-border bg-background hover:border-brand/30'
                    )}
                  >
                    <div className={cn('h-3 w-3 rounded-full border-2 shrink-0', routeTarget === t ? 'border-brand bg-brand' : 'border-border')} />
                    <TierBadge tier={t} size="sm" />
                    <span className="text-[13px] text-foreground">{TIER_LABELS[t]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Reason <span className="text-danger">*</span></label>
              <textarea
                placeholder="Explain why this ticket should be handled at a lower tier..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">Guidance note to receiving tier (optional)</label>
              <textarea
                placeholder="Context or instructions for the team receiving this ticket..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
              />
            </div>
            <div className="rounded-lg border border-dashed border-brand/30 bg-accent/30 p-3 text-[12px] space-y-1">
              <p className="font-semibold text-brand">Escalation log preview</p>
              <p className="text-muted-foreground">From: Tier 2 → To: {TIER_LABELS[routeTarget]} · Trigger: Route-down · Actor: Arjun Mehta</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownCircle className="h-4 w-4" />}
              Route down to {TIER_LABELS[routeTarget].split(' · ')[0]}
            </button>
          </div>
        )}
      </PageContainer>
  )
}
