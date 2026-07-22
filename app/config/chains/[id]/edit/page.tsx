'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, GitBranch } from 'lucide-react'
import { ChainFormPage } from '@/components/config/chain-form-page'
import { PageContainer } from '@/components/motion/motion-primitives'
import { usePageBreadcrumb } from '@/components/providers/breadcrumb-provider'
import { getChainById, type EscalationChain } from '@/lib/chain-config'

export default function EditChainPage() {
  const params = useParams()
  const id = params.id as string
  const [chain, setChain] = useState<EscalationChain | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setChain(getChainById(id) ?? null)
    setLoaded(true)
  }, [id])

  usePageBreadcrumb({
    pageLabel: chain?.name ?? 'Edit Chain',
  })

  if (!loaded) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </PageContainer>
    )
  }

  if (!chain) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-20 text-center">
        <GitBranch className="mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-bold">Chain not found</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">The escalation chain may have been removed.</p>
        <Link
          href="/config/chains"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to chains
        </Link>
      </PageContainer>
    )
  }

  return <ChainFormPage mode="edit" initial={chain} />
}
