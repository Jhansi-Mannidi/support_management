'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import React from 'react'
import { fadeUpVariants } from '@/lib/motion'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      className={cn('workspace-header flex flex-col gap-1 backdrop-blur-sm', className)}
    >
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="text-xl font-semibold text-foreground"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="mt-0.5 text-sm text-muted-foreground"
            >
              {description}
            </motion.p>
          )}
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="flex shrink-0 items-center gap-2"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
