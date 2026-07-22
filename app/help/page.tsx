'use client'

import Link from 'next/link'
import {
  HelpCircle, BookOpen, MessageSquare, Zap, Shield, Clock,
  ChevronRight, Search, Mail, Phone, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionGrid, MotionLinkCard, PageContainer } from '@/components/motion/motion-primitives'

const TOPICS = [
  {
    title: 'Getting started',
    description: 'Navigate the queue, search tickets, and manage your daily workflow.',
    icon: BookOpen,
    href: '/app/queue/board',
    color: 'text-brand bg-brand/10',
  },
  {
    title: 'SLA & escalations',
    description: 'Understand SLA timers, breach alerts, and escalation workflows.',
    icon: Clock,
    href: '/app/tickets/escalate',
    color: 'text-warning bg-warning-bg',
  },
  {
    title: 'Roles & permissions',
    description: 'Learn what each tier can view, assign, and configure.',
    icon: Shield,
    href: '/config/roles',
    color: 'text-success bg-success-bg',
  },
  {
    title: 'Falcon console',
    description: 'Cross-tenant escalations, impersonation, and platform support.',
    icon: Zap,
    href: '/falcon/console',
    color: 'text-info bg-info-bg',
  },
]

const FAQ = [
  { q: 'How do I escalate a ticket?', a: 'Open the ticket cockpit and use Escalate, or go to Escalation actions from the ticket menu.' },
  { q: 'Where are my notifications?', a: 'Click the bell icon in the header or open Notification Centre from the sidebar.' },
  { q: 'How do I export ticket data?', a: 'Use the Export button on Queue, Search, or Dashboard views to download CSV files.' },
  { q: 'Who can access Configuration?', a: 'Tenant Admins and Falcon Engineers can manage categories, SLA policies, and automation rules.' },
]

export default function HelpPage() {
  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand" />
          Help &amp; Support
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Guides, FAQs, and contact options for VoltusWave Support
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search help articles…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <MotionGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TOPICS.map((topic) => (
          <MotionLinkCard
            key={topic.title}
            href={topic.href}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-brand/30 hover:shadow-md transition-all"
          >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', topic.color)}>
              <topic.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold group-hover:text-brand transition-colors">{topic.title}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand shrink-0" />
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{topic.description}</p>
            </div>
          </MotionLinkCard>
        ))}
      </MotionGrid>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[14px] font-semibold">Frequently asked questions</h2>
        </div>
        <div className="divide-y divide-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-4 py-3">
              <summary className="cursor-pointer text-[13px] font-medium text-foreground list-none flex items-center justify-between gap-2">
                {item.q}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <MotionGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-brand" />
            <h3 className="text-[14px] font-semibold">Live chat</h3>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">Connect with VoltusWave platform support during business hours.</p>
          <Link
            href="/app/raise?category=technical"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[12px] font-semibold text-white hover:bg-brand-hover"
          >
            Start a support ticket <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px]">support@voltuswave.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px]">+91 80 4567 8900 (IN-South)</span>
          </div>
        </div>
      </MotionGrid>
    </PageContainer>
  )
}
