'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { MotionButton } from '@/components/motion/motion-primitives'
import { useToast } from '@/components/ui/toast-provider'
import { slideInLeftVariants, slideInRightVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/motion'
import { Eye, EyeOff, Zap, ArrowRight, Loader2, ChevronRight, Shield, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_EMAIL = 'arjun.mehta@meridianfreight.com'
const DEFAULT_PASSWORD = 'Welcome123!'

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [remember, setRemember] = useState(false)
  const [loading, setSsoLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  const handleSso = () => {
    setSsoLoading(true)
    setError('')
    setTimeout(() => {
      toast({ title: 'SSO authenticated', description: 'Redirecting to your workspace…', variant: 'success' })
      router.push('/app/dashboard')
    }, 1500)
  }

  const handlePw = (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setError('')
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase()
      if (normalizedEmail === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
        toast({ title: 'Welcome back, Arjun', description: 'Signed in to Meridian Freight workspace.', variant: 'success' })
        router.push('/app/dashboard')
        return
      }
      setPwLoading(false)
      setError('Invalid email or password. Please try again.')
    }, 900)
  }

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideInLeftVariants}
        className="relative hidden flex-col justify-between overflow-hidden bg-navy p-10 lg:flex lg:w-[45%]"
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-0 right-0 opacity-10"
        >
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            <rect x="200" y="200" width="60" height="60" rx="8" fill="#F26722"/>
            <rect x="140" y="140" width="60" height="60" rx="8" fill="#F26722" opacity="0.7"/>
            <rect x="80" y="80" width="60" height="60" rx="8" fill="#F26722" opacity="0.5"/>
            <rect x="20" y="20" width="60" height="60" rx="8" fill="#F26722" opacity="0.3"/>
            <line x1="50" y1="80" x2="110" y2="140" stroke="#F26722" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
            <line x1="110" y1="140" x2="170" y2="200" stroke="#F26722" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
            <line x1="170" y1="200" x2="230" y2="260" stroke="#F26722" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
          </svg>
        </motion.div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white leading-none">VoltusWave</p>
              <p className="text-[11px] text-white/50 leading-none mt-0.5">Support Platform</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariants}
          className="relative z-10"
        >
          <motion.h2 variants={staggerItemVariants} className="text-3xl font-bold leading-tight text-white">
            Support that escalates<br />to the people who can<br />
            <span className="text-brand">actually fix it.</span>
          </motion.h2>
          <motion.p variants={staggerItemVariants} className="mt-4 text-base text-white/60 leading-relaxed">
            Enterprise cross-tenant ticketing with configurable escalation chains — from Department to Falcon.
          </motion.p>

          <div className="mt-8 space-y-3">
            {[
              { label: 'Automatic tier routing', sub: 'No org-chart knowledge needed' },
              { label: 'SLA-driven escalation', sub: 'Breach auto-escalates to the next tier' },
              { label: 'Full audit trail', sub: 'Every action timestamped and attributed' },
            ].map((f) => (
              <motion.div key={f.label} variants={staggerItemVariants} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20">
                  <ChevronRight className="h-3 w-3 text-brand" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{f.label}</p>
                  <p className="text-[12px] text-white/50">{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-[11px] text-white/40"
        >
          <Globe className="h-3 w-3" />
          Data hosted in India (IN-South) · ISO 27001 certified
        </motion.div>
      </motion.div>

      <div className="flex flex-1 flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[13px] font-bold">VoltusWave Support</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRightVariants}
            className="w-full max-w-[420px]"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariants}
              className="mb-8"
            >
              <motion.h1 variants={staggerItemVariants} className="text-2xl font-bold text-foreground">
                Welcome back
              </motion.h1>
              <motion.p variants={staggerItemVariants} className="mt-1 text-sm text-muted-foreground">
                Sign in to your VoltusWave Support workspace
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-4 flex items-start gap-2 overflow-hidden rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[13px] text-danger"
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <MotionButton
              onClick={handleSso}
              disabled={loading}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[14px] font-semibold text-white shadow-md shadow-brand/20 transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Continue with SSO
            </MotionButton>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <motion.form
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariants}
              onSubmit={handlePw}
              className="space-y-4"
            >
              <motion.div variants={staggerItemVariants}>
                <label className="mb-1.5 block text-[13px] font-medium text-foreground" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@meridianfreight.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[14px] text-foreground transition-all placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </motion.div>
              <motion.div variants={staggerItemVariants}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-foreground" htmlFor="password">Password</label>
                  <a href="/forgot-password" className="text-[12px] text-brand hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 pr-10 text-[14px] text-foreground transition-all placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={staggerItemVariants} className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-brand"
                />
                <label htmlFor="remember" className="text-[13px] text-muted-foreground">
                  Remember this device
                </label>
              </motion.div>

              <motion.div variants={staggerItemVariants}>
                <MotionButton
                  type="submit"
                  disabled={pwLoading}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted',
                    pwLoading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Sign in with password
                  {!pwLoading && <ArrowRight className="h-4 w-4" />}
                </MotionButton>
              </motion.div>
            </motion.form>

            <div className="mt-5 border-t border-border pt-5">
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground underline-offset-2 hover:underline"
              >
                Invited as a portal partner? (importer, exporter, carrier)
              </button>
              <AnimatePresence>
                {showInvite && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-lg border border-border bg-muted/50 p-4">
                      <p className="mb-2 text-[12px] text-muted-foreground">Enter your invite code or use the magic link from your invitation email.</p>
                      <input
                        type="text"
                        placeholder="Invite code (e.g. INV-XXXXX)"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <MotionButton className="mt-2 rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-hover">
                        Continue with invite code
                      </MotionButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-[11px] text-muted-foreground"
            >
              Your data is hosted in India (IN-South) per your tenant configuration.
            </motion.p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              <Link href="/portal" className="text-brand hover:underline">Requester portal</Link>
              {' · '}
              <Link href="/app/dashboard" className="text-brand hover:underline">Responder workspace</Link>
              {' · '}
              <Link href="/falcon/console" className="text-brand hover:underline">Falcon console</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
