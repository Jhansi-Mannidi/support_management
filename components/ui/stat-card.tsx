'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import React from 'react'
import { AnimatedNumber } from '@/components/motion/motion-primitives'
import { staggerItemVariants } from '@/lib/motion'

interface StatCardProps {
  label: string
  value: string | number
  delta?: { value: string; direction: 'up' | 'down' | 'neutral'; positive?: boolean }
  icon?: React.ElementType
  accent?: string
  className?: string
  sublabel?: string
  animate?: boolean
}

export function StatCard({ label, value, delta, icon: Icon, accent, className, sublabel, animate = true }: StatCardProps) {
  const DeltaIcon =
    delta?.direction === 'up'
      ? TrendingUp
      : delta?.direction === 'down'
      ? TrendingDown
      : Minus

  const deltaColor =
    delta?.direction === 'neutral'
      ? 'text-muted-foreground'
      : delta?.positive
      ? delta?.direction === 'up'
        ? 'text-success'
        : 'text-danger'
      : delta?.direction === 'up'
      ? 'text-danger'
      : 'text-success'

  return (
    <motion.div
      variants={animate ? staggerItemVariants : undefined}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md',
        className
      )}
    >
      {accent && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute left-0 top-0 h-full w-1 origin-top rounded-l-xl"
          style={{ backgroundColor: accent }}
        />
      )}
      <div className={cn('flex items-start justify-between', accent && 'pl-2')}>
        <div className="flex-1">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            {animate ? (
              <AnimatedNumber value={value} className="text-2xl font-bold tabular-nums text-foreground" />
            ) : (
              <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
            )}
            {delta && (
              <span className={cn('flex items-center gap-0.5 text-[11px] font-medium', deltaColor)}>
                <DeltaIcon className="h-3 w-3" />
                {delta.value}
              </span>
            )}
          </div>
          {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>}
        </div>
        {Icon && (
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="rounded-lg bg-muted p-2"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
