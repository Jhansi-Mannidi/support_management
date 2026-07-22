'use client'

import Link from 'next/link'
import { Zap, ArrowLeft, Search } from 'lucide-react'
import { MotionScaleIn } from '@/components/motion/motion-primitives'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <MotionScaleIn className="flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand mb-6">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-medium hover:bg-muted"
          >
            <Search className="h-4 w-4" /> Global search
          </Link>
        </div>
      </MotionScaleIn>
    </div>
  )
}
