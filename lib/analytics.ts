import type { Ticket } from '@/lib/mock-data'
import { dashboardData } from '@/lib/mock-data'
import { filterTickets, normalizeTierFilter, type TicketFilters } from '@/lib/ticket-filters'
import type { SlaState } from '@/components/ui/sla-timer'

const REFERENCE_END = new Date('2025-07-22T23:59:59.999Z')

export interface ParsedDateRange {
  label: string
  from: Date
  to: Date
  days: number
}

export interface DashboardKpi {
  value: string | number
  delta: string
  direction: 'up' | 'down' | 'neutral'
}

export interface DashboardAnalytics {
  range: ParsedDateRange
  tierLabel: string
  filteredTickets: Ticket[]
  kpis: {
    created: DashboardKpi
    resolved: DashboardKpi
    openBacklog: DashboardKpi
    firstResponseSla: DashboardKpi
    resolutionSla: DashboardKpi
    escalationRate: DashboardKpi
    avgCsat: DashboardKpi
  }
  volumeData: { date: string; created: number; resolved: number }[]
  slaData: { date: string; firstResponse: number; resolution: number }[]
  escalationByTier: { tier: string; stopped: number; percentage: number }[]
  csatData: { rating: string; count: number }[]
  byCategory: { category: string; count: number }[]
  performanceRows: {
    name: string
    initials: string
    assigned: number
    resolved: number
    fr: string
    res: string
    csat: string
    esc: number
  }[]
  totalEscalations: number
}

const TIER_FACTORS: Record<string, number> = {
  All: 1,
  'Tier 1': 0.38,
  'Tier 2': 0.27,
  'Tier 3': 0.2,
  'Tier 4': 0.15,
}

const TIER_LABELS = [
  'Tier 1 (Dept)',
  'Tier 2 (Branch)',
  'Tier 3 (Company)',
  'Tier 4 (Falcon)',
]

const PERFORMANCE_BASE = [
  { name: 'Arjun Mehta', initials: 'AM', assigned: 38, resolved: 35, fr: 94, res: 89, csat: 4.4, esc: 3 },
  { name: 'Sneha Pillai', initials: 'SP', assigned: 41, resolved: 37, fr: 91, res: 85, csat: 4.2, esc: 5 },
  { name: 'Devika Rao', initials: 'DR', assigned: 29, resolved: 27, fr: 96, res: 93, csat: 4.6, esc: 1 },
  { name: 'Kiran Bose', initials: 'KB', assigned: 33, resolved: 28, fr: 88, res: 79, csat: 3.9, esc: 7 },
  { name: 'Vikram Rao', initials: 'VR', assigned: 22, resolved: 22, fr: 100, res: 100, csat: 4.8, esc: 0 },
]

const CSAT_RATIOS = [0.38, 0.25, 0.1, 0.05, 0.02]
const CSAT_LABELS = ['5 ★', '4 ★', '3 ★', '2 ★', '1 ★']

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export function parseDateRange(rangeLabel: string, customFrom?: string, customTo?: string): ParsedDateRange {
  const end = endOfDay(REFERENCE_END)

  if (customFrom && customTo) {
    const from = startOfDay(new Date(customFrom))
    const to = endOfDay(new Date(customTo))
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1)
    return { label: `${customFrom} – ${customTo}`, from, to, days }
  }

  if (rangeLabel.includes('–')) {
    const parts = rangeLabel.split(/\s*–\s*/)
    const from = startOfDay(new Date(parts[0]))
    const to = endOfDay(new Date(parts[1] ?? parts[0]))
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1)
    return { label: rangeLabel, from, to, days }
  }

  switch (rangeLabel) {
    case 'Today': {
      const from = startOfDay(end)
      return { label: rangeLabel, from, to: end, days: 1 }
    }
    case 'Last 30d': {
      const from = startOfDay(new Date(end))
      from.setDate(from.getDate() - 29)
      return { label: rangeLabel, from, to: end, days: 30 }
    }
    case 'This Quarter': {
      const from = startOfDay(new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1))
      const days = Math.max(1, Math.ceil((end.getTime() - from.getTime()) / 86_400_000) + 1)
      return { label: rangeLabel, from, to: end, days }
    }
    case 'Last 7d':
    default: {
      const from = startOfDay(new Date(end))
      from.setDate(from.getDate() - 6)
      return { label: rangeLabel === 'Last 7d' ? rangeLabel : 'Last 7d', from, to: end, days: 7 }
    }
  }
}

