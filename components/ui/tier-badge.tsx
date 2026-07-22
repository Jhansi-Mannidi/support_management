'use client'

import { cn } from '@/lib/utils'

export type TierLevel = 1 | 2 | 3 | 4

const tierConfig: Record<TierLevel, { label: string; sublabel: string; className: string }> = {
  1: { label: 'T1', sublabel: 'Department', className: 'bg-info-bg text-info border-info/20' },
  2: { label: 'T2', sublabel: 'Branch', className: 'bg-brand-subtle text-brand border-brand/20' },
  3: { label: 'T3', sublabel: 'Company', className: 'bg-warning-bg text-warning border-warning/20' },
  4: { label: 'T4', sublabel: 'Falcon', className: 'bg-muted text-foreground border-border' },
}

interface TierBadgeProps {
  tier: TierLevel
  className?: string
  showSublabel?: boolean
}

export function TierBadge({ tier, className, showSublabel = true }: TierBadgeProps) {
  const config = tierConfig[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[12px] font-semibold',
        config.className,
        className
      )}
    >
      {/* Ladder dots */}
      <span className="flex flex-col gap-[2px]">
        {[4, 3, 2, 1].map((t) => (
          <span
            key={t}
            className={cn(
              'block h-[3px] w-[3px] rounded-full',
              t <= tier ? 'bg-current opacity-100' : 'bg-current opacity-25'
            )}
          />
        ))}
      </span>
      <span>{config.label}</span>
      {showSublabel && <span className="font-normal opacity-70">{config.sublabel}</span>}
    </span>
  )
}

export function TierStepper({
  currentTier,
  className,
}: {
  currentTier: TierLevel
  className?: string
}) {
  const tiers: { tier: TierLevel; label: string }[] = [
    { tier: 1, label: 'Dept' },
    { tier: 2, label: 'Branch' },
    { tier: 3, label: 'Company' },
    { tier: 4, label: 'Falcon' },
  ]
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {tiers.map(({ tier, label }, i) => (
        <div key={tier} className="flex items-center gap-1">
          <div
            className={cn(
              'flex h-5 min-w-[28px] items-center justify-center rounded px-1.5 text-[10px] font-semibold',
              tier < currentTier
                ? 'bg-success-bg text-success'
                : tier === currentTier
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {label}
          </div>
          {i < tiers.length - 1 && (
            <div
              className={cn(
                'h-px w-4',
                tier < currentTier ? 'bg-success' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
