import type { Ticket } from '@/lib/mock-data'
import type { SlaState } from '@/components/ui/sla-timer'
import type { TicketStatus } from '@/components/ui/status-badge'
import { matchesRegion, type AppRegion } from '@/lib/regions'

export interface TicketFilters {
  search?: string
  priority?: string
  status?: string
  category?: string
  tier?: string
  slaState?: SlaState | ''
  assignee?: 'assigned' | 'unassigned' | ''
}

const STATUS_LABEL_MAP: Record<string, TicketStatus> = {
  All: 'open',
  New: 'new',
  Open: 'open',
  Escalated: 'escalated',
  'Pending Requester': 'pending_requester',
  Resolved: 'resolved',
  Closed: 'closed',
}

const PRIORITY_LABEL_MAP: Record<string, string> = {
  All: '',
  'P1 Critical': 'p1',
  'P2 High': 'p2',
  'P3 Medium': 'p3',
  'P4 Low': 'p4',
}

const TIER_LABEL_MAP: Record<string, number> = {
  All: 0,
  'Tier 1': 1,
  'Tier 2': 2,
  'Tier 3': 3,
  'Tier 4 (Falcon)': 4,
}

export function normalizeStatusFilter(label: string): string {
  if (label === 'All') return ''
  return STATUS_LABEL_MAP[label] ?? label.toLowerCase().replace(/\s+/g, '_')
}

export function normalizePriorityFilter(label: string): string {
  if (label === 'All') return ''
  return PRIORITY_LABEL_MAP[label] ?? label.toLowerCase()
}

export function normalizeTierFilter(label: string): string {
  if (label === 'All') return ''
  return String(TIER_LABEL_MAP[label] ?? '')
}

export function normalizeCategoryFilter(label: string): string {
  return label === 'All' ? '' : label
}

export function ticketMatchesSearch(ticket: Ticket, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    ticket.id,
    ticket.subject,
    ticket.requester,
    ticket.tenant,
    ticket.category,
    ticket.assignee,
    ticket.shipmentRef,
    ticket.status,
    ticket.priority,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function ticketMatchesSlaState(ticket: Ticket, slaState: SlaState): boolean {
  return (
    ticket.resolutionSla.state === slaState ||
    ticket.firstResponseSla.state === slaState
  )
}

export function countSlaState(tickets: Ticket[], state: SlaState): number {
  return tickets.filter((t) => ticketMatchesSlaState(t, state)).length
}

export function filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
  return tickets.filter((ticket) => {
    if (filters.search && !ticketMatchesSearch(ticket, filters.search)) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.category && ticket.category !== filters.category) return false
    if (filters.tier && String(ticket.currentTier) !== filters.tier) return false
    if (filters.slaState && !ticketMatchesSlaState(ticket, filters.slaState)) return false
    if (filters.assignee === 'assigned' && !ticket.assignee) return false
    if (filters.assignee === 'unassigned' && ticket.assignee) return false
    return true
  })
}

export interface SavedSearchResult {
  query: string
  filters: TicketFilters
}

export function resolveSavedSearch(label: string): SavedSearchResult {
  const lower = label.toLowerCase()
  if (lower.includes('breached') || lower === 'sla breached today') {
    return { query: 'SLA breached', filters: { slaState: 'breached' } }
  }
  if (lower.includes('unassigned')) {
    return { query: 'unassigned', filters: { assignee: 'unassigned' } }
  }
  if (lower.includes('falcon')) {
    return { query: 'falcon', filters: { tier: '4' } }
  }
  if (lower.includes('escalation') || lower.includes('escalated')) {
    return { query: 'escalated', filters: { status: 'escalated' } }
  }
  if (lower.includes('csat')) {
    return { query: 'resolved', filters: { status: 'resolved' } }
  }
  return { query: label, filters: { search: label } }
}

export function filterByRegion<T extends { tenant: string }>(tickets: T[], region: AppRegion): T[] {
  if (region === 'all') return tickets
  return tickets.filter((t) => matchesRegion(t.tenant, region))
}
