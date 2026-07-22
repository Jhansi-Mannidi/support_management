'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Shield, Plus, ArrowLeft, Edit2, Trash2, Check, X, Users,
  ChevronDown, ChevronRight, Star, Lock, Eye, Zap,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

const PERMISSIONS = [
  { group: 'Tickets', items: ['View own tickets', 'View all tickets (tenant)', 'Create ticket', 'Edit ticket', 'Assign ticket', 'Close/Resolve ticket', 'Delete ticket'] },
  { group: 'Escalation', items: ['Escalate to next tier', 'Skip-level escalate', 'De-escalate', 'Override SLA pause'] },
  { group: 'Configuration', items: ['View config', 'Edit categories', 'Edit SLA policies', 'Edit escalation chains', 'Manage roles'] },
  { group: 'Reports & Analytics', items: ['View own stats', 'View team stats', 'View all analytics', 'Export reports'] },
  { group: 'Falcon', items: ['Access Falcon Console', 'Impersonate tenant user', 'Cross-tenant view', 'System overrides'] },
]

const ROLES = [
  {
    id: 'role-1', name: 'Requester', tier: 0, icon: Users, color: 'text-muted-foreground bg-muted',
    description: 'End-user raising and tracking their own tickets', members: 124, isBuiltIn: true,
    permissions: {
      'View own tickets': true, 'View all tickets (tenant)': false, 'Create ticket': true, 'Edit ticket': false,
      'Assign ticket': false, 'Close/Resolve ticket': false, 'Delete ticket': false,
      'Escalate to next tier': false, 'Skip-level escalate': false, 'De-escalate': false, 'Override SLA pause': false,
      'View config': false, 'Edit categories': false, 'Edit SLA policies': false, 'Edit escalation chains': false, 'Manage roles': false,
      'View own stats': true, 'View team stats': false, 'View all analytics': false, 'Export reports': false,
      'Access Falcon Console': false, 'Impersonate tenant user': false, 'Cross-tenant view': false, 'System overrides': false,
    },
  },
  {
    id: 'role-2', name: 'Dept Support Admin', tier: 1, icon: Shield, color: 'text-info bg-info-bg',
    description: 'First-line support handling departmental tickets', members: 18, isBuiltIn: true,
    permissions: {
      'View own tickets': true, 'View all tickets (tenant)': true, 'Create ticket': true, 'Edit ticket': true,
      'Assign ticket': true, 'Close/Resolve ticket': true, 'Delete ticket': false,
      'Escalate to next tier': true, 'Skip-level escalate': false, 'De-escalate': false, 'Override SLA pause': false,
      'View config': true, 'Edit categories': false, 'Edit SLA policies': false, 'Edit escalation chains': false, 'Manage roles': false,
      'View own stats': true, 'View team stats': true, 'View all analytics': false, 'Export reports': false,
      'Access Falcon Console': false, 'Impersonate tenant user': false, 'Cross-tenant view': false, 'System overrides': false,
    },
  },
  {
    id: 'role-3', name: 'Branch Support Admin', tier: 2, icon: Shield, color: 'text-warning bg-warning-bg',
    description: 'Regional branch-level support with wider visibility', members: 9, isBuiltIn: true,
    permissions: {
      'View own tickets': true, 'View all tickets (tenant)': true, 'Create ticket': true, 'Edit ticket': true,
      'Assign ticket': true, 'Close/Resolve ticket': true, 'Delete ticket': false,
      'Escalate to next tier': true, 'Skip-level escalate': true, 'De-escalate': true, 'Override SLA pause': true,
      'View config': true, 'Edit categories': false, 'Edit SLA policies': false, 'Edit escalation chains': false, 'Manage roles': false,
      'View own stats': true, 'View team stats': true, 'View all analytics': true, 'Export reports': true,
      'Access Falcon Console': false, 'Impersonate tenant user': false, 'Cross-tenant view': false, 'System overrides': false,
    },
  },
  {
    id: 'role-4', name: 'Tenant Admin', tier: 3, icon: Star, color: 'text-danger bg-danger-bg',
    description: 'Company-level admin with full tenant control', members: 4, isBuiltIn: true,
    permissions: {
      'View own tickets': true, 'View all tickets (tenant)': true, 'Create ticket': true, 'Edit ticket': true,
      'Assign ticket': true, 'Close/Resolve ticket': true, 'Delete ticket': true,
      'Escalate to next tier': true, 'Skip-level escalate': true, 'De-escalate': true, 'Override SLA pause': true,
      'View config': true, 'Edit categories': true, 'Edit SLA policies': true, 'Edit escalation chains': true, 'Manage roles': false,
      'View own stats': true, 'View team stats': true, 'View all analytics': true, 'Export reports': true,
      'Access Falcon Console': false, 'Impersonate tenant user': false, 'Cross-tenant view': false, 'System overrides': false,
    },
  },
  {
    id: 'role-5', name: 'Falcon Engineer', tier: 4, icon: Zap, color: 'text-brand bg-brand/10',
    description: 'VoltusWave platform engineer with cross-tenant access', members: 3, isBuiltIn: true,
    permissions: {
      'View own tickets': true, 'View all tickets (tenant)': true, 'Create ticket': true, 'Edit ticket': true,
      'Assign ticket': true, 'Close/Resolve ticket': true, 'Delete ticket': true,
      'Escalate to next tier': true, 'Skip-level escalate': true, 'De-escalate': true, 'Override SLA pause': true,
      'View config': true, 'Edit categories': true, 'Edit SLA policies': true, 'Edit escalation chains': true, 'Manage roles': true,
      'View own stats': true, 'View team stats': true, 'View all analytics': true, 'Export reports': true,
      'Access Falcon Console': true, 'Impersonate tenant user': true, 'Cross-tenant view': true, 'System overrides': true,
    },
  },
]

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES[1])
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Tickets')

  return (
    <PageContainer className="space-y-4">

        <div>
          <Link href="/config" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Configuration Hub
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-success" /> Roles &amp; Permissions</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Configure role definitions, permission matrices, and tier-level access controls</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all shrink-0">
              <Plus className="h-4 w-4" /> Custom Role
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Role list */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Roles ({ROLES.length})</p>
            {ROLES.map(role => {
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                    selectedRole.id === role.id
                      ? 'border-brand/40 bg-brand/5 shadow-sm'
                      : 'border-border bg-card hover:border-brand/20 hover:bg-muted/30',
                  )}
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', role.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold truncate">{role.name}</p>
                      {role.isBuiltIn && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tier {role.tier} · {role.members} members</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Permission matrix */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', selectedRole.color)}>
                  <selectedRole.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[14px] font-bold">{selectedRole.name}</p>
                  <p className="text-[12px] text-muted-foreground">{selectedRole.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">{selectedRole.members} members</span>
                {!selectedRole.isBuiltIn && (
                  <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-muted transition-all">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {selectedRole.isBuiltIn && (
                  <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" /> Built-in
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-border">
              {PERMISSIONS.map(group => (
                <div key={group.group}>
                  <button
                    onClick={() => setExpandedGroup(g => g === group.group ? null : group.group)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-muted/30 transition-all"
                  >
                    {expandedGroup === group.group
                      ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                    <span className="text-[12px] font-semibold text-foreground">{group.group}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {group.items.filter(p => selectedRole.permissions[p as keyof typeof selectedRole.permissions]).length}/{group.items.length}
                    </span>
                  </button>
                  {expandedGroup === group.group && (
                    <div className="pb-1">
                      {group.items.map(perm => {
                        const granted = !!selectedRole.permissions[perm as keyof typeof selectedRole.permissions]
                        return (
                          <div key={perm} className="flex items-center justify-between px-4 py-2 hover:bg-muted/20 transition-colors">
                            <span className={cn('text-[13px]', !granted && 'text-muted-foreground')}>{perm}</span>
                            <div className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full shrink-0',
                              granted ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground',
                            )}>
                              {granted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
  )
}