export function ticketInDateRange(ticket: Ticket, range: ParsedDateRange): boolean {
  const created = new Date(ticket.created)
  return created >= range.from && created <= range.to
}

export function filterTicketsByDateRange(tickets: Ticket[], range: ParsedDateRange): Ticket[] {
  return tickets.filter((t) => ticketInDateRange(t, range))
}

export function filterTicketsByTierLabel(tickets: Ticket[], tierLabel: string): Ticket[] {
  const normalized =
    tierLabel === 'Tier 4' ? normalizeTierFilter('Tier 4 (Falcon)') : normalizeTierFilter(tierLabel)
  if (!normalized) return tickets
  return tickets.filter((t) => String(t.currentTier) === normalized)
}

export function applyTicketFilters(tickets: Ticket[], filters: TicketFilters): Ticket[] {
  return filterTickets(tickets, filters)
}

function rangeScale(days: number): number {
  return days / 7
}

function tierFactor(tierLabel: string): number {
  return TIER_FACTORS[tierLabel] ?? 1
}

function formatDelta(base: string, scale: number, invert = false): { delta: string; direction: 'up' | 'down' | 'neutral' } {
  const numeric = parseFloat(base.replace(/[^0-9.-]/g, ''))
  if (Number.isNaN(numeric)) return { delta: base, direction: 'neutral' }
  const adjusted = numeric * scale
  const signed = invert ? -adjusted : adjusted
  if (Math.abs(signed) < 0.05) return { delta: '0', direction: 'neutral' }
  const direction = signed >= 0 ? 'up' : 'down'
  if (base.includes('pp')) return { delta: `${signed >= 0 ? '+' : ''}${signed.toFixed(1)}pp`, direction }
  if (base.includes('%')) return { delta: `${signed >= 0 ? '+' : ''}${Math.abs(adjusted).toFixed(1)}%`, direction }
  return { delta: `${signed >= 0 ? '+' : ''}${Math.round(signed)}`, direction }
}

function slaPercent(tickets: Ticket[], field: 'firstResponseSla' | 'resolutionSla', fallback: number): number {
  if (tickets.length === 0) return fallback
  const met = tickets.filter((t) => t[field].state === 'met' || t[field].state === 'on-track').length
  const blended = (met / tickets.length) * 100
  return tickets.length >= 4 ? blended : fallback * 0.4 + blended * 0.6
}

function normalizeCategory(category: string): string {
  if (category.startsWith('Shipment')) return 'Shipment'
  return category
}

function buildVolumeData(range: ParsedDateRange, factor: number) {
  const base = dashboardData.volumeData
  if (range.days <= 1) {
    const last = base[base.length - 1]
    return [{ date: last.date, created: Math.round(last.created * factor), resolved: Math.round(last.resolved * factor) }]
  }
  if (range.days <= 7) {
    return base.slice(-range.days).map((row) => ({
      date: row.date,
      created: Math.max(1, Math.round(row.created * factor)),
      resolved: Math.max(0, Math.round(row.resolved * factor)),
    }))
  }
  if (range.days <= 14) {
    return base.map((row) => ({
      date: row.date,
      created: Math.max(1, Math.round(row.created * factor * 1.1)),
      resolved: Math.max(0, Math.round(row.resolved * factor * 1.05)),
    }))
  }
  const weeks = Math.ceil(range.days / 7)
  return Array.from({ length: Math.min(weeks, 5) }, (_, i) => {
    const slice = base.slice(i * 2, i * 2 + 2)
    const created = slice.reduce((sum, row) => sum + row.created, 0)
    const resolved = slice.reduce((sum, row) => sum + row.resolved, 0)
    return {
      date: `W${i + 1}`,
      created: Math.max(1, Math.round(created * factor * 1.8)),
      resolved: Math.max(0, Math.round(resolved * factor * 1.7)),
    }
  })
}

