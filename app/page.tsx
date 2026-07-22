'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MotionFadeUp } from '@/components/motion/motion-primitives'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/sign-in') }, [router])
  return (
    <MotionFadeUp className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-brand animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading VoltusWave Support…</p>
      </div>
    </MotionFadeUp>
  )
}
