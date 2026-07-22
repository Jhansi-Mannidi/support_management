'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield, AlertTriangle, CheckCircle2, X, Clock, Loader2,
  Eye, FileText, ChevronRight, User, Zap, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

type Phase = 'confirm' | 'active' | 'summary'

export default function ImpersonatePage() {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [reason, setReason] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [starting, setStarting] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (phase !== 'active') return
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStart = () => {
    if (!reason.trim() || !understood) return
    setStarting(true)
    setTimeout(() => { setStarting(false); setPhase('active') }, 1200)
  }

  const handleExit = () => setPhase('summary')

  const AUDIT_ACTIONS = [
    { action: 'Viewed ticket TKT-10440', time: '14:02:31' },
    { action: 'Viewed escalation history', time: '14:02:45' },
    { action: 'Opened shipment detail (read-only)', time: '14:03:10' },
    { action: 'Viewed internal notes on TKT-10440', time: '14:03:38' },
  ]

  return (
    <>
    {/* Active impersonation banner */}
      {phase === 'active' && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b-2 border-warning bg-warning/10 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
              <Eye className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-warning">
                Viewing as Priya Nair (Meridian Freight)
              </p>
              <p className="text-[11px] text-warning/70">Session recorded · all actions attributed to Vikram Rao (Falcon)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="font-mono text-[13px] font-bold text-warning tabular-nums">{formatElapsed(elapsed)}</span>
            </div>
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-lg bg-warning px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
            >
              <X className="h-4 w-4" />
              Exit impersonation
            </button>
          </div>
        </div>
      )}

      <PageContainer className="space-y-6">
        {/* Pre-impersonation confirm */}
        {phase === 'confirm' && (
          <>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Link href="/falcon/console" className="hover:text-brand">Falcon Console</Link>
              <ChevronRight className="h-3 w-3" />
              <span>Impersonate user</span>
            </div>

            <div className="rounded-xl border border-warning/30 bg-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 border border-warning/30">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Impersonate user for diagnosis</h1>
                  <p className="text-[12px] text-muted-foreground">This session is fully audited and logged.</p>
                </div>
              </div>

              {/* Target user */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Target user</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">PN</div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Priya Nair</p>
                    <p className="text-[12px] text-muted-foreground">Meridian Freight · Branch Support Requester</p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Linked ticket</p>
                    <p className="font-mono text-[12px] font-semibold text-brand">TKT-10440</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Category</p>
                    <p className="text-[12px] text-foreground">Security</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Impersonating as</p>
                    <p className="text-[12px] text-foreground">Vikram Rao (you)</p>
                  </div>
                </div>
              </div>

              {/* Scope note */}
              <div className="rounded-lg border border-info/20 bg-info-bg px-4 py-3">
                <p className="text-[12px] font-semibold text-info mb-1">Session scope</p>
                <p className="text-[12px] text-info/80">Read-mostly access for diagnosis. Impersonation is scoped to this ticket&apos;s data. Actions that modify production data are restricted.</p>
              </div>

              {/* Audit notice */}
              <div className="rounded-xl border-2 border-warning/30 bg-warning-bg/30 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                  <p className="text-[13px] font-semibold text-warning">Audit notice</p>
                </div>
                <p className="text-[12px] text-warning/80 leading-relaxed">
                  Every action you take will be recorded against <strong>Priya Nair</strong> and attributed to you (<strong>Vikram Rao</strong>) in the audit log. The user may be notified per policy.
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                  Justification / reason <span className="text-danger">*</span>
                </label>
                <textarea
                  placeholder="Explain why impersonation is required for this diagnosis..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Understood checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-warning"
                />
                <span className="text-[13px] text-foreground">
                  I understand this session is fully audited, that all my actions will be logged, and that this impersonation is authorized for diagnosis purposes only.
                </span>
              </label>

              <button
                onClick={handleStart}
                disabled={!reason.trim() || !understood || starting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-warning bg-warning/10 py-3 text-[14px] font-bold text-warning hover:bg-warning/20 disabled:opacity-50 transition-all"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Start audited session
              </button>
            </div>
          </>
        )}

        {/* Active — redirect hint */}
        {phase === 'active' && (
          <div className="rounded-xl border border-warning/30 bg-card p-6 text-center space-y-4">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-warning/10 border border-warning/30">
              <Eye className="h-8 w-8 text-warning" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-foreground">Impersonation session active</p>
              <p className="mt-1 text-[13px] text-muted-foreground">You are now viewing as Priya Nair. All actions are being recorded.</p>
            </div>
            <Link href="/app/tickets/TKT-10440">
              <button className="flex items-center gap-2 mx-auto rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted">
                <ExternalLink className="h-4 w-4" />
                Open ticket TKT-10440
              </button>
            </Link>
            <button onClick={handleExit} className="block w-full rounded-lg bg-warning py-2.5 text-[14px] font-bold text-white hover:opacity-90">
              Exit impersonation now
            </button>
          </div>
        )}

        {/* Post-session summary */}
        {phase === 'summary' && (
          <div className="rounded-xl border border-success/30 bg-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-foreground">Session ended</h2>
                <p className="text-[12px] text-muted-foreground">Full session log written to audit trail</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div><span className="text-muted-foreground">Duration</span><p className="font-semibold text-foreground">{formatElapsed(elapsed)}</p></div>
                <div><span className="text-muted-foreground">User impersonated</span><p className="font-semibold text-foreground">Priya Nair</p></div>
                <div><span className="text-muted-foreground">Linked ticket</span><p className="font-mono font-semibold text-brand">TKT-10440</p></div>
                <div><span className="text-muted-foreground">Falcon engineer</span><p className="font-semibold text-foreground">Vikram Rao</p></div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold text-foreground">Actions taken ({AUDIT_ACTIONS.length})</p>
              <div className="space-y-1.5">
                {AUDIT_ACTIONS.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground">{a.action}</span>
                    <span className="font-mono text-muted-foreground">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-success/20 bg-success-bg px-3 py-2.5">
              <p className="text-[12px] text-success font-medium">
                Session log confirmed written to audit trail. Entry accessible by authorized reviewers.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/falcon/console">
                <button className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover">
                  Back to Falcon Console
                </button>
              </Link>
              <button className="rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-muted flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> View audit log
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
