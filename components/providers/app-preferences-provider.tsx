'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AppRegion } from '@/lib/regions'

interface AppPreferencesContextValue {
  region: AppRegion
  setRegion: (region: AppRegion) => void
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null)

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<AppRegion>('IN-South')

  const setRegion = useCallback((next: AppRegion) => {
    setRegionState(next)
  }, [])

  const value = useMemo(() => ({ region, setRegion }), [region, setRegion])

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext)
  if (!ctx) throw new Error('useAppPreferences must be used within AppPreferencesProvider')
  return ctx
}
