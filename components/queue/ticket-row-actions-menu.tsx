'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpCircle,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Flag,
  MessageSquarePlus,
  MoreHorizontal,
  PauseCircle,
  ScrollText,
  UserPlus,
} from 'lucide-react'
import type { Ticket } from '@/lib/mock-data'
import type { Priority } from '@/components/ui/priority-badge'
import { CURRENT_USER } from '@/lib/support-team'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { useToast } from '@/components/ui/toast-provider'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'p1', label: 'P1 Critical' },
  { value: 'p2', label: 'P2 High' },
  { value: 'p3', label: 'P3 Normal' },
  { value: 'p4', label: 'P4 Low' },
]

export type RowActionType = 'assign' | 'escalate' | 'priority' | 'close'

export interface TicketRowActionsMenuProps {
  ticket: Ticket
  className?: string
  onOpenBulkAction?: (ticketId: string, action: RowActionType) => void
  onAssignToMe?: (ticket: Ticket) => void
  onChangePriority?: (ticket: Ticket, priority: Priority) => void
  onMarkPending?: (ticket: Ticket) => void
  onResolve?: (ticket: Ticket, note: string) => void
  onAddNote?: (ticket: Ticket, note: string) => void
}

export function TicketRowActionsMenu({
  ticket,
  className,
  onOpenBulkAction,
  onAssignToMe,
  onChangePriority,
  onMarkPending,
  onResolve,
  onAddNote,
}: TicketRowActionsMenuProps) {
  const { toast } = useToast()
  const [noteOpen, setNoteOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [resolveNote, setResolveNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'
  const isAssignedToMe = ticket.assignee === CURRENT_USER.name

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.id)
      toast({ title: 'Copied', description: `${ticket.id} copied to clipboard.`, variant: 'success' })
    } catch {
      toast({ title: 'Copy failed', description: 'Could not copy ticket ID.', variant: 'warning' })
    }
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return
    setSubmitting(true)
    window.setTimeout(() => {
      onAddNote?.(ticket, noteText.trim())
      toast({
        title: 'Internal note added',
        description: `Note saved on ${ticket.id}.`,
        variant: 'success',
      })
      setNoteText('')
      setNoteOpen(false)
      setSubmitting(false)
    }, 350)
  }

  const handleResolve = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      onResolve?.(ticket, resolveNote.trim())
      toast({
        title: 'Ticket resolved',
        description: `${ticket.id} marked as resolved. CSAT survey queued.`,
        variant: 'success',
      })
      setResolveNote('')
      setResolveOpen(false)
      setSubmitting(false)
    }, 400)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
            'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 data-popup-open:opacity-100',
            className,
          )}
          aria-label={`Actions for ${ticket.id}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground">
              {ticket.id}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={`/app/tickets/${ticket.id}`} />}>
              <ExternalLink className="text-brand" />
              Open ticket cockpit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyId}>
              <ClipboardCopy />
              Copy ticket ID
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {!isAssignedToMe && !isClosed && (
              <DropdownMenuItem
                onClick={() => {
                  onAssignToMe?.(ticket)
                  toast({
                    title: 'Assigned to you',
                    description: `${ticket.id} is now in your queue.`,
                    variant: 'success',
                  })
                }}
              >
                <UserPlus className="text-brand" />
                Assign to me
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={isClosed}
              onClick={() => onOpenBulkAction?.(ticket.id, 'assign')}
            >
              <UserPlus />
              Reassign to…
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isClosed}>
                <Flag className="text-warning" />
                Change priority
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {PRIORITIES.map((p) => (
                  <DropdownMenuItem
                    key={p.value}
                    onClick={() => {
                      onChangePriority?.(ticket, p.value)
                      toast({
                        title: 'Priority updated',
                        description: `${ticket.id} set to ${p.label}.`,
                        variant: 'success',
                      })
                    }}
                  >
                    <PriorityBadge priority={p.value} size="sm" showLabel={false} />
                    {p.label}
                    {ticket.priority === p.value && (
                      <span className="ml-auto text-[10px] font-medium text-brand">Current</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenBulkAction?.(ticket.id, 'priority')}>
                  More options…
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              disabled={isClosed || ticket.currentTier >= 4}
              onClick={() => onOpenBulkAction?.(ticket.id, 'escalate')}
            >
              <ArrowUpCircle className="text-danger" />
              Escalate ticket
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href={`/app/tickets/escalate?ticket=${ticket.id}`} />}
              disabled={isClosed}
            >
              <ArrowUpCircle />
              Full escalation flow
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={isClosed || ticket.status === 'pending_requester'}
              onClick={() => {
                onMarkPending?.(ticket)
                toast({
                  title: 'Awaiting requester',
                  description: `${ticket.id} marked as pending requester. SLA paused.`,
                  variant: 'info',
                })
              }}
            >
              <PauseCircle />
              Mark pending requester
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isClosed} onClick={() => setNoteOpen(true)}>
              <MessageSquarePlus />
              Add internal note
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isClosed}
              onClick={() => setResolveOpen(true)}
            >
              <CheckCircle2 className="text-success" />
              Resolve ticket
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={isClosed}
              onClick={() => onOpenBulkAction?.(ticket.id, 'close')}
            >
              <CheckCircle2 />
              Close without CSAT
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href={`/config/audit?ticket=${ticket.id}`} />}>
            <ScrollText />
            View audit trail
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Internal note dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-brand" />
              Add internal note
            </DialogTitle>
            <DialogDescription>
              Visible to support agents only · {ticket.id}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[13px] font-medium text-foreground line-clamp-1">{ticket.subject}</p>
            <p className="text-[11px] text-muted-foreground">{ticket.requester} · {ticket.tenant}</p>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Document investigation steps, findings, or next actions…"
            rows={4}
            className="focus-ring w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={submitting || !noteText.trim()}>
              {submitting ? 'Saving…' : 'Save note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Resolve ticket
            </DialogTitle>
            <DialogDescription>
              Mark {ticket.id} as resolved and notify the requester.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={ticket.priority} size="sm" />
              <p className="text-[13px] font-medium text-foreground line-clamp-1">{ticket.subject}</p>
            </div>
          </div>
          <textarea
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            placeholder="Resolution summary for the requester (optional)…"
            rows={3}
            className="focus-ring w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-[12px] text-muted-foreground">
            A CSAT survey will be sent automatically after resolution.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={submitting}>
              {submitting ? 'Resolving…' : 'Resolve ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
