import React from 'react'
import { cn } from '@/lib/utils'

/** Full-height workspace shell — fills app main area edge-to-edge */
export function WorkspaceShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-full min-h-0 w-full min-w-0 flex-col', className)}>
      {children}
    </div>
  )
}

/** Primary page title bar — consistent padding & border */
export function WorkspaceHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('workspace-header shrink-0', className)}>
      {children}
    </header>
  )
}

/** Filter / action toolbar row below header */
export function WorkspaceToolbar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('workspace-toolbar shrink-0', className)}>
      {children}
    </div>
  )
}

/** Scrollable or flex-fill main content area */
export function WorkspaceBody({
  children,
  className,
  scroll = false,
}: {
  children: React.ReactNode
  className?: string
  scroll?: boolean
}) {
  return (
    <div
      className={cn(
        'workspace-body',
        scroll && 'overflow-y-auto scrollbar-thin',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Standard padded page for config, settings, help, etc. */
export function PageFrame({
  children,
  className,
  spacing = 'md',
}: {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'page-frame w-full',
        spacing === 'sm' && 'space-y-4',
        spacing === 'md' && 'space-y-5',
        spacing === 'lg' && 'space-y-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PageTitle({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  icon?: React.ElementType
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="page-title flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-brand" />}
          {title}
        </h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Inline header + toolbar combined (queue board pattern) */
export function WorkspacePanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('workspace-header space-y-3', className)}>
      {children}
    </header>
  )
}
