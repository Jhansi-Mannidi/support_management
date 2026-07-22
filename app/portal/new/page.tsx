'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Zap, ArrowLeft, ArrowRight, Paperclip, X, CheckCircle2,
  BookOpen, ChevronRight, Loader2, Upload, FileText,
  Package, DollarSign, Bug, Wrench, HelpCircle, Shield,
  AlertTriangle, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

const CATEGORIES = [
  { id: 'technical', label: 'Technical', icon: Wrench, desc: 'Platform errors, integrations, API issues', color: 'text-info' },
  { id: 'billing', label: 'Billing', icon: DollarSign, desc: 'Invoices, payments, cost discrepancies', color: 'text-warning' },
  { id: 'howto', label: 'How-to', icon: HelpCircle, desc: 'Feature guidance, configuration help', color: 'text-success' },
  { id: 'bug', label: 'Bug', icon: Bug, desc: 'Reproducible defects in the platform', color: 'text-danger' },
  { id: 'security', label: 'Security', icon: Shield, desc: 'Unauthorized access, data concerns', color: 'text-danger' },
  { id: 'shipment', label: 'Shipment / Tracking', icon: Package, desc: 'Container status, tracking feed issues', color: 'text-info' },
]

const PRIORITIES = [
  { id: 'p1', label: 'P1 Critical', sub: 'Operations are stopped or severely impacted', color: 'border-danger text-danger bg-danger-bg' },
  { id: 'p2', label: 'P2 High', sub: 'Major functionality degraded, workaround exists', color: 'border-warning text-warning bg-warning-bg' },
  { id: 'p3', label: 'P3 Normal', sub: 'Minor impact, standard resolution timeline', color: 'border-info text-info bg-info-bg' },
  { id: 'p4', label: 'P4 Low', sub: 'Cosmetic or informational, no operational impact', color: 'border-border text-muted-foreground bg-muted' },
]

const KB_ARTICLES = [
  { id: 'kb-1', title: 'Why is my container status showing "In Transit" with no updates?', snippet: 'Tracking feeds typically update every 2–6 hours. If status is stale beyond 24h, this guide walks through manual refresh steps...' },
  { id: 'kb-2', title: 'How to request a re-pull of container event data', snippet: 'You can trigger a manual event pull for any active shipment from the Shipments tab using the "Refresh events" action...' },
  { id: 'kb-3', title: 'Understanding tracking delay causes (port congestion, carrier API)', snippet: 'Common causes of tracking gaps include carrier API maintenance windows, port congestion, and transshipment port gaps...' },
]

interface FileChip {
  name: string
  size: string
  id: string
}

export default function RaiseTicketPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>}>
      <RaiseTicketContent />
    </Suspense>
  )
}

