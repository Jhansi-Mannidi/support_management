'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowLeft,
  Clock,
  GitBranch,
  Layers,
  Plus,
  Save,
  Trash2,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast-provider'
import { PageContainer } from '@/components/motion/motion-primitives'
import {
  CHAIN_ROLES,
  TRIGGER_TYPES,
  type ChainStep,
  type ChainFormValues,
  type EscalationChain,
  createChainId,
  createStepId,
  emptyChainForm,
  getStepStyle,
  upsertChain,
} from '@/lib/chain-config'

interface ChainFormPageProps {
  mode: 'create' | 'edit'
  initial?: EscalationChain
}

export function ChainFormPage({ mode, initial }: ChainFormPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ChainFormValues>(() =>
    initial
      ? {
          id: initial.id,
          name: initial.name,
          description: initial.description,
          appliesTo: initial.appliesTo,
          active: initial.active,
          steps: initial.steps.map((s) => ({ ...s })),
        }
      : emptyChainForm(),
  )

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name,
        description: initial.description,
        appliesTo: initial.appliesTo,
        active: initial.active,
        steps: initial.steps.map((s) => ({ ...s })),
      })
    }
  }, [initial])

  const preview = useMemo(() => form, [form])

  const update = <K extends keyof ChainFormValues>(key: K, value: ChainFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateStep = (id: string, patch: Partial<ChainStep>) => {
    update(
      'steps',
      form.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  }

  const addStep = () => {
    const nextTier = Math.min(4, (form.steps[form.steps.length - 1]?.tier ?? 0) + 1)
    const step: ChainStep = {
      id: createStepId(),
      tier: nextTier,
      label: `Tier ${nextTier} — Support`,
      role: CHAIN_ROLES[Math.min(nextTier - 1, CHAIN_ROLES.length - 1)],
      slaLimit: nextTier <= 2 ? '8h (P2)' : '24h (P2)',
      triggerType: nextTier === 1 ? 'SLA Breach' : 'SLA Breach / Manual',
    }
    update('steps', [...form.steps, step])
  }

  const removeStep = (id: string) => {
    if (form.steps.length <= 1) {
      toast({ title: 'At least one step required', variant: 'warning' })
      return
    }
    update(
      'steps',
      form.steps.filter((s) => s.id !== id),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Name required', description: 'Enter a chain name to continue.', variant: 'warning' })
      return
    }
    if (!form.appliesTo.trim()) {
      toast({ title: 'Categories required', description: 'Specify which categories this chain applies to.', variant: 'warning' })
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      const chain: EscalationChain = {
        id: form.id ?? createChainId(),
        name: form.name.trim(),
        description: form.description.trim(),
        appliesTo: form.appliesTo.trim(),
        active: form.active,
        steps: form.steps,
      }
      upsertChain(chain)
      toast({
        title: mode === 'create' ? 'Escalation chain created' : 'Escalation chain updated',
        description: `${chain.name} saved with ${chain.steps.length} step${chain.steps.length === 1 ? '' : 's'}.`,
        variant: 'success',
      })
      router.push('/config/chains')
      setSubmitting(false)
    }, 450)
  }

  return (
    <PageContainer className="space-y-6 pb-8">
      <div>
        <Link
          href="/config/chains"
          className="mb-3 flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3 w-3" /> Escalation Chains
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-bg">
                <GitBranch className="h-4 w-4 text-warning" />
              </span>
              {mode === 'create' ? 'New escalation chain' : `Edit ${initial?.name ?? 'chain'}`}
            </h1>
            <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
              {mode === 'create'
                ? 'Define tier sequence, trigger conditions, and ownership handoffs for ticket escalation.'
                : 'Update escalation steps, SLA windows, and category assignments for this chain.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/config/chains">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button form="chain-form" type="submit" disabled={submitting} className="gap-1.5">
              <Save className="h-4 w-4" />
              {submitting ? 'Saving…' : mode === 'create' ? 'Create chain' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      <form id="chain-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
              <Layers className="h-4 w-4 text-brand" />
              Chain details
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="chain-name" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="chain-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Standard Escalation, Critical Path"
                  className="focus-ring w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[14px]"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="chain-desc" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="chain-desc"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="When and why this chain is used…"
                  rows={2}
                  className="focus-ring w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="chain-applies" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Applies to categories <span className="text-danger">*</span>
                </label>
                <input
                  id="chain-applies"
                  value={form.appliesTo}
                  onChange={(e) => update('appliesTo', e.target.value)}
                  placeholder="e.g. Technical, Billing, Security"
                  className="focus-ring w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[14px]"
                />
                <p className="text-[11px] text-muted-foreground">Comma-separated category names this chain routes</p>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand/30"
                />
                <div>
                  <p className="text-[13px] font-medium">Active chain</p>
                  <p className="text-[11px] text-muted-foreground">Inactive chains are hidden from category assignment</p>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold">
                <GitBranch className="h-4 w-4 text-warning" />
                Escalation steps
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add step
              </Button>
            </div>

            <div className="space-y-3">
              {form.steps.map((step, idx) => (
                <div key={step.id} className="rounded-xl border border-border bg-muted/15 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                      Step {idx + 1} · Tier {step.tier}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger-bg hover:text-danger"
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground">Tier</label>
                      <select
                        value={step.tier}
                        onChange={(e) => updateStep(step.id, { tier: Number(e.target.value) })}
                        className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                      >
                        {[1, 2, 3, 4].map((t) => (
                          <option key={t} value={t}>Tier {t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground">Trigger</label>
                      <select
                        value={step.triggerType}
                        onChange={(e) => updateStep(step.id, { triggerType: e.target.value })}
                        className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                      >
                        {TRIGGER_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground">Step label</label>
                      <input
                        value={step.label}
                        onChange={(e) => updateStep(step.id, { label: e.target.value })}
                        className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground">Responsible role</label>
                      <select
                        value={step.role}
                        onChange={(e) => updateStep(step.id, { role: e.target.value })}
                        className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                      >
                        {CHAIN_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase text-muted-foreground">SLA window</label>
                      <input
                        value={step.slaLimit}
                        onChange={(e) => updateStep(step.id, { slaLimit: e.target.value })}
                        placeholder="e.g. 4h (P2) · 1h (P1)"
                        className="focus-ring w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
            <div className="mb-3 rounded-lg border border-border bg-muted/25 px-3 py-2">
              <p className="text-[14px] font-semibold">{preview.name || 'Untitled chain'}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {preview.appliesTo || 'No categories assigned'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0">
              {preview.steps.map((step, idx) => (
                <div key={step.id} className="flex w-full flex-col items-center">
                  <div className={cn('w-full rounded-xl border px-3 py-2.5', getStepStyle(step.tier))}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card/80 text-[10px] font-bold">
                        T{step.tier}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold">{step.label}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
                          <User className="h-2.5 w-2.5 shrink-0" />
                          {step.role.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-[10px] opacity-75">
                      <Clock className="h-2.5 w-2.5" /> {step.slaLimit}
                    </p>
                  </div>
                  {idx < preview.steps.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <ArrowDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </form>
    </PageContainer>
  )
}
