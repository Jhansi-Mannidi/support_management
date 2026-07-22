'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { resolveBreadcrumbs, type BreadcrumbItem } from '@/lib/breadcrumbs'
import { useBreadcrumbOverrides } from '@/components/providers/breadcrumb-provider'

interface AppBreadcrumbsProps {
  tenant?: string
  className?: string
  locationHash?: string
}

function truncateLabel(label: string, max = 28): string {
  if (label.length <= max) return label
  return `${label.slice(0, max - 1)}…`
}

function CrumbLink({ item, isLast }: { item: BreadcrumbItem; isLast: boolean }) {
  if (isLast || !item.href) {
    return (
      <span
        className={cn(
          'truncate font-medium',
          isLast ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}
        title={item.label}
      >
        {truncateLabel(item.label, isLast ? 36 : 24)}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      className="truncate text-muted-foreground transition-colors hover:text-brand"
      title={item.label}
    >
      {truncateLabel(item.label, 24)}
    </Link>
  )
}

export function AppBreadcrumbs({ tenant, className, locationHash = '' }: AppBreadcrumbsProps) {
  const pathname = usePathname()
  const { overrides } = useBreadcrumbOverrides()

  const items = resolveBreadcrumbs(pathname ?? '', {
    hash: locationHash,
    ticketLabel: overrides.ticketLabel,
    categoryLabel: overrides.categoryLabel,
  })

  if (overrides.pageLabel && items.length > 0) {
    items[items.length - 1] = { ...items[items.length - 1], label: overrides.pageLabel }
  }

  const displayItems =
    items.length > 4
      ? [items[0], { label: '…', href: undefined }, ...items.slice(-2)]
      : items

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex min-w-0 items-center gap-2', className)}
    >
      {tenant && (
        <>
          <span className="hidden shrink-0 rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
            {tenant}
          </span>
          <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/35 sm:block" aria-hidden />
        </>
      )}

      <ol className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
        {displayItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.label === '…'

          return (
            <motion.li
              key={`${item.label}-${index}`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="flex min-w-0 items-center gap-0.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-muted-foreground/45"
                  aria-hidden
                />
              )}

              {isEllipsis ? (
                <span className="px-0.5 text-muted-foreground/60">…</span>
              ) : (
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-none">
                  {isFirst && item.href === '/app/dashboard' && (
                    <Home className="h-3.5 w-3.5 shrink-0 text-muted-foreground/55" aria-hidden />
                  )}
                  <CrumbLink item={item} isLast={isLast} />
                </span>
              )}
            </motion.li>
          )
        })}
      </ol>
    </nav>
  )
}
