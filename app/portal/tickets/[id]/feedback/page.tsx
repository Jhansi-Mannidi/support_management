'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/motion/motion-primitives'

const QUICK_TAGS_POSITIVE = ['Fast resolution', 'Knowledgeable', 'Clear communication', 'Kept me updated']
const QUICK_TAGS_NEGATIVE = ['Took too long', 'Issue not fully fixed', 'Unclear communication', 'Had to follow up']

const FACE_ICONS = ['😞', '😕', '😐', '🙂', '😊']
const FACE_LABELS = ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied']
const FACE_COLORS = ['text-danger', 'text-warning', 'text-muted-foreground', 'text-info', 'text-success']

export default function CSATPage() {
  const params = useParams()
  const ticketId = (params.id as string) || 'TKT-10428'

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [managerFollowUp, setManagerFollowUp] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (t: string) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const isLowRating = rating > 0 && rating <= 2
  const displayRating = hovered || rating
  const availableTags = isLowRating ? QUICK_TAGS_NEGATIVE : QUICK_TAGS_POSITIVE

  const handleSubmit = () => {
    if (!rating) return
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 1000)
  }

  if (submitted) {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center py-8">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Thanks, Priya!</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">Your feedback helps us improve support for everyone at Meridian Freight.</p>
          <div className="mt-4 flex justify-center gap-1.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={cn('h-6 w-6', s <= rating ? 'text-warning fill-warning' : 'text-muted-foreground')} />
            ))}
          </div>
          <p className="mt-2 text-[13px] font-semibold text-foreground">You rated this {rating}/5</p>
          <Link href="/portal">
            <button className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover">
              Back to my tickets
            </button>
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="w-full py-10">
        {/* Ticket context */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Ticket resolved</p>
          <p className="font-mono text-[13px] font-bold text-muted-foreground">{ticketId}</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">Container MRSU2381746 not showing latest status</p>
        </div>

        {/* Rating */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground text-center">How was your support experience?</h1>
            <p className="mt-1 text-center text-[13px] text-muted-foreground">Your honest feedback helps us serve you better.</p>
          </div>

          {/* Face rating */}
          <div className="flex justify-center gap-3">
            {FACE_ICONS.map((face, i) => {
              const val = i + 1
              const isActive = (hovered || rating) >= val
              return (
                <button
                  key={val}
                  onClick={() => setRating(val)}
                  onMouseEnter={() => setHovered(val)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={FACE_LABELS[i]}
                  className={cn(
                    'flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-2xl transition-all',
                    rating === val
                      ? 'border-brand bg-accent scale-110 shadow-md'
                      : hovered >= val
                      ? 'border-brand/40 bg-accent/50 scale-105'
                      : 'border-border bg-background hover:border-brand/30'
                  )}
                >
                  {face}
                </button>
              )
            })}
          </div>

          {displayRating > 0 && (
            <p className={cn('text-center text-[13px] font-semibold', FACE_COLORS[displayRating - 1])}>
              {FACE_LABELS[displayRating - 1]}
            </p>
          )}

          {/* Tags */}
          {rating > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-foreground">What stood out? <span className="font-normal text-muted-foreground">(optional)</span></p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-[12px] font-medium transition-all',
                      tags.includes(t)
                        ? 'border-brand bg-accent text-brand'
                        : 'border-border bg-muted text-muted-foreground hover:border-brand/40 hover:text-foreground'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Low rating: follow up */}
          {isLowRating && (
            <div className="rounded-xl border border-warning/30 bg-warning-bg p-4 space-y-3">
              <p className="text-[13px] font-semibold text-warning">We&apos;re sorry to hear that.</p>
              <textarea
                placeholder="What went wrong? (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-warning/30 bg-card px-3 py-2 text-[13px] focus:border-warning focus:outline-none focus:ring-1 focus:ring-warning"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={managerFollowUp}
                  onChange={(e) => setManagerFollowUp(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-warning"
                />
                <span className="text-[13px] text-foreground">A manager can follow up with me about this</span>
              </label>
            </div>
          )}

          {/* Comment for high ratings */}
          {rating >= 3 && !isLowRating && (
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-foreground">Anything else? <span className="font-normal text-muted-foreground">(optional)</span></p>
              <textarea
                placeholder="Additional comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[14px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Submit feedback
          </button>

          <Link href="/portal" className="block text-center text-[12px] text-muted-foreground hover:text-brand">
            Skip — return to my tickets
          </Link>
        </div>
      </PageContainer>
  )
}
