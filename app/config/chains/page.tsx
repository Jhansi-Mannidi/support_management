'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  GitBranch, Plus, ArrowLeft, ArrowDown, Edit2, Trash2,
  Clock, User, ChevronRight, Info,
  ToggleLeft, ToggleRight,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import {
  type EscalationChain,
  deleteChain,
  getStepStyle,
  loadChains,
  saveChains,
} from '@/lib/chain-config'

export default function ChainsPage() {
  const { toast } = useToast()
  const [chains, setChains] = useState<EscalationChain[]>([])
  const [expanded, setExpanded] = useState<string | null>('chain-1')
  const [deleteTarget, setDeleteTarget] = useState<EscalationChain | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setChains(loadChains())
  }, [])

  const persist = (next: EscalationChain[]) => {
    setChains(next)
    saveChains(next)
  }

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id))

  const toggleActive = (id: string) => {
    persist(chains.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    window.setTimeout(() => {
      deleteChain(deleteTarget.id)
      setChains(loadChains())
      if (expanded === deleteTarget.id) setExpanded(null)
      toast({
        title: 'Chain deleted',
        description: `${deleteTarget.name} has been removed.`,
        variant: 'success',
      })
      setDeleteTarget(null)
      setDeleting(false)
    }, 350)
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link href="/config" className="mb-2 flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-brand">
          <ArrowLeft className="h-3 w-3" /> Configuration Hub
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <GitBranch className="h-5 w-5 text-warning" /> Escalation Chains
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Define multi-tier escalation sequences, trigger conditions, and ownership handoffs
            </p>
          </div>
          <Link href="/config/chains/new">
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" /> New Chain
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info-bg/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p className="text-[12px] leading-relaxed text-info">
          Escalation chains define how tickets move between tiers. Each step specifies trigger type, SLA window, and responsible role.
          Chains are assigned per category in the{' '}
          <Link href="/config/categories" className="font-semibold underline">Categories</Link> configuration.
        </p>
      </div>

      <div className="space-y-3">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className={cn(
              'overflow-hidden rounded-xl border bg-card transition-all',
              chain.active ? 'border-border' : 'border-border/50 opacity-70',
            )}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <button type="button" onClick={() => toggle(chain.id)}>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    expanded === chain.id && 'rotate-90',
                  )}
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold">{chain.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {chain.steps.length} steps
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Applied to: <span className="font-medium text-foreground">{chain.appliesTo}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{chain.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(chain.id)}
                className={cn('shrink-0 transition-colors', chain.active ? 'text-success' : 'text-muted-foreground')}
              >
                {chain.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/config/chains/${chain.id}/edit`}>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${chain.name}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(chain)}
                  className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-danger-bg hover:text-danger"
                  aria-label={`Delete ${chain.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {expanded === chain.id && (
              <div className="border-t border-border bg-muted/20 p-4">
                <div className="flex flex-col items-center gap-0">
                  {chain.steps.map((step, idx) => (
                    <div key={step.id} className="flex w-full flex-col items-center">
                      <div className={cn('flex w-full items-start gap-3 rounded-xl border px-4 py-3', getStepStyle(step.tier))}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card/80 text-[11px] font-bold">
                          T{step.tier}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold">{step.label}</p>
                            <span className="rounded-full bg-card/70 px-2 py-0.5 text-[11px] font-medium">
                              {step.triggerType}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[12px] opacity-80">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{step.role}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />SLA: {step.slaLimit}</span>
                          </div>
                        </div>
                        <Link href={`/config/chains/${chain.id}/edit`}>
                          <button type="button" className="shrink-0 rounded-md p-1 transition-all hover:bg-card/50">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                      {idx < chain.steps.length - 1 && (
                        <div className="flex flex-col items-center gap-0.5 py-1.5">
                          <div className="h-3 w-px bg-border" />
                          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="h-3 w-px bg-border" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link href={`/config/chains/${chain.id}/edit`}>
                  <button
                    type="button"
                    className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add step
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete escalation chain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              Categories currently using this chain will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete chain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
