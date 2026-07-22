'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { GlobalHeaderSearch } from '@/components/header/global-header-search'
import { RegionFilter } from '@/components/header/region-filter'
import { AppBreadcrumbs } from '@/components/layout/app-breadcrumbs'
import { AppPreferencesProvider } from '@/components/providers/app-preferences-provider'
import { BreadcrumbProvider } from '@/components/providers/breadcrumb-provider'
import { countActiveTickets } from '@/lib/mock-data'
import { drawerVariants, dropdownVariants, overlayVariants, pageVariants, springTransition } from '@/lib/motion'
import {
  LayoutDashboard,
  Inbox,
  Plus,
  Zap,
  Settings,
  Bell,
  Search,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Menu,
  X,
  Home,
  MessageSquarePlus,
} from 'lucide-react'

type UserRole = 'requester' | 'responder' | 'admin' | 'falcon'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  badge?: number
  /** Path prefixes that mark this item active (nested routes). */
  activePaths?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    activePaths: ['/app/dashboard'],
  },
  {
    label: 'My Queue',
    href: '/app/queue/board',
    icon: Inbox,
    badge: countActiveTickets(),
    roles: ['responder', 'admin', 'falcon'],
    activePaths: ['/app/queue', '/app/tickets'],
  },
  { label: 'Raise a Ticket', href: '/portal/new', icon: Plus, roles: ['requester'], activePaths: ['/portal/new'] },
  {
    label: 'My Tickets',
    href: '/portal',
    icon: Home,
    roles: ['requester'],
    activePaths: ['/portal', '/portal/tickets', '/portal/notifications'],
  },
  { label: 'Falcon Console', href: '/falcon/console', icon: Zap, roles: ['falcon'], activePaths: ['/falcon'] },
  {
    label: 'Configuration',
    href: '/config',
    icon: Settings,
    roles: ['responder', 'admin', 'falcon'],
    activePaths: ['/config'],
  },
  {
    label: 'Notifications',
    href: '/app/notifications',
    icon: Bell,
    activePaths: ['/app/notifications'],
  },
]

const profileNavItem: NavItem = {
  label: 'Profile & Settings',
  href: '/settings',
  icon: User,
  activePaths: ['/settings'],
}

interface AppShellProps {
  children: React.ReactNode
  currentRole?: UserRole
  tenant?: string
  userName?: string
  userInitials?: string
}

