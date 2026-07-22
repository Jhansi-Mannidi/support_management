'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useSpring, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  fadeUpVariants,
  listItemVariants,
  pageVariants,
  scaleInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  springTransition,
} from '@/lib/motion'

interface MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function MotionPage({ children, className }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionFadeUp({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionScaleIn({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionStagger({
  children,
  className,
  once = true,
  immediate = false,
}: MotionProps & { once?: boolean; immediate?: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={immediate || inView ? 'visible' : 'hidden'}
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({ children, className }: MotionProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export function MotionCard({
  children,
  className,
  hover = true,
}: MotionProps & { hover?: boolean }) {
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={hover ? { scale: 0.995 } : undefined}
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300',
        hover && 'hover:shadow-md hover:border-border/80',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function MotionButton({
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={springTransition}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function AnimatedNumber({
  value,
  className,
  suffix = '',
  prefix = '',
}: {
  value: string | number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const raw = String(value)
  const numeric = parseFloat(raw.replace(/[^0-9.-]/g, ''))
  const hasNumber = !Number.isNaN(numeric)
  const trailing = raw.match(/[^0-9.-]+$/)?.[0] ?? suffix
  const leading = raw.match(/^[^0-9.-]+/)?.[0] ?? prefix

  const spring = useSpring(0, { stiffness: 120, damping: 24 })
  const display = useTransform(spring, (v) => {
    if (!hasNumber) return raw
    const decimals = raw.includes('.') ? (raw.split('.')[1]?.length ?? 0) : 0
    return `${leading}${v.toFixed(decimals)}${trailing}`
  })

  useEffect(() => {
    if (!inView || !hasNumber) return
    const controls = animate(spring, numeric, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [inView, numeric, hasNumber, spring])

  if (!hasNumber) {
    return <span ref={ref} className={className}>{raw}</span>
  }

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}

export function MotionPresenceHeight({
  show,
  children,
  className,
}: {
  show: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: show ? 'auto' : 0,
        opacity: show ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('overflow-hidden', className)}
    >
      {children}
    </motion.div>
  )
}

/** Stagger direct children on page load — use as the root wrapper for standard pages */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const items = React.Children.toArray(children).filter(Boolean)
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className={cn('page-frame min-h-0 flex-1 space-y-5 overflow-y-auto scrollbar-thin', className)}
    >
      {items.map((child, index) => (
        <motion.div key={index} variants={staggerItemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Full-height page wrapper — layout only (no motion wrappers that break flex) */
export function FlexPageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-full min-h-0 min-w-0 w-full flex-col', className)}>
      {children}
    </div>
  )
}

/** Stagger grid/list children with optional in-view trigger */
export function MotionGrid({
  children,
  className,
  once = true,
}: MotionProps & { once?: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-32px' })
  const items = React.Children.toArray(children).filter(Boolean)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainerVariants}
      className={className}
    >
      {items.map((child, index) => (
        <motion.div key={index} variants={staggerItemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Animated link card for grids and hubs */
export function MotionLinkCard({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <MotionItem>
      <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={springTransition}>
        <Link href={href} className={className}>
          {children}
        </Link>
      </motion.div>
    </MotionItem>
  )
}

/** Animated table row */
export function MotionRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <motion.tr
      variants={listItemVariants}
      whileHover={{ backgroundColor: 'color-mix(in srgb, var(--muted) 40%, transparent)' }}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  )
}

/** Staggered tbody for tables */
export function MotionTableBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.tbody
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.tbody>
  )
}

/** Collapsible panel with enter/exit animation */
export function MotionReveal({
  show,
  children,
  className,
}: {
  show: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Sidebar / nav link with layout animation */
export function MotionNavLink({
  href,
  active,
  children,
  className,
  onClick,
}: {
  href: string
  active?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className={cn('relative block', className)}>
      {active && (
        <motion.span
          layoutId="nav-active-bg"
          className="absolute inset-0 rounded-lg bg-sidebar-accent border-l-2 border-brand"
          transition={springTransition}
        />
      )}
      <motion.span
        className="relative z-10 flex items-center gap-3"
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>
    </Link>
  )
}
