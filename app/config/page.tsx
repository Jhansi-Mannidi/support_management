'use client'

import React from 'react'
import Link from 'next/link'
import {
  Tag, GitBranch, Clock, Users, Bell, Zap, ChevronRight,
  Settings, Shield, Database, CheckCircle2,
} from 'lucide-react'
import { MotionGrid, MotionLinkCard, PageContainer } from '@/components/motion/motion-primitives'

const CONFIG_SECTIONS = [
  {
    group: 'Ticket Management',
    items: [
      {
        label: 'Categories & Sub-categories',
        description: 'Manage ticket classification taxonomy — categories, sub-categories, and allowed assignee tiers',
        icon: Tag,
        href: '/config/categories',
        color: 'text-brand bg-brand/10',
        status: '12 categories active',
      },
      {
        label: 'Escalation Chains',
        description: 'Define multi-tier escalation sequences, skip-level rules, and ownership handoffs per category',
        icon: GitBranch,
        href: '/config/chains',
        color: 'text-warning bg-warning-bg',
        status: '4 chains configured',
      },
      {
        label: 'SLA Policies',
        description: 'Set first-response and resolution SLA windows per priority, tenant, and category',
        icon: Clock,
        href: '/config/sla',
        color: 'text-info bg-info-bg',
        status: '3 policies · 2 overrides',
      },
    ],
  },
  {
    group: 'Access & Roles',
    items: [
      {
        label: 'Roles & Permissions',
        description: 'Configure role definitions, permission matrices, and tier-level access controls',
        icon: Shield,
        href: '/config/roles',
        color: 'text-success bg-success-bg',
        status: '5 roles · 2 custom',
      },
      {
        label: 'Team Members',
        description: 'Manage responders, assign roles, configure working hours and capacity limits',
        icon: Users,
        href: '/config/teams',
        color: 'text-brand bg-brand/10',
        status: '18 active members',
      },
    ],
  },
  {
    group: 'Automation & Alerts',
    items: [
      {
        label: 'Notification Templates',
        description: 'Customise email and in-app notification templates for each trigger event',
        icon: Bell,
        href: '/config/notifications',
        color: 'text-warning bg-warning-bg',
        status: '8 templates · 3 custom',
      },
      {
        label: 'Auto-Escalation Rules',
        description: 'Create rule-based automatic escalation triggers, schedules, and conditions',
        icon: Zap,
        href: '/config/auto-escalation',
        color: 'text-danger bg-danger-bg',
        status: '6 rules active',
      },
    ],
  },
  {
    group: 'System',
    items: [
      {
        label: 'Tenant Configuration',
        description: 'Manage tenant profiles, portal settings, branding, and data retention policies',
        icon: Database,
        href: '/config/tenants',
        color: 'text-info bg-info-bg',
        status: '4 tenants',
      },
      {
        label: 'Audit Log',
        description: 'Track all configuration changes, role modifications, and admin actions',
        icon: CheckCircle2,
        href: '/config/audit',
        color: 'text-success bg-success-bg',
        status: 'Last change: 2h ago',
      },
    ],
  },
]

export default function ConfigHubPage() {
  return (
    <PageContainer className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand" />
              Configuration Hub
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Manage all platform settings, policies, and automation rules for Meridian Freight
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-success/30 bg-success-bg px-3 py-1 text-[12px] font-semibold text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All systems healthy
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <MotionGrid className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active Categories', value: '12', icon: Tag },
            { label: 'Escalation Chains', value: '4', icon: GitBranch },
            { label: 'SLA Policies', value: '3', icon: Clock },
            { label: 'Automation Rules', value: '6', icon: Zap },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </MotionGrid>

        {/* Config groups */}
        {CONFIG_SECTIONS.map(section => (
          <div key={section.group} className="space-y-2">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground px-1">{section.group}</h2>
            <MotionGrid className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.items.map(item => (
                <MotionLinkCard
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-brand/30 hover:shadow-md transition-all"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold group-hover:text-brand transition-colors">{item.label}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground bg-muted rounded-md px-2 py-0.5 inline-block">{item.status}</p>
                  </div>
                </MotionLinkCard>
              ))}
            </MotionGrid>
          </div>
        ))}
      </PageContainer>
  )
}