function buildSlaData(range: ParsedDateRange, tickets: Ticket[], factor: number) {
  const base = dashboardData.slaData
  const frFallback = slaPercent(tickets, 'firstResponseSla', 91.2)
  const resFallback = slaPercent(tickets, 'resolutionSla', 83.7)
  const rows = range.days <= 7 ? base.slice(-range.days) : base
  return rows.map((row, i) => ({
    date: row.date,
    firstResponse: Math.round(Math.min(99, Math.max(70, frFallback - 3 + i * 0.6)) * (0.95 + factor * 0.05)),
    resolution: Math.round(Math.min(98, Math.max(68, resFallback - 2 + i * 0.4)) * (0.95 + factor * 0.05)),
  }))
}

function buildByCategory(tickets: Ticket[], createdTotal: number) {
  const counts = new Map<string, number>()
  for (const ticket of tickets) {
    const key = normalizeCategory(ticket.category)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  if (counts.size === 0) {
    return dashboardData.byCategory.map((row) => ({
      category: row.category,
      count: Math.max(1, Math.round(row.count * (createdTotal / 284))),
    }))
  }
  const ticketSum = [...counts.values()].reduce((a, b) => a + b, 0)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count: Math.max(1, Math.round((count / ticketSum) * createdTotal)),
    }))
}

function buildEscalationFunnel(tickets: Ticket[], createdTotal: number) {
  const tierCounts = [1, 2, 3, 4].map((tier) => tickets.filter((t) => t.currentTier === tier).length)
  const sum = tierCounts.reduce((a, b) => a + b, 0) || 1
  return TIER_LABELS.map((tier, i) => {
    const share = tierCounts[i] / sum
    const percentage = Math.max(1, Math.round(share * 100))
    return {
      tier,
      stopped: Math.max(1, Math.round(createdTotal * share)),
      percentage,
    }
  })
}

function buildCsatData(createdTotal: number) {
  const resolvedApprox = Math.round(createdTotal * 0.35)
  return CSAT_LABELS.map((rating, i) => ({
    rating,
    count: Math.max(0, Math.round(resolvedApprox * CSAT_RATIOS[i])),
  }))
}

function buildPerformanceRows(tickets: Ticket[], range: ParsedDateRange, factor: number) {
  const scale = rangeScale(range.days) * factor
  return PERFORMANCE_BASE.map((row) => {
    const owned = tickets.filter((t) => t.assignee === row.name)
    const ownedScale = owned.length > 0 ? 0.65 + owned.length * 0.12 : 0.45
    const assigned = Math.max(1, Math.round(row.assigned * scale * ownedScale))
    const resolved = Math.max(0, Math.min(assigned, Math.round(row.resolved * scale * ownedScale)))
    const fr = Math.round(slaPercent(owned.length ? owned : tickets, 'firstResponseSla', row.fr))
    const res = Math.round(slaPercent(owned.length ? owned : tickets, 'resolutionSla', row.res))
    const esc = Math.max(0, Math.round(row.esc * scale * (owned.filter((t) => t.status === 'escalated').length + 1) * 0.35))
    return {
      name: row.name,
      initials: row.initials,
      assigned,
      resolved,
      fr: `${fr}%`,
      res: `${res}%`,
      csat: (row.csat + (factor - 1) * 0.15).toFixed(1),
      esc,
    }
  })
}

