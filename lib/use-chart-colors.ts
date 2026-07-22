'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function readVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export interface ChartColors {
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  success: string
  warning: string
  danger: string
  muted: string
  border: string
  foreground: string
}

const FALLBACK: ChartColors = {
  chart1: '#F26722',
  chart2: '#2563EB',
  chart3: '#16A34A',
  chart4: '#D97706',
  chart5: '#7C3AED',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  muted: '#6B7280',
  border: '#E2E5EB',
  foreground: '#0D1526',
}

export function useChartColors(): ChartColors {
  const { resolvedTheme } = useTheme()
  const [colors, setColors] = useState<ChartColors>(FALLBACK)

  useEffect(() => {
    setColors({
      chart1: readVar('--chart-1', FALLBACK.chart1),
      chart2: readVar('--chart-2', FALLBACK.chart2),
      chart3: readVar('--chart-3', FALLBACK.chart3),
      chart4: readVar('--chart-4', FALLBACK.chart4),
      chart5: readVar('--chart-5', FALLBACK.chart5),
      success: readVar('--success', FALLBACK.success),
      warning: readVar('--warning', FALLBACK.warning),
      danger: readVar('--danger', FALLBACK.danger),
      muted: readVar('--muted-foreground', FALLBACK.muted),
      border: readVar('--border', FALLBACK.border),
      foreground: readVar('--foreground', FALLBACK.foreground),
    })
  }, [resolvedTheme])

  return colors
}
