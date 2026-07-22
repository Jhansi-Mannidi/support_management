'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatedNumber, MotionCard, MotionItem, MotionReveal, MotionStagger, PageContainer } from '@/components/motion/motion-primitives'
import { useToast } from '@/components/ui/toast-provider'
import { useChartColors } from '@/lib/use-chart-colors'
import { mockTickets } from '@/lib/mock-data'
import { computeDashboardAnalytics } from '@/lib/analytics'
import { ticketMatchesSlaState, filterByRegion } from '@/lib/ticket-filters'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'
import { exportPerformanceMetrics, exportTickets } from '@/lib/export-utils'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaTimer, SlaBadge } from '@/components/ui/sla-timer'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DashboardViewSwitcher, useDashboardHashScroll } from '@/components/dashboard/dashboard-view-switcher'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, Download,
  BarChart3, Filter, Calendar, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, Zap, Star,
} from 'lucide-react'

const CHART_PALETTE = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'chart2'] as const

function KpiCard({
  label, value, delta, direction, icon: Icon, color = 'brand',
}: {
  label: string; value: string | number; delta: string; direction: 'up' | 'down' | 'neutral'; icon: React.ElementType; color?: string
}) {
  const positive = direction === 'up'
  const isNeutral = direction === 'neutral'
  return (
    <MotionCard className="p-4 flex flex-col gap-3" hover>
      <div className="flex items-start justify-between">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.05 }}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            color === 'brand' && 'bg-brand/10 text-brand',
            color === 'success' && 'bg-success-bg text-success',
            color === 'warning' && 'bg-warning-bg text-warning',
            color === 'danger' && 'bg-danger-bg text-danger',
            color === 'info' && 'bg-info-bg text-info',
          )}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
        <div className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
          positive ? 'bg-success-bg text-success' : isNeutral ? 'bg-muted text-muted-foreground' : 'bg-danger-bg text-danger',
        )}>
          {positive ? <TrendingUp className="h-3 w-3" /> : isNeutral ? <Minus className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      </div>
      <div>
        <AnimatedNumber value={value} className="text-2xl font-bold tabular-nums" />
        <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
      </div>
    </MotionCard>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg text-[12px]">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium">{p.value}{p.name.includes('sla') || p.name === 'firstResponse' || p.name === 'resolution' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  )
}

const RANGE_OPTIONS = ['Today', 'Last 7d', 'Last 30d', 'This Quarter']

