'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/components/ui/toast-provider'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSent(true)
      toast({ title: 'Reset link sent', description: `Check ${email} for password reset instructions.`, variant: 'success' })
    }, 900)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-[14px] font-bold">VoltusWave Support</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg"
        >
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="text-[13px] text-muted-foreground">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>.
                The link expires in 30 minutes.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-brand mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
              <h1 className="text-xl font-bold">Reset your password</h1>
              <p className="text-[13px] text-muted-foreground mt-1 mb-6">
                Enter your work email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-border bg-muted/40 py-2.5 pl-10 pr-3 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send reset link
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
