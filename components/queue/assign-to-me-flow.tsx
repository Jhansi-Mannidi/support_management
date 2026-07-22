'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import type { Ticket } from '@/lib/mock-data'
import { CURRENT_USER } from '@/lib/support-team'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer } from '@/components/ui/sla-timer'
import { StatusBadge } from '@/components/ui/status-badge'

type Step = 'pick' | 'confirm' | 'success'

const STEPS: { id: Step; label: string }[] = [
  { id: 'pick', label: 'Select tickets' },
  { id: 'confirm', label: 'Review' },
  { id: 'success', label: 'Done' },
]

const PRIORITY_WEIGHT: Record<string, number> = { p1: 40, p2: 30, p3: 20, p4: 10 }

function assignScore(ticket: Ticket): number {
  let score = 0
  if (ticket.resolutionSla.state === 'breached') score += 100
  if (ticket.firstResponseSla.state === 'breached') score += 80
  if (ticket.resolutionSla.state === 'at-risk') score += 50
  if (ticket.firstResponseSla.state === 'at-risk') score += 40
  score += PRIORITY_WEIGHT[ticket.priority] ?? 0
  if (ticket.status === 'new') score += 15
  if (ticket.status === 'escalated') score += 25
  return score
}

function sortForAssignment(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => assignScore(b) - assignScore(a))
}

export interface AssignToMeFlowProps {
  open: boolean
  tickets: Ticket[]
  preselectedId?: string | null
  onClose: () => void
  onAssign: (ticketIds: string[]) => void
}

