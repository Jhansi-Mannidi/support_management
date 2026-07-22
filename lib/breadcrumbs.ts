export interface BreadcrumbItem {
  label: string
  href?: string
}

const CONFIG_SECTIONS: Record<string, string> = {
  categories: 'Categories',
  chains: 'Escalation Chains',
  sla: 'SLA Policies',
  teams: 'Teams',
  roles: 'Roles & Permissions',
  notifications: 'Notification Rules',
  'auto-escalation': 'Auto-Escalation',
  tenants: 'Tenants',
  audit: 'Audit Log',
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function withWorkspace(trail: BreadcrumbItem[]): BreadcrumbItem[] {
  return [{ label: 'Home', href: '/app/dashboard' }, ...trail]
}

function configTrail(segments: string[]): BreadcrumbItem[] {
  const section = segments[0]
  const sectionLabel = CONFIG_SECTIONS[section] ?? titleCase(section)
  const trail: BreadcrumbItem[] = [
    { label: 'Configuration', href: '/config' },
    { label: sectionLabel, href: `/config/${section}` },
  ]

  if (segments[1] === 'new') {
    trail.push({ label: segments[0] === 'chains' ? 'New Chain' : 'Add New' })
  } else if (segments[2] === 'edit') {
    trail.push({ label: 'Edit' })
  }

  return withWorkspace(trail)
}

export function resolveBreadcrumbs(
  pathname: string,
  options?: {
    hash?: string
    ticketLabel?: string
    categoryLabel?: string
  },
): BreadcrumbItem[] {
  const hash = options?.hash ?? ''
  const segments = pathname.split('/').filter(Boolean)

  if (pathname === '/app/dashboard') {
    if (hash === '#reports') {
      return withWorkspace([
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Reports' },
      ])
    }
    return withWorkspace([{ label: 'Dashboard' }])
  }

  if (pathname === '/app/queue/list') {
    return withWorkspace([
      { label: 'My Queue', href: '/app/queue/board' },
      { label: 'List' },
    ])
  }

  if (pathname === '/app/queue/board') {
    return withWorkspace([
      { label: 'My Queue', href: '/app/queue/board' },
      { label: 'Board' },
    ])
  }

  if (pathname.startsWith('/app/tickets/')) {
    const sub = segments[2]
    if (sub === 'escalate') {
      return withWorkspace([
        { label: 'My Queue', href: '/app/queue/board' },
        { label: 'Escalate Ticket' },
      ])
    }
    if (sub === 'child-tasks') {
      return withWorkspace([
        { label: 'My Queue', href: '/app/queue/board' },
        { label: 'Child Tasks' },
      ])
    }
    const ticketId = sub?.toUpperCase() ?? 'Ticket'
    const label = options?.ticketLabel ?? ticketId
    return withWorkspace([
      { label: 'My Queue', href: '/app/queue/board' },
      { label },
    ])
  }

  if (pathname === '/app/notifications') {
    return withWorkspace([{ label: 'Notifications' }])
  }

  if (pathname === '/config') {
    return withWorkspace([{ label: 'Configuration' }])
  }

  if (pathname.startsWith('/config/') && segments[0] === 'config') {
    const configSegments = segments.slice(1)
    const trail = configTrail(configSegments)
    if (options?.categoryLabel && configSegments[0] === 'categories') {
      const last = trail[trail.length - 1]
      if (last && !last.href) {
        last.label = options.categoryLabel
      }
    }
    return trail
  }

  if (pathname === '/settings') {
    return withWorkspace([{ label: 'Profile & Settings' }])
  }

  if (pathname === '/search') {
    return withWorkspace([{ label: 'Search' }])
  }

  if (pathname === '/help') {
    return withWorkspace([{ label: 'Help Center' }])
  }

  if (pathname.startsWith('/falcon/')) {
    const page = segments[1]
    if (page === 'impersonate') {
      return withWorkspace([
        { label: 'Falcon Console', href: '/falcon/console' },
        { label: 'Impersonate Tenant' },
      ])
    }
    return withWorkspace([{ label: 'Falcon Console' }])
  }

  if (pathname === '/portal') {
    return [{ label: 'Portal', href: '/portal' }, { label: 'My Tickets' }]
  }

  if (pathname === '/portal/new') {
    return [
      { label: 'Portal', href: '/portal' },
      { label: 'My Tickets', href: '/portal' },
      { label: 'Raise a Ticket' },
    ]
  }

  if (pathname.startsWith('/portal/tickets/')) {
    const sub = segments[2]
    if (sub && segments[3] === 'feedback') {
      return [
        { label: 'Portal', href: '/portal' },
        { label: 'My Tickets', href: '/portal' },
        { label: sub.toUpperCase(), href: `/portal/tickets/${sub}` },
        { label: 'Feedback' },
      ]
    }
    return [
      { label: 'Portal', href: '/portal' },
      { label: 'My Tickets', href: '/portal' },
      { label: sub?.toUpperCase() ?? 'Ticket' },
    ]
  }

  if (pathname === '/portal/notifications') {
    return [
      { label: 'Portal', href: '/portal' },
      { label: 'Notifications' },
    ]
  }

  return withWorkspace([{ label: titleCase(segments[segments.length - 1] ?? 'Page') }])
}
