'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface BreadcrumbOverrides {
  ticketLabel?: string
  categoryLabel?: string
  pageLabel?: string
}

interface BreadcrumbContextValue {
  overrides: BreadcrumbOverrides
  setOverrides: (next: BreadcrumbOverrides) => void
  clearOverrides: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverridesState] = useState<BreadcrumbOverrides>({})

  const setOverrides = useCallback((next: BreadcrumbOverrides) => {
    setOverridesState((prev) => ({ ...prev, ...next }))
  }, [])

  const clearOverrides = useCallback(() => {
    setOverridesState({})
  }, [])

  const value = useMemo(
    () => ({ overrides, setOverrides, clearOverrides }),
    [overrides, setOverrides, clearOverrides],
  )

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumbOverrides() {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) {
    throw new Error('useBreadcrumbOverrides must be used within BreadcrumbProvider')
  }
  return ctx
}

/** Set dynamic breadcrumb labels for the current page (cleared on unmount). */
export function usePageBreadcrumb(overrides: BreadcrumbOverrides) {
  const { setOverrides, clearOverrides } = useBreadcrumbOverrides()

  React.useEffect(() => {
    setOverrides(overrides)
    return () => clearOverrides()
  }, [overrides.ticketLabel, overrides.categoryLabel, overrides.pageLabel, setOverrides, clearOverrides])
}
