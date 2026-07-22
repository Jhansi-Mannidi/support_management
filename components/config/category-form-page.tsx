'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  Layers,
  Plus,
  Save,
  Tag,
  Trash2,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast-provider'
import { PageContainer } from '@/components/motion/motion-primitives'
import {
  CATEGORY_COLORS,
  PRIORITY_OPTIONS,
  SLA_POLICY_OPTIONS,
  TIER_COLORS,
  TIER_LABELS,
  type Category,
  type CategoryFormValues,
  type SubCategory,
  createSubCategoryId,
  emptyCategoryForm,
  upsertCategory,
  createCategoryId,
} from '@/lib/category-config'

interface CategoryFormPageProps {
  mode: 'create' | 'edit'
  initial?: Category
}

export function CategoryFormPage({ mode, initial }: CategoryFormPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CategoryFormValues>(() =>
    initial
      ? {
          id: initial.id,
          name: initial.name,
          description: initial.description ?? '',
          color: initial.color,
          defaultPriority: initial.defaultPriority,
          slaPolicy: initial.slaPolicy,
          active: initial.active,
          sub: [...initial.sub],
        }
      : emptyCategoryForm(),
  )
  const [newSubName, setNewSubName] = useState('')
  const [newSubTier, setNewSubTier] = useState(1)

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name,
        description: initial.description ?? '',
        color: initial.color,
        defaultPriority: initial.defaultPriority,
        slaPolicy: initial.slaPolicy,
        active: initial.active,
        sub: [...initial.sub],
      })
    }
  }, [initial])

  const preview = useMemo(
    () => ({
      ...form,
      id: form.id ?? 'preview',
      count: initial?.count ?? 0,
    }),
    [form, initial?.count],
  )

  const update = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addSubCategory = () => {
    const name = newSubName.trim()
    if (!name) return
    const sub: SubCategory = {
      id: createSubCategoryId(),
      name,
      tier: newSubTier,
      active: true,
    }
    update('sub', [...form.sub, sub])
    setNewSubName('')
    setNewSubTier(1)
  }

  const removeSub = (id: string) => {
    update(
      'sub',
      form.sub.filter((s) => s.id !== id),
    )
  }

  const updateSub = (id: string, patch: Partial<SubCategory>) => {
    update(
      'sub',
      form.sub.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Name required', description: 'Enter a category name to continue.', variant: 'warning' })
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      const category: Category = {
        id: form.id ?? createCategoryId(),
        name: form.name.trim(),
        description: form.description?.trim(),
        color: form.color,
        defaultPriority: form.defaultPriority,
        slaPolicy: form.slaPolicy,
        active: form.active,
        count: initial?.count ?? 0,
        sub: form.sub,
      }
      upsertCategory(category)
      toast({
        title: mode === 'create' ? 'Category created' : 'Category updated',
        description: `${category.name} saved with ${category.sub.length} sub-categor${category.sub.length === 1 ? 'y' : 'ies'}.`,
        variant: 'success',
      })
      router.push('/config/categories')
      setSubmitting(false)
    }, 450)
  }

  return (
    <PageContainer className="space-y-6 pb-8">
      <div>
        <Link
          href="/config/categories"
          className="mb-3 flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3 w-3" /> Categories
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                <Tag className="h-4 w-4 text-brand" />
              </span>
              {mode === 'create' ? 'Add category' : `Edit ${initial?.name ?? 'category'}`}
            </h1>
            <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
              {mode === 'create'
                ? 'Define classification rules, default routing, and sub-categories for ticket triage.'
                : 'Update taxonomy, SLA defaults, and sub-category routing for this classification.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/config/categories">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button form="category-form" type="submit" disabled={submitting} className="gap-1.5">
              <Save className="h-4 w-4" />
              {submitting ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      <form id="category-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Basics */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
              <Layers className="h-4 w-4 text-brand" />
              Category details
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="cat-name" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Compliance, Customs, Partner API"
                  className="focus-ring w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cat-desc" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="cat-desc"
                  value={form.description ?? ''}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Brief description for admins and routing rules…"
                  rows={2}
                  className="focus-ring w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Color label
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => update('color', c.value)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                        form.color === c.value ? 'border-foreground scale-110 ring-2 ring-brand/30' : 'border-transparent',
                      )}
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand/30"
                />
                <div>
                  <p className="text-[13px] font-medium text-foreground">Active category</p>
                  <p className="text-[11px] text-muted-foreground">Inactive categories are hidden from ticket creation</p>
                </div>
              </label>
            </div>
          </section>

          {/* Routing defaults */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
              <Zap className="h-4 w-4 text-brand" />
              Default routing
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="cat-priority" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Default priority
                </label>
                <select
                  id="cat-priority"
                  value={form.defaultPriority}
                  onChange={(e) => update('defaultPriority', e.target.value)}
                  className="focus-ring w-full cursor-pointer rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[13px]"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cat-sla" className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  SLA policy
                </label>
                <select
                  id="cat-sla"
                  value={form.slaPolicy}
                  onChange={(e) => update('slaPolicy', e.target.value)}
                  className="focus-ring w-full cursor-pointer rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[13px]"
                >
                  {SLA_POLICY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Sub-categories */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-[14px] font-semibold">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              Sub-categories
            </h2>
            <p className="mb-4 text-[12px] text-muted-foreground">
              Optional finer classification with tier routing hints.
            </p>

            {form.sub.length > 0 && (
              <ul className="mb-4 space-y-2">
                {form.sub.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    <select
                      value={sub.tier}
                      onChange={(e) => updateSub(sub.id, { tier: Number(e.target.value) })}
                      className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-bold"
                    >
                      {[1, 2, 3, 4].map((t) => (
                        <option key={t} value={t}>
                          {TIER_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={sub.name}
                      onChange={(e) => updateSub(sub.id, { name: e.target.value })}
                      className="min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-1 text-[13px]"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={sub.active}
                        onChange={(e) => updateSub(sub.id, { active: e.target.checked })}
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSub(sub.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-danger-bg hover:text-danger"
                      aria-label="Remove sub-category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-border bg-muted/10 p-3">
              <select
                value={newSubTier}
                onChange={(e) => setNewSubTier(Number(e.target.value))}
                className="rounded-lg border border-border bg-card px-2 py-2 text-[12px] font-semibold"
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABELS[t]} tier
                  </option>
                ))}
              </select>
              <input
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubCategory())}
                placeholder="Sub-category name"
                className="min-w-[160px] flex-1 rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSubCategory} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </section>
        </div>

        {/* Preview sidebar */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border bg-gradient-to-br from-brand/10 via-accent/50 to-card px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
              <p className="text-[12px] text-muted-foreground">How this appears in the category list</p>
            </div>
            <div className="p-4">
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ background: preview.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold">
                        {preview.name.trim() || 'Category name'}
                      </span>
                      {preview.active ? (
                        <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {preview.description?.trim() || 'No description yet'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>
                        Default: <b className="text-foreground">{preview.defaultPriority}</b>
                      </span>
                      <span>
                        SLA: <b className="text-foreground">{preview.slaPolicy}</b>
                      </span>
                    </div>
                    {preview.sub.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-border/60 pt-2">
                        {preview.sub.slice(0, 4).map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <span className={cn('rounded px-1 py-0.5 text-[10px] font-bold', TIER_COLORS[sub.tier])}>
                              {TIER_LABELS[sub.tier]}
                            </span>
                            <span className={cn('truncate text-[12px]', !sub.active && 'line-through text-muted-foreground')}>
                              {sub.name}
                            </span>
                          </div>
                        ))}
                        {preview.sub.length > 4 && (
                          <p className="text-[10px] text-muted-foreground">+{preview.sub.length - 4} more</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-[12px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  Changes apply to new tickets immediately
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  Existing tickets keep their current classification
                </li>
              </ul>
            </div>
          </motion.div>
        </aside>
      </form>
    </PageContainer>
  )
}
