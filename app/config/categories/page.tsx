'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { exportCategories } from '@/lib/export-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Tag, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown,
  GripVertical, ToggleLeft, ToggleRight, ArrowLeft,
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
import {
  TIER_COLORS,
  TIER_LABELS,
  deleteCategory,
  loadCategories,
  saveCategories,
  type Category,
} from '@/lib/category-config'

export default function CategoriesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>('cat-1')
  const [categories, setCategories] = useState<Category[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(() => {
    setCategories(loadCategories())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const persist = (next: Category[]) => {
    setCategories(next)
    saveCategories(next)
  }

  const toggleExpand = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const toggleActive = (id: string) => {
    const next = categories.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    persist(next)
    const cat = next.find((c) => c.id === id)
    toast({
      title: cat?.active ? 'Category activated' : 'Category deactivated',
      description: `${cat?.name} is now ${cat?.active ? 'visible' : 'hidden'} for new tickets.`,
      variant: 'info',
    })
  }

  const toggleSub = (catId: string, subId: string) => {
    persist(
      categories.map((c) =>
        c.id === catId
          ? { ...c, sub: c.sub.map((s) => (s.id === subId ? { ...s, active: !s.active } : s)) }
          : c,
      ),
    )
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => {
      const matchCategory = c.name.toLowerCase().includes(q)
      const matchSub = c.sub.some((s) => s.name.toLowerCase().includes(q))
      return matchCategory || matchSub
    })
  }, [categories, search])

  const handleExport = () => {
    const rows = filtered.flatMap((cat) =>
      cat.sub.map((sub) => ({
        category: cat.name,
        subCategory: sub.name,
        defaultPriority: cat.defaultPriority,
        slaPolicy: cat.slaPolicy,
        tier: sub.tier,
        active: cat.active && sub.active,
        ticketCount: cat.count,
      })),
    )
    const count = exportCategories(`categories-${Date.now()}.csv`, rows)
    toast({ title: 'Export complete', description: `${count} row(s) downloaded as CSV.`, variant: 'success' })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    window.setTimeout(() => {
      deleteCategory(deleteTarget.id)
      refresh()
      toast({
        title: 'Category deleted',
        description: `${deleteTarget.name} has been removed from the taxonomy.`,
        variant: 'success',
      })
      setDeleteTarget(null)
      setDeleting(false)
    }, 400)
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <Link
          href="/config"
          className="mb-2 flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3 w-3" /> Configuration Hub
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Tag className="h-5 w-5 text-brand" /> Categories
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Manage ticket classification taxonomy and routing rules
            </p>
          </div>
          <Link href="/config/categories/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[13px]">
        <span className="font-semibold text-foreground">{filtered.filter((c) => c.active).length} active</span>
        <span className="text-muted-foreground">{filtered.filter((c) => !c.active).length} inactive</span>
        <span className="text-muted-foreground">{filtered.reduce((a, c) => a + c.sub.length, 0)} sub-categories</span>
        {search && <span className="text-muted-foreground">· {filtered.length} matching</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories or sub-categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-[13px] placeholder:text-muted-foreground"
          />
        </div>
        <ClearFiltersButton visible={!!search} onClear={() => setSearch('')} />
        <ListToolbarActions onExport={handleExport} exportDisabled={filtered.length === 0} />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <Tag className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-[14px] font-semibold">No categories found</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Try a different search or add a new category.</p>
            <Link href="/config/categories/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add category
              </Button>
            </Link>
          </div>
        ) : (
          filtered.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />
                <button type="button" onClick={() => toggleExpand(cat.id)} className="shrink-0">
                  {expanded === cat.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">{cat.name}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {cat.sub.length} sub
                    </span>
                    <span className="text-[11px] text-muted-foreground">{cat.count} tickets</span>
                    {!cat.active && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      Default: <b className="text-foreground">{cat.defaultPriority}</b>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      SLA: <b className="text-foreground">{cat.slaPolicy}</b>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(cat.id)}
                  className={cn('shrink-0 transition-colors', cat.active ? 'text-success' : 'text-muted-foreground')}
                  aria-label={cat.active ? 'Deactivate category' : 'Activate category'}
                >
                  {cat.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Link href={`/config/categories/${cat.id}/edit`}>
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-danger-bg hover:text-danger"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {expanded === cat.id && (
                <div className="border-t border-border bg-muted/20">
                  {cat.sub.map((sub, i) => (
                    <div
                      key={sub.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5',
                        i < cat.sub.length - 1 && 'border-b border-border/50',
                      )}
                    >
                      <div className="w-4 shrink-0" />
                      <div className="w-4 shrink-0" />
                      <div className="flex flex-1 items-center gap-2">
                        <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-bold', TIER_COLORS[sub.tier])}>
                          {TIER_LABELS[sub.tier]}
                        </span>
                        <span className={cn('text-[13px]', !sub.active && 'text-muted-foreground line-through')}>
                          {sub.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSub(cat.id, sub.id)}
                        className={cn('shrink-0 transition-colors', sub.active ? 'text-success' : 'text-muted-foreground')}
                      >
                        {sub.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <Link href={`/config/categories/${cat.id}/edit`}>
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </Link>
                    </div>
                  ))}
                  <div className="px-4 py-2.5">
                    <Link
                      href={`/config/categories/${cat.id}/edit`}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add sub-category
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <Trash2 className="h-4 w-4" /> Delete category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget && deleteTarget.count > 0 && (
                <span className="mt-2 block rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-[12px] text-warning">
                  This category has {deleteTarget.count} linked tickets. Existing tickets will keep their classification, but new tickets cannot use this category.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
