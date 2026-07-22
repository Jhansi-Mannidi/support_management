'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { mockTickets } from '@/lib/mock-data'
import { exportTickets } from '@/lib/export-utils'
import {
  filterTickets,
  filterByRegion,
  normalizeCategoryFilter,
  normalizePriorityFilter,
  normalizeStatusFilter,
  normalizeTierFilter,
  resolveSavedSearch,
} from '@/lib/ticket-filters'
import type { SlaState } from '@/components/ui/sla-timer'
import { addRecentSearch, getRecentSearches } from '@/lib/recent-searches'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { SlaBadge } from '@/components/ui/sla-timer'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Search, Clock, Tag, User, Building2, SlidersHorizontal,
  ArrowRight, X, Sparkles, ChevronRight,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'

const FILTER_OPTIONS = {
  status: ['All', 'New', 'Open', 'Escalated', 'Pending Requester', 'Resolved', 'Closed'],
  priority: ['All', 'P1 Critical', 'P2 High', 'P3 Medium', 'P4 Low'],
  tier: ['All', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4 (Falcon)'],
  category: ['All', 'Technical', 'Billing', 'Shipment/Tracking', 'How-to', 'Security', 'Bug'],
}

const POPULAR = ['SLA breached today', 'Unassigned tickets', 'Falcon escalations', 'CSAT pending']

export default function SearchPage() {
  const { toast } = useToast()
  const { region } = useAppPreferences()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [tierFilter, setTierFilter] = useState('All')
  const [filterSla, setFilterSla] = useState<SlaState | ''>('')
  const [filterAssignee, setFilterAssignee] = useState<'assigned' | 'unassigned' | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecentSearches(getRecentSearches())
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        setActive(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const structuredFilters = useMemo(
    () => ({
      search: query,
      status: normalizeStatusFilter(statusFilter),
      priority: normalizePriorityFilter(priorityFilter),
      category: normalizeCategoryFilter(categoryFilter),
      tier: normalizeTierFilter(tierFilter),
      slaState: filterSla,
      assignee: filterAssignee,
    }),
    [query, statusFilter, priorityFilter, categoryFilter, tierFilter, filterSla, filterAssignee]
  )

  const hasStructuredFilter =
    !!structuredFilters.status ||
    !!structuredFilters.priority ||
    !!structuredFilters.category ||
    !!structuredFilters.tier ||
    !!structuredFilters.slaState ||
    !!structuredFilters.assignee

  const results = useMemo(() => {
    if (query.length <= 1 && !hasStructuredFilter) return []
    return filterByRegion(filterTickets(mockTickets, structuredFilters), region)
  }, [structuredFilters, query, hasStructuredFilter, region])

  const hasActiveFilters =
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    tierFilter !== 'All' ||
    !!filterSla ||
    !!filterAssignee ||
    query.length > 0

  const clearFilters = () => {
    setQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
    setTierFilter('All')
    setFilterSla('')
    setFilterAssignee('')
  }

  const runSearch = (term: string, fromSaved = false) => {
    if (fromSaved) {
      const resolved = resolveSavedSearch(term)
      setQuery(resolved.query)
      setStatusFilter('All')
      setPriorityFilter('All')
      setCategoryFilter('All')
      setTierFilter('All')
      setFilterSla(resolved.filters.slaState ?? '')
      setFilterAssignee(resolved.filters.assignee ?? '')
      if (resolved.filters.status === 'escalated') setStatusFilter('Escalated')
      if (resolved.filters.tier === '4') setTierFilter('Tier 4 (Falcon)')
      if (resolved.filters.assignee === 'unassigned') setQuery('')
    } else {
      setQuery(term)
    }
    setRecentSearches(addRecentSearch(term))
    inputRef.current?.focus()
  }

  const handleExport = () => {
    const count = exportTickets(`search-results-${Date.now()}.csv`, results)
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'Run a search or apply filters first.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} ticket(s) downloaded as CSV.`, variant: 'success' })
  }

  function highlight(text: string, q: string) {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded-sm bg-brand/20 px-0.5 font-semibold text-brand not-italic">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const showResults = query.length > 1 || hasStructuredFilter

  return (
    <PageContainer className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Global Search</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Search tickets, users, tenants, and more</p>
        </div>

        <div className={cn(
          'relative rounded-xl border bg-card transition-all duration-200',
          active ? 'border-brand shadow-lg ring-2 ring-brand/20' : 'border-border',
        )}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className={cn('h-5 w-5 shrink-0 transition-colors', active ? 'text-brand' : 'text-muted-foreground')} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) setRecentSearches(addRecentSearch(query.trim()))
              }}
              placeholder="Search by ticket ID, subject, tenant, requester, shipment ref…"
              className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Global search"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="rounded-md p-0.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">⌘K</kbd>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium transition-all',
              showFilters ? 'border-brand/30 bg-brand/10 text-brand' : 'bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          {showFilters && (
            <>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground outline-none hover:border-brand/50">
                {FILTER_OPTIONS.status.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground outline-none hover:border-brand/50">
                {FILTER_OPTIONS.priority.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground outline-none hover:border-brand/50">
                {FILTER_OPTIONS.category.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground outline-none hover:border-brand/50">
                {FILTER_OPTIONS.tier.map((s) => <option key={s}>{s}</option>)}
              </select>
            </>
          )}
          <ClearFiltersButton visible={hasActiveFilters} onClear={clearFilters} />
          <div className="ml-auto flex items-center gap-2">
            {showResults && (
              <span className="text-[12px] text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
            <ListToolbarActions onExport={handleExport} exportDisabled={!showResults || results.length === 0} />
          </div>
        </div>

        {!showResults && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Searches
              </h2>
              <div className="space-y-1">
                {(recentSearches.length ? recentSearches : ['TKT-10431', 'container tracking', 'billing duplicate']).map((s) => (
                  <button key={s} type="button" onClick={() => runSearch(s)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-all hover:bg-muted">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{s}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
                <Sparkles className="h-4 w-4 text-brand" />
                Saved Filters
              </h2>
              <div className="space-y-1">
                {POPULAR.map((s) => (
                  <button key={s} type="button" onClick={() => runSearch(s, true)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-all hover:bg-muted">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="flex-1 text-foreground">{s}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showResults && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-12">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-[14px] font-medium">No results found</p>
                <p className="text-[12px] text-muted-foreground">Try a different search term or adjust the filters</p>
              </div>
            ) : (
              results.map((ticket) => (
                <Link key={ticket.id} href={`/app/tickets/${ticket.id}`} className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/30 hover:shadow-md">
                  <PriorityBadge priority={ticket.priority} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-muted-foreground">{ticket.id}</span>
                      <span className="text-[14px] font-semibold leading-snug transition-colors group-hover:text-brand">
                        {highlight(ticket.subject, query)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                      <StatusBadge status={ticket.status} />
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{ticket.category}</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{highlight(ticket.tenant, query)}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{highlight(ticket.requester, query)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <SlaBadge state={ticket.resolutionSla.state} display={ticket.resolutionSla.display} size="sm" />
                    <span className="text-[11px] text-muted-foreground">{ticket.lastActivity}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </PageContainer>
  )
}
