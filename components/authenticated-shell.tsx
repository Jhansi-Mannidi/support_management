'use client'

import { AppShell } from '@/components/app-shell'

type ShellSegment = 'app' | 'config' | 'falcon' | 'search' | 'settings'

const SEGMENT_DEFAULTS: Record<
  ShellSegment,
  { role: 'requester' | 'responder' | 'admin' | 'falcon'; userName: string; userInitials: string }
> = {
  app: { role: 'responder', userName: 'Arjun Mehta', userInitials: 'AM' },
  config: { role: 'admin', userName: 'Sneha Pillai', userInitials: 'SP' },
  falcon: { role: 'falcon', userName: 'Vikram Rao', userInitials: 'VR' },
  search: { role: 'responder', userName: 'Arjun Mehta', userInitials: 'AM' },
  settings: { role: 'responder', userName: 'Arjun Mehta', userInitials: 'AM' },
}

export function AuthenticatedShell({
  segment,
  children,
}: {
  segment: ShellSegment
  children: React.ReactNode
}) {
  const defaults = SEGMENT_DEFAULTS[segment]

  return (
    <AppShell currentRole={defaults.role} userName={defaults.userName} userInitials={defaults.userInitials}>
      {children}
    </AppShell>
  )
}
