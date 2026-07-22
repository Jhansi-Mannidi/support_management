import type { Ticket } from '@/lib/mock-data'

export interface CsvColumn<T> {
  header: string
  accessor: (row: T) => string | number | boolean | undefined | null
}

function escapeCsvValue(value: string | number | boolean | undefined | null): string {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): number {
  if (rows.length === 0) return 0
  const header = columns.map((c) => escapeCsvValue(c.header)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCsvValue(c.accessor(row))).join(','))
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return rows.length
}

export function ticketCsvColumns(): CsvColumn<Ticket>[] {
  return [
    { header: 'Ticket ID', accessor: (t) => t.id },
    { header: 'Subject', accessor: (t) => t.subject },
    { header: 'Priority', accessor: (t) => t.priority.toUpperCase() },
    { header: 'Status', accessor: (t) => t.status },
    { header: 'Category', accessor: (t) => t.category },
    { header: 'Requester', accessor: (t) => t.requester },
    { header: 'Tenant', accessor: (t) => t.tenant },
    { header: 'Tier', accessor: (t) => t.currentTier },
    { header: 'Assignee', accessor: (t) => t.assignee ?? 'Unassigned' },
    { header: 'First Response SLA', accessor: (t) => t.firstResponseSla.display },
    { header: 'First Response State', accessor: (t) => t.firstResponseSla.state },
    { header: 'Resolution SLA', accessor: (t) => t.resolutionSla.display },
    { header: 'Resolution State', accessor: (t) => t.resolutionSla.state },
    { header: 'Last Activity', accessor: (t) => t.lastActivity },
    { header: 'Created', accessor: (t) => t.created },
    { header: 'Channel', accessor: (t) => t.channel },
    { header: 'Shipment Ref', accessor: (t) => t.shipmentRef ?? '' },
  ]
}

export function exportTickets(filename: string, tickets: Ticket[]): number {
  return downloadCsv(filename, tickets, ticketCsvColumns())
}

export interface NotificationRow {
  id: string
  type: string
  title: string
  ticket?: string
  time: string
  read: boolean
}

export function exportNotifications(filename: string, rows: NotificationRow[]): number {
  return downloadCsv(filename, rows, [
    { header: 'ID', accessor: (n) => n.id },
    { header: 'Type', accessor: (n) => n.type },
    { header: 'Title', accessor: (n) => n.title },
    { header: 'Ticket', accessor: (n) => n.ticket ?? '' },
    { header: 'Time', accessor: (n) => n.time },
    { header: 'Read', accessor: (n) => (n.read ? 'Yes' : 'No') },
  ])
}

export interface CategoryExportRow {
  category: string
  subCategory: string
  defaultPriority: string
  slaPolicy: string
  tier: number | string
  active: boolean
  ticketCount: number
}

export function exportCategories(filename: string, rows: CategoryExportRow[]): number {
  return downloadCsv(filename, rows, [
    { header: 'Category', accessor: (r) => r.category },
    { header: 'Sub-category', accessor: (r) => r.subCategory },
    { header: 'Default Priority', accessor: (r) => r.defaultPriority },
    { header: 'SLA Policy', accessor: (r) => r.slaPolicy },
    { header: 'Tier', accessor: (r) => r.tier },
    { header: 'Active', accessor: (r) => (r.active ? 'Yes' : 'No') },
    { header: 'Ticket Count', accessor: (r) => r.ticketCount },
  ])
}

export interface SlaPolicyExportRow {
  policy: string
  priority: string
  firstResponse: string
  resolution: string
  appliesTo: string
  businessHours: string
  active: boolean
}

export function exportSlaPolicies(filename: string, rows: SlaPolicyExportRow[]): number {
  return downloadCsv(filename, rows, [
    { header: 'Policy', accessor: (r) => r.policy },
    { header: 'Priority', accessor: (r) => r.priority },
    { header: 'First Response', accessor: (r) => r.firstResponse },
    { header: 'Resolution', accessor: (r) => r.resolution },
    { header: 'Applies To', accessor: (r) => r.appliesTo },
    { header: 'Business Hours', accessor: (r) => r.businessHours },
    { header: 'Active', accessor: (r) => (r.active ? 'Yes' : 'No') },
  ])
}

export interface FalconTicketExportRow {
  id: string
  priority: string
  tenant: string
  subject: string
  category: string
  escalatedVia: string
  timeAtFalcon: string
  slaState: string
  assignee: string
  status: string
}

export function exportFalconTickets(filename: string, rows: FalconTicketExportRow[]): number {
  return downloadCsv(filename, rows, [
    { header: 'Ticket ID', accessor: (r) => r.id },
    { header: 'Priority', accessor: (r) => r.priority.toUpperCase() },
    { header: 'Tenant', accessor: (r) => r.tenant },
    { header: 'Subject', accessor: (r) => r.subject },
    { header: 'Category', accessor: (r) => r.category },
    { header: 'Escalated Via', accessor: (r) => r.escalatedVia },
    { header: 'Time at Falcon', accessor: (r) => r.timeAtFalcon },
    { header: 'SLA State', accessor: (r) => r.slaState },
    { header: 'Assignee', accessor: (r) => r.assignee },
    { header: 'Status', accessor: (r) => r.status },
  ])
}

export interface PerformanceExportRow {
  name: string
  assigned: number
  resolved: number
  firstResponseSla: string
  resolutionSla: string
  avgCsat: string
  escalated: number
}

export function exportPerformanceMetrics(filename: string, rows: PerformanceExportRow[]): number {
  return downloadCsv(filename, rows, [
    { header: 'Responder', accessor: (r) => r.name },
    { header: 'Assigned', accessor: (r) => r.assigned },
    { header: 'Resolved', accessor: (r) => r.resolved },
    { header: '1st Response SLA', accessor: (r) => r.firstResponseSla },
    { header: 'Resolution SLA', accessor: (r) => r.resolutionSla },
    { header: 'Avg CSAT', accessor: (r) => r.avgCsat },
    { header: 'Escalated', accessor: (r) => r.escalated },
  ])
}

export interface DashboardKpiExportRow {
  metric: string
  value: string
  delta: string
  range: string
}

export function exportDashboardSummary(
  filename: string,
  kpis: DashboardKpiExportRow[],
  tickets: Ticket[]
): number {
  const kpiCount = downloadCsv(`${filename.replace('.csv', '')}-kpis.csv`, kpis, [
    { header: 'Metric', accessor: (r) => r.metric },
    { header: 'Value', accessor: (r) => r.value },
    { header: 'Delta', accessor: (r) => r.delta },
    { header: 'Range', accessor: (r) => r.range },
  ])
  const ticketCount = exportTickets(`${filename.replace('.csv', '')}-tickets.csv`, tickets)
  return kpiCount + ticketCount
}
