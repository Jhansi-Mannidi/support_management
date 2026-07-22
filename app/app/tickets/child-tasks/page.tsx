'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast-provider'
import { ClearFiltersButton, ListToolbarActions } from '@/components/ui/list-toolbar-actions'
import { downloadCsv } from '@/lib/export-utils'
import { mockChildTasks } from '@/lib/mock-data'
import {
  Plus, ChevronRight, CheckCircle2, Clock, AlertTriangle,
  Circle, Loader2, X, User, Calendar, Info, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

const TASK_STATUS = {
  todo: { label: 'To do', color: 'text-muted-foreground bg-muted border-border', dot: 'bg-muted-foreground' },
  in_progress: { label: 'In progress', color: 'text-info bg-info-bg border-info/30', dot: 'bg-info' },
  blocked: { label: 'Blocked', color: 'text-warning bg-warning-bg border-warning/30', dot: 'bg-warning' },
  done: { label: 'Done', color: 'text-success bg-success-bg border-success/30', dot: 'bg-success' },
}

const TEMPLATES = [
  { label: 'Reproduce bug', desc: 'Isolate and confirm the defect in a test environment' },
  { label: 'Patch config', desc: 'Apply configuration fix without a full deploy' },
  { label: 'Engineering investigation', desc: 'Deep-dive into root cause with the engineering team' },
  { label: 'Awaiting deploy', desc: 'Blocked on next release cycle or hotfix deploy' },
]

export default function ChildTasksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-muted-foreground">Loading linked work…</div>}>
      <ChildTasksContent />
    </Suspense>
  )
}

function ChildTasksContent() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticket') || 'TKT-10428'
  const { toast } = useToast()
  const [tasks, setTasks] = useState(mockChildTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('p3')
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const doneCount = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      const matchStatus = !statusFilter || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [tasks, search, statusFilter])

  const handleExport = () => {
    const count = downloadCsv(`child-tasks-${Date.now()}.csv`, filteredTasks, [
      { header: 'ID', accessor: (t) => t.id },
      { header: 'Title', accessor: (t) => t.title },
      { header: 'Assignee', accessor: (t) => t.assignee },
      { header: 'Status', accessor: (t) => t.status },
      { header: 'Due Date', accessor: (t) => t.dueDate },
    ])
    if (count === 0) {
      toast({ title: 'Nothing to export', description: 'No tasks match the current filters.', variant: 'warning' })
      return
    }
    toast({ title: 'Export complete', description: `${count} task(s) downloaded as CSV.`, variant: 'success' })
  }

  const handleCreate = () => {
    if (!title.trim()) return
    setSaving(true)
    setTimeout(() => {
      setTasks((prev) => [...prev, {
        id: `CT-00${prev.length + 1}`,
        title,
        assignee: assignee || 'Unassigned',
        assigneeInitials: assignee ? assignee.slice(0, 2).toUpperCase() : 'UN',
        status: 'todo' as const,
        dueDate: dueDate || '2025-07-25',
      }])
      setSaving(false)
      setShowCreate(false)
      setTitle(''); setDesc(''); setAssignee(''); setDueDate('')
    }, 900)
  }

  return (
    <PageContainer className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Link href={`/app/tickets/${ticketId}`} className="hover:text-brand">{ticketId}</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Linked work</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Linked work</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Child tasks track internal work. They roll status up to this ticket but don&apos;t affect SLA or escalation.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover"
          >
            <Plus className="h-3.5 w-3.5" /> Create child task
          </button>
        </div>

        {/* Progress rollup */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-foreground">{doneCount} of {tasks.length} tasks complete</span>
            <span className="text-[12px] text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-success transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-success-bg border border-success/30 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-[13px] font-semibold text-success">All linked work done — ready to resolve?</p>
              <Link href={`/app/tickets/${ticketId}`} className="ml-auto text-[12px] text-success hover:underline">
                Go to ticket
              </Link>
            </div>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-xl border border-brand/30 bg-card p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-foreground">Create child task</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Templates */}
            <div>
              <p className="mb-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Quick templates</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => { setSelectedTemplate(t.label); setTitle(t.label); setDesc(t.desc) }}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left transition-all',
                      selectedTemplate === t.label ? 'border-brand bg-accent' : 'border-border bg-muted/50 hover:border-brand/40'
                    )}
                  >
                    <p className="text-[12px] font-semibold text-foreground">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-foreground">Title <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-foreground">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-foreground">Assignee</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Name or team"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-foreground">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-info-bg border border-info/20 px-3 py-2">
                <Info className="h-3.5 w-3.5 text-info shrink-0" />
                <p className="text-[12px] text-info">
                  Parent ticket: <span className="font-mono font-bold">{ticketId}</span> · Container MRSU2381746
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!title.trim() || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create task
              </button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground outline-none"
          >
            <option value="">All statuses</option>
            {Object.entries(TASK_STATUS).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <ClearFiltersButton visible={!!(search || statusFilter)} onClear={() => { setSearch(''); setStatusFilter('') }} />
          <ListToolbarActions onExport={handleExport} exportDisabled={filteredTasks.length === 0} />
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">No linked work yet</p>
              <p className="text-[13px] text-muted-foreground">Create child tasks to track internal work for this ticket.</p>
              <button onClick={() => setShowCreate(true)} className="mt-1 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover">
                Create child task
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-[14px] font-semibold text-foreground">No tasks match your filters</p>
              <button type="button" onClick={() => { setSearch(''); setStatusFilter('') }} className="text-[12px] text-brand hover:underline">
                Clear filters
              </button>
            </div>
          ) : filteredTasks.map((task) => {
            const statusConfig = TASK_STATUS[task.status]
            return (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-brand/30 transition-all">
                <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', statusConfig.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-muted-foreground">{task.id}</span>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex items-center gap-1">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                        {task.assigneeInitials.slice(0, 1)}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{task.assignee}</span>
                    </div>
                    {task.dueDate && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />{task.dueDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0', statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>
            )
          })}
        </div>
      </PageContainer>
  )
}