export function AppShell({
  children,
  currentRole = 'responder',
  tenant = 'Meridian Freight',
  userName = 'Priya Nair',
  userInitials = 'PN',
}: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [locationHash, setLocationHash] = useState('')

  // Close profile menu on navigation — avoids stale open state without re-mount flicker
  useEffect(() => {
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    const syncHash = () => setLocationHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  const matchesActivePath = (pattern: string) => {
    const [path, hash] = pattern.split('#')
    if (hash) {
      return pathname === path && locationHash === `#${hash}`
    }
    if (pathname === path) return true
    // Exact-only roots — avoid /portal matching /portal/new
    if (path === '/portal') {
      return (
        pathname.startsWith('/portal/tickets') ||
        pathname === '/portal/notifications' ||
        pathname.startsWith('/portal/notifications/')
      )
    }
    return pathname?.startsWith(`${path}/`) ?? false
  }

  const isNavActive = (item: NavItem) => {
    const patterns = item.activePaths ?? [item.href]
    return patterns.some(matchesActivePath)
  }

  const roleLabel: Record<UserRole, string> = {
    requester: 'Requester',
    responder: 'Branch Support Admin',
    admin: 'Tenant Admin',
    falcon: 'Falcon Engineer',
  }
  const roleTier: Record<UserRole, string> = {
    requester: '',
    responder: 'Tier 2',
    admin: 'Tier 3',
    falcon: 'Tier 4',
  }

  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(currentRole)
  )

  const SidebarContent = () => (
    <nav className="flex h-full flex-col">
      <div
        className={cn(
          'flex border-b border-sidebar-border px-2 py-3',
          collapsed ? 'flex-col items-center gap-1' : 'flex-row items-center justify-between gap-2 px-3',
        )}
      >
        <div className={cn('flex min-w-0 items-center gap-2', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-sidebar-foreground leading-none">VoltusWave</p>
              <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">Support</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden shrink-0 rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-muted hover:text-sidebar-foreground lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mx-3 mt-3 rounded-lg border border-sidebar-border bg-muted/50 px-3 py-2">
          <p className="truncate text-[12px] font-semibold text-sidebar-foreground">{tenant}</p>
          <p className="text-[11px] text-sidebar-foreground/60">
            {roleLabel[currentRole]}{roleTier[currentRole] ? ` · ${roleTier[currentRole]}` : ''}
          </p>
        </div>
      )}

      <div className="mt-3 flex-1 overflow-y-auto px-2 pb-2">
        {visibleNav.map((item) => {
          const Icon = item.icon
          const isActive = isNavActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 mb-0.5',
                isActive
                  ? 'font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent border-l-2 border-brand"
                  transition={springTransition}
                />
              )}
              {!isActive && (
                <span className="absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-muted" />
              )}
              <motion.span
                className="relative z-10 shrink-0"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-brand')} />
              </motion.span>
              {!collapsed && (
                <>
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto border-t border-sidebar-border px-2 py-2">
        {(() => {
          const item = profileNavItem
          const Icon = item.icon
          const isActive = isNavActive(item)
          return (
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200',
                isActive
                  ? 'font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-profile-active-pill"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent border-l-2 border-brand"
                  transition={springTransition}
                />
              )}
              {!isActive && (
                <span className="absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-muted" />
              )}
              <motion.span
                className="relative z-10 shrink-0"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-brand')} />
              </motion.span>
              {!collapsed && <span className="relative z-10 flex-1">{item.label}</span>}
            </Link>
          )
        })()}
      </div>

    </nav>
  )

  const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/app/dashboard', activePaths: ['/app/dashboard'] },
    { icon: Inbox, label: 'Queue', href: '/app/queue/board', activePaths: ['/app/queue', '/app/tickets'] },
    { icon: MessageSquarePlus, label: 'Raise', href: '/portal/new', activePaths: ['/portal/new'] },
    { icon: Search, label: 'Search', href: '/search', activePaths: ['/search'] },
    { icon: User, label: 'Profile', href: '/settings', activePaths: ['/settings'] },
  ]

  return (
    <AppPreferencesProvider>
    <BreadcrumbProvider>
    <div className="flex h-screen overflow-hidden bg-background lg:gap-3 lg:p-3">
      <aside
        className={cn(
          'hidden flex-col bg-sidebar lg:flex shrink-0 transition-[width] duration-200 ease-out',
          'lg:rounded-xl lg:border lg:border-sidebar-border lg:shadow-sm',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 top-0 h-full w-64 bg-sidebar shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card lg:shadow-sm">
        <header className="grid h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm px-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,640px)_minmax(0,1fr)] lg:gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open navigation"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-1.5 lg:hidden">
              <Zap className="h-4 w-4 text-brand" />
              <span className="text-[13px] font-bold">VoltusWave</span>
            </div>

            <span className="hidden truncate text-[12px] font-medium text-muted-foreground lg:block">{tenant}</span>
          </div>

          <div className="flex min-w-0 justify-center px-0.5">
            <GlobalHeaderSearch className="w-full max-w-[640px]" />
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
            <RegionFilter className="hidden sm:block" />

            <Link href="/app/notifications">
              <button
                type="button"
                className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand" />
              </button>
            </Link>

            <ThemeToggle />

            <Link href="/help">
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                {userInitials}
              </button>
              <AnimatePresence mode="wait">
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      aria-hidden
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 top-8 z-50 w-52 rounded-xl border border-border bg-card shadow-xl"
                    >
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-[13px] font-semibold">{userName}</p>
                      <p className="text-[11px] text-muted-foreground">{roleLabel[currentRole]}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-[13px] transition-colors hover:bg-muted" onClick={() => setProfileOpen(false)}>
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> Profile & Settings
                      </Link>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2 text-[13px] text-danger transition-colors hover:bg-danger-bg"
                        onClick={() => router.push('/sign-in')}
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                      </button>
                    </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="shrink-0 border-b border-border/80 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent px-3 py-2 sm:px-4 lg:px-5">
          <AppBreadcrumbs tenant={tenant} locationHash={locationHash} />
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={pageVariants}
              className="page-content flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="flex h-14 shrink-0 items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm px-2 lg:hidden">
          {mobileNavItems.map(({ icon: Icon, label, href, activePaths }) => {
            const isActive = activePaths.some((pattern) => {
              const [path, hash] = pattern.split('#')
              if (hash) return pathname === path && locationHash === `#${hash}`
              if (pathname === path) return true
              return pathname?.startsWith(`${path}/`) ?? false
            })
            return (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
                    isActive ? 'text-brand' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-0 h-0.5 w-6 rounded-full bg-brand" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
    </BreadcrumbProvider>
    </AppPreferencesProvider>
  )
}
