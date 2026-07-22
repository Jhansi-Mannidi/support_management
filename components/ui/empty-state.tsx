'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import React from 'react'
import { scaleInVariants } from '@/lib/motion'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariants}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center',
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
        >
          <Icon className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      )}
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-1"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