function RaiseTicketContent() {
  const searchParams = useSearchParams()
  const preCategory = searchParams.get('category') || ''

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState(preCategory)
  const [priority, setPriority] = useState('p3')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [shipmentRef, setShipmentRef] = useState('')
  const [files, setFiles] = useState<FileChip[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newTicketId] = useState('TKT-10458')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!category) errs.category = 'Please select a category'
    if (!subject.trim()) errs.subject = 'Subject is required'
    if (!description.trim()) errs.description = 'Please describe the issue'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validate()) setStep(2)
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1400)
  }

  const addFakeFile = () => {
    const names = ['screenshot.png', 'error_log.txt', 'billing_export.csv', 'api_response.json']
    const name = names[files.length % names.length]
    setFiles((f) => [...f, { name, size: `${Math.floor(Math.random() * 900 + 100)}KB`, id: crypto.randomUUID() }])
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ticket submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your ticket has been received and will be routed to the right team automatically.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-[12px] text-muted-foreground">Ticket ID</p>
            <p className="font-mono text-2xl font-bold text-brand">{newTicketId}</p>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Expected first response within <span className="font-semibold text-foreground">4 business hours</span> for P3 Normal priority.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              You&apos;ll receive an email and in-app notification when someone responds.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/portal/tickets/${newTicketId}`}>
              <button className="w-full rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover sm:w-auto">
                View ticket
              </button>
            </Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setSubject(''); setDescription(''); setCategory(''); setFiles([]) }}
              className="w-full rounded-lg border border-border bg-card px-5 py-2.5 text-[14px] font-medium text-foreground hover:bg-muted sm:w-auto"
            >
              Raise another
            </button>
          </div>
          <Link href="/portal" className="mt-4 block text-[12px] text-muted-foreground hover:text-brand">
            Back to my tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/portal">
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Back to portal">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand" />
              <span className="text-[13px] font-bold">Raise a Ticket</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                    step >= s ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                  </div>
                  {s < 2 && <div className={cn('h-px w-6', step > s ? 'bg-brand' : 'bg-border')} />}
                </div>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <PageContainer className="w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Describe your issue</h1>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    We&apos;ll route this to the right team automatically — no need to know the org chart.
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-3 block text-[14px] font-semibold text-foreground">
                    Category <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setCategory(cat.id); setErrors((e) => ({ ...e, category: '' })) }}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all',
                            category === cat.id
                              ? 'border-brand bg-accent ring-1 ring-brand'
                              : 'border-border bg-card hover:border-brand/40 hover:bg-muted/50'
                          )}
                        >
                          <Icon className={cn('h-4 w-4', category === cat.id ? 'text-brand' : cat.color)} />
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">{cat.label}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">{cat.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {errors.category && <p className="mt-1.5 text-[12px] text-danger">{errors.category}</p>}
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-3 block text-[14px] font-semibold text-foreground">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <div className="space-y-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                          priority === p.id
                            ? `${p.color} ring-1 ring-current border-current`
                            : 'border-border bg-card hover:bg-muted/50'
                        )}
                      >
                        <div className={cn(
                          'h-3 w-3 rounded-full border-2 shrink-0',
                          priority === p.id ? 'border-current bg-current' : 'border-border'
                        )} />
                        <div>
                          <p className="text-[13px] font-semibold">{p.label}</p>
                          <p className={cn('text-[11px]', priority === p.id ? 'opacity-80' : 'text-muted-foreground')}>{p.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-1.5 block text-[14px] font-semibold text-foreground" htmlFor="subject">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="e.g. Container MRSU2381746 not showing latest status"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setErrors((er) => ({ ...er, subject: '' })) }}
                    className={cn(
                      'w-full rounded-lg border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand',
                      errors.subject ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-brand'
                    )}
                  />
                  {errors.subject && <p className="mt-1 text-[12px] text-danger">{errors.subject}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-[14px] font-semibold text-foreground" htmlFor="desc">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="desc"
                    placeholder="Describe the issue in detail — steps to reproduce, what you expected vs. what happened, any error messages."
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors((er) => ({ ...er, description: '' })) }}
                    rows={6}
                    className={cn(
                      'w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand',
                      errors.description ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-brand'
                    )}
                  />
                  {errors.description && <p className="mt-1 text-[12px] text-danger">{errors.description}</p>}
                </div>

                {/* Attachments */}
                <div>
                  <label className="mb-1.5 block text-[14px] font-semibold text-foreground">Attachments</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addFakeFile() }}
                    onClick={addFakeFile}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-all',
                      dragOver ? 'border-brand bg-accent' : 'border-border bg-card hover:border-brand/40 hover:bg-muted/30'
                    )}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-foreground">Drop files or click to upload</p>
                      <p className="text-[11px] text-muted-foreground">Screenshots, logs, CSVs — max 25MB each</p>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[12px] font-medium text-foreground">{f.name}</span>
                          <span className="text-[11px] text-muted-foreground">{f.size}</span>
                          <button onClick={(e) => { e.stopPropagation(); setFiles((fs) => fs.filter((x) => x.id !== f.id)) }} className="text-muted-foreground hover:text-danger">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shipment ref */}
                <div>
                  <label className="mb-1.5 block text-[14px] font-semibold text-foreground" htmlFor="shipref">
                    Related shipment reference <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="shipref"
                    type="text"
                    placeholder="e.g. MRSU2381746"
                    value={shipmentRef}
                    onChange={(e) => setShipmentRef(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Adds context. We won&apos;t expose the shipment&apos;s other-party data.
                  </p>
                </div>

                {/* Routing note */}
                <div className="flex items-center gap-2 rounded-lg bg-info-bg border border-info/20 px-4 py-3">
                  <Info className="h-4 w-4 shrink-0 text-info" />
                  <p className="text-[13px] text-info">
                    We&apos;ll route this to the right team automatically and keep you updated at every step.
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[14px] font-semibold text-white hover:bg-brand-hover sm:w-auto sm:px-8"
                >
                  Review & submit
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Step 2 — Review */
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Review your ticket</h1>
                  <p className="mt-1 text-[13px] text-muted-foreground">Confirm the details before submitting.</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  {[
                    { label: 'Category', value: CATEGORIES.find((c) => c.id === category)?.label || category },
                    { label: 'Priority', value: PRIORITIES.find((p) => p.id === priority)?.label || priority },
                    { label: 'Subject', value: subject },
                    { label: 'Description', value: description },
                    shipmentRef ? { label: 'Shipment ref', value: shipmentRef } : null,
                  ].filter(Boolean).map((item) => (
                    <div key={item!.label} className="flex gap-4">
                      <span className="w-28 shrink-0 text-[12px] text-muted-foreground">{item!.label}</span>
                      <span className="text-[13px] text-foreground font-medium break-words flex-1">{item!.value}</span>
                    </div>
                  ))}
                  {files.length > 0 && (
                    <div className="flex gap-4">
                      <span className="w-28 shrink-0 text-[12px] text-muted-foreground">Attachments</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {files.map((f) => (
                          <span key={f.id} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{f.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-lg border border-border bg-card px-5 py-2.5 text-[14px] font-medium text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="inline h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover disabled:opacity-70 sm:flex-initial sm:px-8"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Submit ticket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* KB deflection panel */}
          {step === 1 && subject.length > 3 && (
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-brand" />
                  <h3 className="text-[13px] font-semibold text-foreground">Suggested articles</h3>
                </div>
                <p className="text-[12px] text-muted-foreground mb-3">These might resolve your issue right now.</p>
                <div className="space-y-2">
                  {KB_ARTICLES.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border bg-background p-3 group cursor-pointer hover:border-brand/40">
                      <p className="text-[12px] font-semibold text-foreground group-hover:text-brand leading-tight">{a.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{a.snippet}</p>
                      <button className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand hover:underline">
                        This helped, close ticket <CheckCircle2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