export default function DashboardPage() {
  const [range, setRange] = useState('Last 7d')
  const [tierFilter, setTierFilter] = useState('All')
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [customFrom, setCustomFrom] = useState('2025-07-15')
  const [customTo, setCustomTo] = useState('2025-07-22')
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const { region } = useAppPreferences()
  const chart = useChartColors()
  const csatColors = [chart.success, chart.chart3, chart.warning, chart.danger, chart.danger]

  useDashboardHashScroll()

  const isCustomRange = range.includes('–')

  const regionTickets = useMemo(() => filterByRegion(mockTickets, region), [region])

  const analytics = useMemo(
    () =>
      computeDashboardAnalytics(
        regionTickets,
        range,
        tierFilter,
        isCustomRange ? customFrom : undefined,
        isCustomRange ? customTo : undefined,
      ),
    [regionTickets, range, tierFilter, customFrom, customTo, isCustomRange],
  )

  const { kpis, volumeData, slaData, escalationByTier, csatData, byCategory, performanceRows, filteredTickets, totalEscalations } = analytics

  const breachedTickets = useMemo(
    () => filteredTickets.filter((t) => ticketMatchesSlaState(t, 'breached')),
    [filteredTickets],
  )
  const atRiskTickets = useMemo(
    () => filteredTickets.filter((t) => ticketMatchesSlaState(t, 'at-risk')),
    [filteredTickets],
  )

  const tierSubtitle = tierFilter === 'All' ? 'All tiers' : tierFilter

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast({ title: 'Dashboard refreshed', description: `Metrics updated for ${range}.`, variant: 'success' })
    }, 800)
  }

  const handleExport = () => {
    const ticketCount = exportTickets(`dashboard-tickets-${range.replace(/\s+/g, '-').toLowerCase()}.csv`, filteredTickets)
    toast({
      title: 'Export complete',
      description: `${ticketCount} ticket(s) exported for ${range}${tierFilter !== 'All' ? ` · ${tierFilter}` : ''}.`,
      variant: 'success',
    })
  }

  const handleExportPerformance = () => {
    const count = exportPerformanceMetrics(
      `responder-performance-${range.replace(/\s+/g, '-').toLowerCase()}.csv`,
      performanceRows.map((r) => ({
        name: r.name,
        assigned: r.assigned,
        resolved: r.resolved,
        firstResponseSla: r.fr,
        resolutionSla: r.res,
        avgCsat: r.csat,
        escalated: r.esc,
      }))
    )
    toast({ title: 'Export complete', description: `${count} responder row(s) downloaded as CSV.`, variant: 'success' })
  }

  const applyCustomRange = () => {
    setRange(`${customFrom} – ${customTo}`)
    setShowCustomRange(false)
    toast({ title: 'Date range applied', description: `Showing metrics from ${customFrom} to ${customTo}.`, variant: 'success' })
  }

  return (
    <PageContainer className="space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Meridian Freight &mdash; {tierSubtitle} &mdash; {range}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DashboardViewSwitcher />
            {/* Range toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
              {RANGE_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded-md px-3 py-1 text-[12px] font-medium transition-all',
                    range === r ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium transition-all',
                showCustomRange ? 'border-brand/30 text-brand bg-brand/5' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Custom
            </button>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground outline-none hover:border-brand/40 cursor-pointer"
            >
              {['All', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'].map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'Tier: All' : t}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-hover transition-all shadow-sm shadow-brand/20"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </motion.div>

        <MotionReveal show={showCustomRange}>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">From</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="mt-1 block rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">To</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="mt-1 block rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand" />
            </div>
            <button
              type="button"
              onClick={applyCustomRange}
              className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover"
            >
              Apply range
            </button>
          </div>
        </MotionReveal>

        {/* Breach / At-Risk alert bar */}
        {(breachedTickets.length > 0 || atRiskTickets.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border border-danger/30 bg-danger-bg/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
              <span className="text-[13px] font-medium text-danger">
                {breachedTickets.length} breached · {atRiskTickets.length} at-risk right now
              </span>
            </div>
            <Link
              href="/app/queue/list?sla=attention&from=dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              View in Queue <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}

        {/* KPI cards */}
        <MotionStagger immediate key={`kpis-${range}-${tierFilter}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          <KpiCard label="Tickets Created" value={kpis.created.value} delta={kpis.created.delta} direction={kpis.created.direction} icon={BarChart3} color="brand" />
          <KpiCard label="Resolved" value={kpis.resolved.value} delta={kpis.resolved.delta} direction={kpis.resolved.direction} icon={CheckCircle2} color="success" />
          <KpiCard label="Open Backlog" value={kpis.openBacklog.value} delta={kpis.openBacklog.delta} direction={kpis.openBacklog.direction} icon={Clock} color="warning" />
          <KpiCard label="1st Response SLA" value={kpis.firstResponseSla.value} delta={kpis.firstResponseSla.delta} direction={kpis.firstResponseSla.direction} icon={Zap} color="info" />
          <KpiCard label="Resolution SLA" value={kpis.resolutionSla.value} delta={kpis.resolutionSla.delta} direction={kpis.resolutionSla.direction} icon={CheckCircle2} color="danger" />
          <KpiCard label="Escalation Rate" value={kpis.escalationRate.value} delta={kpis.escalationRate.delta} direction={kpis.escalationRate.direction} icon={TrendingDown} color="warning" />
          <KpiCard label="Avg CSAT" value={`${kpis.avgCsat.value}/5`} delta={kpis.avgCsat.delta} direction={kpis.avgCsat.direction} icon={Star} color="success" />
        </MotionStagger>

        {/* Charts row 1 */}
        <MotionStagger immediate key={`charts-1-${range}-${tierFilter}`} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MotionItem className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold">Ticket Volume</h2>
                <p className="text-[12px] text-muted-foreground">Created vs resolved over {range}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-all"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart key={`volume-${range}-${tierFilter}`} data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient key="gc" id="vw-gradCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop key="gc-s1" offset="5%" stopColor={chart.chart1} stopOpacity={0.2} />
                    <stop key="gc-s2" offset="95%" stopColor={chart.chart1} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient key="gr" id="vw-gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop key="gr-s1" offset="5%" stopColor={chart.chart2} stopOpacity={0.2} />
                    <stop key="gr-s2" offset="95%" stopColor={chart.chart2} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="created" stroke={chart.chart1} strokeWidth={2} fill="url(#vw-gradCreated)" dot={false} name="Created" animationDuration={1200} />
                <Area type="monotone" dataKey="resolved" stroke={chart.chart2} strokeWidth={2} fill="url(#vw-gradResolved)" dot={false} name="Resolved" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full inline-block bg-chart-1" /><span className="text-[11px] text-muted-foreground">Created</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full inline-block bg-chart-2" /><span className="text-[11px] text-muted-foreground">Resolved</span></div>
            </div>
          </MotionItem>

          <MotionItem className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold">By Category</h2>
              <p className="text-[12px] text-muted-foreground">Ticket distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart key={`category-${range}-${tierFilter}`} data={byCategory} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={chart.chart1} radius={[0, 4, 4, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </MotionItem>
        </MotionStagger>

        <MotionStagger immediate key={`charts-2-${range}-${tierFilter}`} className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* SLA Compliance */}
          <MotionItem className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold">SLA Compliance Trend</h2>
              <p className="text-[12px] text-muted-foreground">First response &amp; resolution SLA adherence (%)</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart key={`sla-${range}-${tierFilter}`} data={slaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: chart.muted }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="firstResponse" stroke={chart.success} strokeWidth={2} dot={{ r: 3 }} name="1st Response" animationDuration={1200} />
                <Line type="monotone" dataKey="resolution" stroke={chart.warning} strokeWidth={2} dot={{ r: 3 }} name="Resolution" strokeDasharray="4 2" animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full inline-block bg-success" /><span className="text-[11px] text-muted-foreground">1st Response</span></div>
              <div className="flex items-center gap-1.5"><span className="h-0.5 w-4 inline-block bg-warning" /><span className="text-[11px] text-muted-foreground">Resolution</span></div>
            </div>
          </MotionItem>

          {/* Escalation Funnel */}
          <MotionItem className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold">Escalation Funnel</h2>
              <p className="text-[12px] text-muted-foreground">Tickets stopped at each tier</p>
            </div>
            <div className="space-y-3 mt-2">
              {escalationByTier.map((row, i) => (
                <div key={row.tier}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-medium text-foreground">{row.tier}</span>
                    <span className="tabular-nums text-muted-foreground">{row.stopped} <span className="text-[11px]">({row.percentage}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: chart[CHART_PALETTE[i]] }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">Total escalations this period</p>
              <p className="text-xl font-bold tabular-nums mt-0.5">{totalEscalations}</p>
            </div>
          </MotionItem>
        </MotionStagger>

        <MotionStagger immediate key={`charts-3-${range}-${tierFilter}`} className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* CSAT distribution */}
          <MotionItem className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold">CSAT Distribution</h2>
              <p className="text-[12px] text-muted-foreground">Customer satisfaction ratings</p>
            </div>
            <div className="flex items-center justify-center mb-2">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={csatData} dataKey="count" nameKey="rating" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} animationDuration={1000}>
                    {csatData.map((entry, i) => (
                      <Cell key={`csat-cell-${entry.rating}`} fill={csatColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {csatData.map((row, i) => (
                <div key={row.rating} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: csatColors[i] }} />
                    <span className="text-muted-foreground">{row.rating}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
          </MotionItem>

          {/* Recent SLA breaches */}
          <MotionItem className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold">Recent Breached &amp; At-Risk Tickets</h2>
                <p className="text-[12px] text-muted-foreground">Requires immediate attention</p>
              </div>
              <Link href="/app/queue/list" className="text-[12px] text-brand hover:underline font-medium flex items-center gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {[...breachedTickets, ...atRiskTickets].slice(0, 5).map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                <Link
                  href={`/app/tickets/${ticket.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-all group"
                >
                  <div className="shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">{ticket.id}</span>
                      <span className="text-[13px] font-medium truncate">{ticket.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={ticket.status} />
                      <span className="text-[11px] text-muted-foreground">{ticket.tenant}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <SlaBadge state={ticket.resolutionSla.state} display={ticket.resolutionSla.display} size="sm" />
                    <p className="text-[11px] text-muted-foreground mt-1">{ticket.lastActivity}</p>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </MotionItem>
        </MotionStagger>

        {/* Responder Performance table */}
        <div id="reports" className="scroll-mt-6">
        <MotionItem className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <div>
              <h2 className="text-[14px] font-semibold">Responder Performance</h2>
              <p className="text-[12px] text-muted-foreground">Individual agent metrics for {range}</p>
            </div>
            <button
              onClick={handleExportPerformance}
              className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Responder','Assigned','Resolved','1st Resp SLA','Res SLA','Avg CSAT','Escalated'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {performanceRows.map(r => (
                  <tr key={r.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[11px] font-bold">{r.initials}</div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.assigned}</td>
                    <td className="px-4 py-3 tabular-nums">{r.resolved}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[12px] font-semibold', parseFloat(r.fr) >= 90 ? 'text-success' : 'text-danger')}>{r.fr}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[12px] font-semibold', parseFloat(r.res) >= 85 ? 'text-success' : 'text-warning')}>{r.res}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span className="tabular-nums">{r.csat}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('tabular-nums font-semibold', r.esc > 4 ? 'text-danger' : r.esc > 1 ? 'text-warning' : 'text-success')}>{r.esc}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionItem>
        </div>

      </PageContainer>
  )
}