export function computeDashboardAnalytics(
  allTickets: Ticket[],
  rangeLabel: string,
  tierLabel: string,
  customFrom?: string,
  customTo?: string,
): DashboardAnalytics {
  const range = parseDateRange(rangeLabel, customFrom, customTo)
  const factor = rangeScale(range.days) * tierFactor(tierLabel)

  let filteredTickets = filterTicketsByDateRange(allTickets, range)
  filteredTickets = filterTicketsByTierLabel(filteredTickets, tierLabel)

  const base = dashboardData.kpis
  const created = Math.max(filteredTickets.length, Math.round(Number(base.created.value) * factor))
  const resolved = Math.max(
    filteredTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    Math.round(Number(base.resolved.value) * factor),
  )
  const openBacklog = Math.max(
    filteredTickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length,
    Math.round(Number(base.openBacklog.value) * factor),
  )

  const frPct = slaPercent(filteredTickets, 'firstResponseSla', parseFloat(base.firstResponseSla.value))
  const resPct = slaPercent(filteredTickets, 'resolutionSla', parseFloat(base.resolutionSla.value))
  const escalated = filteredTickets.filter((t) => t.status === 'escalated').length
  const escalationRate = filteredTickets.length
    ? (escalated / filteredTickets.length) * 100
    : parseFloat(base.escalationRate.value)

  const createdDelta = formatDelta(base.created.delta, factor)
  const resolvedDelta = formatDelta(base.resolved.delta, factor)
  const backlogDelta = formatDelta(base.openBacklog.delta, factor, true)
  const frDelta = formatDelta(base.firstResponseSla.delta, factor)
  const resDelta = formatDelta(base.resolutionSla.delta, factor, true)
  const escDelta = formatDelta(base.escalationRate.delta, factor, true)
  const csatDelta = formatDelta(base.avgCsat.delta, factor)

  const avgCsat = (4.2 + (frPct - 91.2) * 0.015 + (factor - 1) * 0.08).toFixed(2)

  return {
    range,
    tierLabel,
    filteredTickets,
    kpis: {
      created: { value: created, delta: createdDelta.delta, direction: createdDelta.direction },
      resolved: { value: resolved, delta: resolvedDelta.delta, direction: resolvedDelta.direction },
      openBacklog: { value: openBacklog, delta: backlogDelta.delta, direction: backlogDelta.direction },
      firstResponseSla: { value: `${frPct.toFixed(1)}%`, delta: frDelta.delta, direction: frDelta.direction },
      resolutionSla: { value: `${resPct.toFixed(1)}%`, delta: resDelta.delta, direction: resDelta.direction },
      escalationRate: { value: `${escalationRate.toFixed(1)}%`, delta: escDelta.delta, direction: escDelta.direction },
      avgCsat: { value: avgCsat, delta: csatDelta.delta, direction: csatDelta.direction },
    },
    volumeData: buildVolumeData(range, factor),
    slaData: buildSlaData(range, filteredTickets, factor),
    escalationByTier: buildEscalationFunnel(filteredTickets, created),
    csatData: buildCsatData(created),
    byCategory: buildByCategory(filteredTickets, created),
    performanceRows: buildPerformanceRows(filteredTickets, range, factor),
    totalEscalations: created,
  }
}

export interface FalconKpiTile {
  label: string
  value: string
  color: string
}

export function computeFalconKpis(
  tickets: {
    priority: string
    category: string
    tenant: string
    timeAtFalcon: { state: SlaState; display: string }
  }[],
): FalconKpiTile[] {
  const breached = tickets.filter((t) => t.timeAtFalcon.state === 'breached').length
  const p1Security = tickets.filter((t) => t.priority === 'p1' || t.category === 'Security').length
  const tenants = new Set(tickets.map((t) => t.tenant)).size

  return [
    { label: 'Open at Falcon', value: String(tickets.length), color: 'text-foreground' },
    { label: 'Breached at Falcon', value: String(breached), color: breached > 0 ? 'text-danger' : 'text-success' },
    { label: 'P1 / Security', value: String(p1Security), color: p1Security > 0 ? 'text-danger' : 'text-foreground' },
    { label: 'Median time at Falcon', value: tickets.length ? `${1 + tickets.length}h ${8 + tickets.length * 3}m` : '—', color: 'text-foreground' },
    { label: 'Tenants escalating', value: String(tenants), color: tenants > 2 ? 'text-warning' : 'text-foreground' },
  ]
}
