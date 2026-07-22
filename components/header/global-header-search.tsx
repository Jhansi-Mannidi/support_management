'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowRight, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockTickets } from '@/lib/mock-data'
import { filterTickets } from '@/lib/ticket-filters'
import { matchesRegion } from '@/lib/regions'
import { addRecentSearch } from '@/lib/recent-searches'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'
import { dropdownVariants } from '@/lib/motion'
import { PriorityBadge } from '@/components/ui/priority-badge'

export function GlobalHeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const { region } = useAppPreferences()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 1) return []
    return filterTickets(mockTickets, { search: q }).filter((t) => matchesRegion(t.tenant, region)).slice(0, 8)
  }, [query, region])

  const showDropdown = open && query.trim().length >= 1

  const goToSearchPage = () => {
    const q = query.trim()
    if (!q) return
    addRecentSearch(q)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (results.length === 1) {
                addRecentSearch(query.trim())
                setOpen(false)
                router.push(`/app/tickets/${results[0].id}`)
                return
              }
              goToSearchPage()
            }
          }}
          placeholder="Search tickets, requesters, IDs…"
          aria-label="Global search"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className="focus-ring h-9 w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-20 text-[13px] text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/60 focus:bg-card"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </div>

      <AnimatePresence>
        {showDropdown && query.trim().length >= 1 && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
          >
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                No tickets match &ldquo;{query.trim()}&rdquo;
                {region !== 'all' && ` in ${region}`}.
              </div>
            ) : (
              <ul className="max-h-[320px] overflow-y-auto py-1 scrollbar-thin">
                {results.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/app/tickets/${ticket.id}`}
                      onClick={() => {
                        addRecentSearch(query.trim())
                        setOpen(false)
                        setQuery('')
                      }}
                      className="flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
                    >
                      <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground">{ticket.id}</span>
                          <PriorityBadge priority={ticket.priority} size="sm" />
                        </div>
                        <p className="truncate text-[13px] font-medium text-foreground">{ticket.subject}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {ticket.requester} · {ticket.tenant}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border bg-muted/30 px-3 py-2">
              <button
                type="button"
                onClick={goToSearchPage}
                className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium text-brand transition-colors hover:bg-accent"
              >
                View all results <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

