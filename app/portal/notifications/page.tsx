'use client'

import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import { mockNotifications } from '@/lib/mock-data'
import { MotionItem, MotionStagger, PageContainer } from '@/components/motion/motion-primitives'

const portalNotifications = mockNotifications.slice(0, 5)

export default function PortalNotificationsPage() {
  return (
    <PageContainer className="space-y-4 py-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-brand" /> Notifications</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Updates on your tickets and replies</p>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          <MotionStagger>
            {portalNotifications.map((n) => (
              <MotionItem key={n.id}>
                <Link
                  href={n.ticket ? `/portal/tickets/${n.ticket}` : '/portal'}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>

        <Link href="/portal" className="text-[13px] font-semibold text-brand hover:underline">
          ← Back to my tickets
        </Link>
    </PageContainer>
  )
}
