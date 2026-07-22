'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpCircle, CheckCircle2, Flag, UserPlus } from 'lucide-react'
import type { Ticket } from '@/lib/mock-data'
import type { Priority } from '@/components/ui/priority-badge'
import type { TierLevel } from '@/components/ui/tier-badge'
import { SUPPORT_TEAM, CURRENT_USER } from '@/lib/support-team'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type BulkActionType = 'assign' | 'escalate' | 'priority' | 'close'

export type BulkActionPayload =
  | { type: 'assign'; assignee: string; assigneeInitials: string }
  | { type: 'escalate'; reason: string; targetTier: TierLevel }
  | { type: 'priority'; priority: Priority }
  | { type: 'close'; note: string; notifyRequester: boolean }

const PRIORITIES: Priority[] = ['p1', 'p2', 'p3', 'p4']

const PRIORITY_LABELS: Record<Priority, string> = {
  p1: 'P1 Critical',
  p2: 'P2 High',
  p3: 'P3 Normal',
  p4: 'P4 Low',
}

const ESCALATION_REASONS = [
  'SLA breach — needs senior review',
  'Requires Tier 3 approval',
  'Technical complexity beyond current scope',
  'Customer escalation request',
  'Security or compliance concern',
]

interface BulkTicketActionsProps {
  action: BulkActionType | null
  selectedTickets: Ticket[]
  onClose: () => void
  onConfirm: (payload: BulkActionPayload) => void
}

export function BulkTicketActions({ action, selectedTickets, onClose, onConfirm }: BulkTicketActionsProps) {
  const [assigneeId, setAssigneeId] = useState(CURRENT_USER.id)
  const [escalationReason, setEscalationReason] = useState(ESCALATION_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [priority, setPriority] = useState<Priority>('p2')
  const [closeNote, setCloseNote] = useState('')
  const [notifyRequester, setNotifyRequester] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const count = selectedTickets.length
  const previewIds = selectedTickets.slice(0, 3).map((t) => t.id)
  const extraCount = Math.max(0, count - 3)

  const maxCurrentTier = useMemo(
    () => selectedTickets.reduce((max, t) => Math.max(max, t.currentTier), 1 as TierLevel),
    [selectedTickets],
  )
  const targetTier = Math.min(maxCurrentTier + 1, 4) as TierLevel
  const alreadyAtMaxTier = maxCurrentTier >= 4

  const closableCount = selectedTickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length

  useEffect(() => {
    if (!action) return
    setAssigneeId(CURRENT_USER.id)
    setEscalationReason(ESCALATION_REASONS[0])
    setCustomReason('')
    setPriority(selectedTickets[0]?.priority ?? 'p2')
    setCloseNote('')
    setNotifyRequester(true)
    setSubmitting(false)
  }, [action, selectedTickets])

  const handleSubmit = () => {
    if (!action || count === 0) return
    setSubmitting(true)

    window.setTimeout(() => {
      if (action === 'assign') {
        const member = SUPPORT_TEAM.find((m) => m.id === assigneeId) ?? CURRENT_USER
        onConfirm({ type: 'assign', assignee: member.name, assigneeInitials: member.initials })
      } else if (action === 'escalate') {
        onConfirm({
          type: 'escalate',
          reason: customReason.trim() || escalationReason,
          targetTier,
        })
      } else if (action === 'priority') {
        onConfirm({ type: 'priority', priority })
      } else if (action === 'close') {
        onConfirm({ type: 'close', note: closeNote.trim(), notifyRequester })
      }
      setSubmitting(false)
    }, 400)
  }

  const ticketSummary = (
    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
      {previewIds.join(', ')}
      {extraCount > 0 ? ` +${extraCount} more` : ''} · {count} ticket{count !== 1 ? 's' : ''}
    </p>
  )

  return (
    <>
      <Dialog open={action === 'assign'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-brand" /> Assign tickets
            </DialogTitle>
            <DialogDescription>
              Choose a team member to assign {count} selected ticket{count !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          {ticketSummary}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground" htmlFor="bulk-assignee">
              Assign to
            </label>
            <select
              id="bulk-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground"
            >
              <option value={CURRENT_USER.id}>{CURRENT_USER.name} (me)</option>
              {SUPPORT_TEAM.filter((m) => m.id !== CURRENT_USER.id).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.role}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Assigning…' : `Assign ${count} ticket${count !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'escalate'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-brand" /> Escalate tickets
            </DialogTitle>
            <DialogDescription>
              Escalate {count} ticket{count !== 1 ? 's' : ''} to the next support tier.
            </DialogDescription>
          </DialogHeader>
          {ticketSummary}
          {alreadyAtMaxTier ? (
            <p className="rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-[12px] text-warning">
              Selected ticket(s) are already at Falcon tier (T4) and cannot be escalated further.
            </p>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground">
                Target tier: <span className="font-semibold text-foreground">T{targetTier}</span>
                {maxCurrentTier !== targetTier - 1 && ' (mixed tiers — all will move to the same target)'}
              </p>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground" htmlFor="bulk-escalation-reason">
                  Reason
                </label>
                <select
                  id="bulk-escalation-reason"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground"
                >
                  {ESCALATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={2}
                  className="focus-ring w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || alreadyAtMaxTier}>
              {submitting ? 'Escalating…' : `Escalate to T${targetTier}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'priority'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-brand" /> Change priority
            </DialogTitle>
            <DialogDescription>
              Set a new priority for {count} selected ticket{count !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          {ticketSummary}
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
                  priority === p
                    ? 'border-brand bg-accent text-brand'
                    : 'border-border text-foreground hover:border-brand/40 hover:bg-muted/50',
                )}
              >
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Updating…' : `Apply ${PRIORITY_LABELS[priority]}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'close'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand" /> Close tickets
            </DialogTitle>
            <DialogDescription>
              Resolve and close {closableCount} of {count} selected ticket{count !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          {ticketSummary}
          {closableCount < count && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
              {count - closableCount} ticket(s) already resolved or closed will be skipped.
            </p>
          )}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground" htmlFor="bulk-close-note">
                Resolution note
              </label>
              <textarea
                id="bulk-close-note"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="Describe how the issue was resolved…"
                rows={3}
                className="focus-ring w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
              <input
                type="checkbox"
                checked={notifyRequester}
                onChange={(e) => setNotifyRequester(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand/30"
              />
              Notify requester and send CSAT survey
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || closableCount === 0}>
              {submitting ? 'Closing…' : `Close ${closableCount} ticket${closableCount !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
