'use client'

import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_REGIONS } from '@/lib/regions'
import { useAppPreferences } from '@/components/providers/app-preferences-provider'
import { useToast } from '@/components/ui/toast-provider'

export function RegionFilter({ className }: { className?: string }) {
  const { region, setRegion } = useAppPreferences()
  const { toast } = useToast()

  return (
    <div className={cn('relative', className)}>
      <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <select
        value={region}
        onChange={(e) => {
          const next = e.target.value as typeof region
          setRegion(next)
          const label = APP_REGIONS.find((r) => r.value === next)?.label ?? next
          toast({
            title: 'Region filter updated',
            description: next === 'all' ? 'Showing tickets from all regions.' : `Showing ${label} data only.`,
            variant: 'info',
          })
        }}
        aria-label="Filter by region"
        className="focus-ring h-8 cursor-pointer appearance-none rounded-lg border border-border bg-muted/50 pl-8 pr-8 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
      >
        {APP_REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
