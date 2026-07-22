'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {!mounted ? (
        <span className="inline-flex h-4 w-4" aria-hidden />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </motion.button>
  )
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const active = mounted ? (theme ?? 'system') : 'system'

  return (
    <div className={cn('flex rounded-lg border border-border bg-muted p-0.5', className)}>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <motion.button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
            active === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={active === value}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </motion.button>
      ))}
      {mounted && (
        <span className="sr-only">
          Currently showing {resolvedTheme} theme
        </span>
      )}
    </div>
  )
}