export function AssignToMeFlow({ open, tickets, preselectedId, onClose, onAssign }: AssignToMeFlowProps) {
  const { toast } = useToast()
  const unassigned = useMemo(
    () => sortForAssignment(tickets.filter((t) => !t.assignee && t.status !== 'closed' && t.status !== 'resolved')),
    [tickets],
  )

  const [step, setStep] = useState<Step>('pick')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [assignedIds, setAssignedIds] = useState<string[]>([])

  const atRiskUnassigned = unassigned.filter(
    (t) => t.resolutionSla.state === 'at-risk' || t.firstResponseSla.state === 'at-risk',
  ).length
  const breachedUnassigned = unassigned.filter(
    (t) => t.resolutionSla.state === 'breached' || t.firstResponseSla.state === 'breached',
  ).length

  const selectedTickets = useMemo(
    () => tickets.filter((t) => selected.includes(t.id)),
    [tickets, selected],
  )

  useEffect(() => {
    if (!open) return
    setSubmitting(false)
    setAssignedIds([])

    if (preselectedId) {
      setSelected([preselectedId])
      setStep('confirm')
      return
    }

    const recommended = sortForAssignment(unassigned).slice(0, Math.min(3, unassigned.length)).map((t) => t.id)
    setSelected(recommended)
    setStep(unassigned.length === 0 ? 'pick' : 'pick')
  }, [open, preselectedId, unassigned])

  const toggleTicket = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleConfirm = () => {
    if (selected.length === 0) return
    setSubmitting(true)
    const count = selected.length
    window.setTimeout(() => {
      onAssign(selected)
      setSubmitting(false)
      toast({
        title: `${count} ticket${count !== 1 ? 's' : ''} assigned to you`,
        description: 'They\'re now in your queue. SLA clocks continue running.',
        variant: 'success',
      })
      handleClose()
    }, 650)
  }

  const handleClose = () => {
    onClose()
    window.setTimeout(() => {
      setStep('pick')
      setSelected([])
      setAssignedIds([])
    }, 200)
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton>
        {/* Branded header */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand/10 via-accent/80 to-card px-6 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 left-1/3 h-20 w-20 rounded-full bg-brand/5 blur-xl" />
          <DialogHeader className="relative text-left">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/25">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">Assign to me</DialogTitle>
                <DialogDescription className="text-[13px]">
                  Pull tickets into your queue · {CURRENT_USER.name} · Tier {CURRENT_USER.tier}
                </DialogDescription>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                      i <= stepIndex ? 'bg-brand text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-[11px] font-medium sm:inline',
                      i <= stepIndex ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="mx-1 h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[min(60vh,520px)] overflow-y-auto px-6 py-5 scrollbar-thin">
          <AnimatePresence mode="wait">
            {step === 'pick' && (
              <motion.div
                key="pick"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="space-y-4"
              >
                {unassigned.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-bg">
                      <CheckCircle2 className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">Queue is fully assigned</p>
                      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
                        No unassigned tickets in your current view. Try clearing filters or check another column.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleClose}>
                      Back to board
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Unassigned', value: unassigned.length, tone: 'text-brand' },
                        { label: 'At risk', value: atRiskUnassigned, tone: 'text-warning' },
                        { label: 'Breached', value: breachedUnassigned, tone: 'text-danger' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-center"
                        >
                          <p className={cn('text-xl font-bold tabular-nums', stat.tone)}>{stat.value}</p>
                          <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-foreground">
                        Recommended by SLA &amp; priority
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(unassigned.map((t) => t.id))}
                          className="text-[12px] font-medium text-brand hover:underline"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected([])}
                          className="text-[12px] text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {unassigned.map((ticket, index) => {
                        const isSelected = selected.includes(ticket.id)
                        const isRecommended = index < 3
                        return (
                          <motion.li
                            key={ticket.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.25 }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleTicket(ticket.id)}
                              className={cn(
                                'group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                                isSelected
                                  ? 'border-brand/50 bg-accent/60 shadow-sm ring-1 ring-brand/20'
                                  : 'border-border bg-card hover:border-brand/30 hover:bg-muted/30',
                              )}
                            >
                              <div
                                className={cn(
                                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                  isSelected
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-border bg-background group-hover:border-brand/40',
                                )}
                              >
                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                    {ticket.id}
                                  </span>
                                  <PriorityBadge priority={ticket.priority} size="sm" />
                                  <StatusBadge status={ticket.status} size="sm" />
                                  {isRecommended && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                                      <Sparkles className="h-3 w-3" /> Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-1 text-[13px] font-semibold text-foreground">
                                  {ticket.subject}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  {ticket.requester} · {ticket.tenant}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <SlaTimer
                                    label="1st resp"
                                    display={ticket.firstResponseSla.display}
                                    state={ticket.firstResponseSla.state}
                                    progress={ticket.firstResponseSla.progress}
                                    size="xs"
                                  />
                                  <SlaTimer
                                    label="Resolution"
                                    display={ticket.resolutionSla.display}
                                    state={ticket.resolutionSla.state}
                                    progress={ticket.resolutionSla.progress}
                                    size="xs"
                                  />
                                </div>
                              </div>
                            </button>
                          </motion.li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {CURRENT_USER.initials}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{CURRENT_USER.name}</p>
                      <p className="text-[12px] text-muted-foreground">{CURRENT_USER.role}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[11px] text-muted-foreground">Capacity after assign</p>
                      <p className="text-[14px] font-bold text-foreground">
                        {38 + selected.length}
                        <span className="text-muted-foreground font-normal"> / 40</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-brand"
                      initial={{ width: '95%' }}
                      animate={{ width: `${Math.min(((38 + selected.length) / 40) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[13px] font-medium text-foreground">
                    {selected.length} ticket{selected.length !== 1 ? 's' : ''} will move to your queue
                  </p>
                  <ul className="space-y-2">
                    {selectedTickets.map((ticket) => (
                      <li
                        key={ticket.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                      >
                        <PriorityBadge priority={ticket.priority} size="sm" showLabel={false} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[11px] text-muted-foreground">{ticket.id}</p>
                          <p className="truncate text-[13px] font-medium text-foreground">{ticket.subject}</p>
                        </div>
                        <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="rounded-lg border border-info/20 bg-info-bg px-3 py-2 text-[12px] text-info">
                  Assignments are logged to the audit trail. Requesters will receive an in-app notification.
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="space-y-5 py-2 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg shadow-lg shadow-success/10"
                >
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {assignedIds.length} ticket{assignedIds.length !== 1 ? 's' : ''} assigned to you
                  </h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    They&apos;re now in your queue. SLA clocks continue running.
                  </p>
                </div>

                <ul className="space-y-2 text-left">
                  {assignedIds.map((id) => {
                    const ticket = tickets.find((t) => t.id === id)
                    if (!ticket) return null
                    return (
                      <li key={id}>
                        <Link
                          href={`/app/tickets/${id}`}
                          onClick={handleClose}
                          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-brand/40 hover:bg-accent/40"
                        >
                          <Zap className="h-4 w-4 shrink-0 text-brand" />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[11px] text-muted-foreground">{id}</p>
                            <p className="truncate text-[13px] font-medium text-foreground">{ticket.subject}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {step !== 'success' && unassigned.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
            {step === 'pick' ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={selected.length === 0}
                  className="gap-1.5"
                >
                  Review {selected.length} ticket{selected.length !== 1 ? 's' : ''}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep('pick')} disabled={submitting}>
                  Back
                </Button>
                <Button onClick={handleConfirm} disabled={submitting || selected.length === 0} className="gap-1.5">
                  {submitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Assigning…
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Confirm assignment
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
            <Button variant="outline" onClick={handleClose}>
              Back to board
            </Button>
            {assignedIds[0] && (
              <Link href={`/app/tickets/${assignedIds[0]}`} onClick={handleClose}>
                <Button className="gap-1.5">
                  Open first ticket <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
