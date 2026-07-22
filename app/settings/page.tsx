'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeSelector } from '@/components/theme-toggle'
import {
  User, Building2, Lock, Bell, Palette, Globe,
  Shield, CheckCircle2, Eye, EyeOff, Save, Camera,
  Smartphone, Mail, Clock, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { PageContainer } from '@/components/motion/motion-primitives'

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'org', label: 'Organisation', icon: Building2 },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    breachEmail: true, breachInApp: true, breachPush: true,
    assignEmail: false, assignInApp: true, assignPush: false,
    replyEmail: true, replyInApp: true, replyPush: false,
    resolvedEmail: true, resolvedInApp: false, resolvedPush: false,
    digestFrequency: 'Immediate',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle2 = (key: keyof typeof notifPrefs) =>
    setNotifPrefs(p => ({ ...p, [key]: !p[key] }))

  return (
    <PageContainer className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Account Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage your profile, security, and preferences</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar nav */}
          <aside className="lg:w-52 shrink-0">
            <nav className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium text-left transition-all shrink-0',
                      activeTab === tab.key
                        ? 'bg-brand/10 text-brand border border-brand/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <h2 className="text-[15px] font-bold">Profile Information</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">AM</div>
                    <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-all">
                      <Camera className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">Arjun Mehta</p>
                    <p className="text-[12px] text-muted-foreground">Branch Support Admin · Tier 2</p>
                    <button className="mt-1 text-[12px] text-brand hover:underline">Change photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { label: 'First Name', value: 'Arjun', type: 'text' },
                    { label: 'Last Name', value: 'Mehta', type: 'text' },
                    { label: 'Email Address', value: 'arjun.mehta@meridianfreight.com', type: 'email' },
                    { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
                    { label: 'Department', value: 'Operations', type: 'text' },
                    { label: 'Location', value: 'Mumbai, India', type: 'text' },
                  ].map(field => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Bio / Notes</label>
                  <textarea rows={3} className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" placeholder="Brief description about yourself…" />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSave} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all', saved ? 'bg-success text-white' : 'bg-brand text-white hover:bg-brand-hover')}>
                    {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
                  </button>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h2 className="text-[15px] font-bold">Change Password</h2>
                  <div className="space-y-3">
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 pr-10 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                            placeholder="••••••••"
                          />
                          {i === 0 && (
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSave} className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-all">
                    Update Password
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h2 className="text-[15px] font-bold">Two-Factor Authentication</h2>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-[13px] font-medium">Authenticator App</p>
                        <p className="text-[12px] text-success">Enabled</p>
                      </div>
                    </div>
                    <button className="text-[12px] text-brand hover:underline">Manage</button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-[13px] font-medium">Email OTP</p>
                        <p className="text-[12px] text-muted-foreground">Not configured</p>
                      </div>
                    </div>
                    <button className="text-[12px] text-brand hover:underline">Enable</button>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-[15px] font-bold mb-3">Active Sessions</h2>
                  <div className="space-y-2">
                    {[
                      { device: 'Chrome · MacBook Pro (Current)', location: 'Mumbai, India', time: 'Active now' },
                      { device: 'Safari · iPhone 15', location: 'Mumbai, India', time: '2 hours ago' },
                      { device: 'Chrome · Windows PC', location: 'Delhi, India', time: '3 days ago' },
                    ].map(session => (
                      <div key={session.device} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div>
                          <p className="text-[13px] font-medium">{session.device}</p>
                          <p className="text-[11px] text-muted-foreground">{session.location} · {session.time}</p>
                        </div>
                        {session.time !== 'Active now' && (
                          <button className="text-[12px] text-danger hover:underline">Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <h2 className="text-[15px] font-bold">Notification Preferences</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border">
                        {['Event', 'Email', 'In-App', 'Push'].map(h => (
                          <th key={h} className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:pl-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'SLA Breach', emailKey: 'breachEmail', inAppKey: 'breachInApp', pushKey: 'breachPush' },
                        { label: 'Ticket Assigned', emailKey: 'assignEmail', inAppKey: 'assignInApp', pushKey: 'assignPush' },
                        { label: 'Reply / Comment', emailKey: 'replyEmail', inAppKey: 'replyInApp', pushKey: 'replyPush' },
                        { label: 'Ticket Resolved', emailKey: 'resolvedEmail', inAppKey: 'resolvedInApp', pushKey: 'resolvedPush' },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 font-medium pl-0">{row.label}</td>
                          {[row.emailKey, row.inAppKey, row.pushKey].map(k => (
                            <td key={k} className="px-2 py-3">
                              <button onClick={() => toggle2(k as any)} className={cn('transition-colors', notifPrefs[k as keyof typeof notifPrefs] ? 'text-success' : 'text-muted-foreground')}>
                                {notifPrefs[k as keyof typeof notifPrefs] ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Email Digest Frequency</label>
                  <select
                    value={notifPrefs.digestFrequency}
                    onChange={e => setNotifPrefs(p => ({ ...p, digestFrequency: e.target.value }))}
                    className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand cursor-pointer transition-all"
                  >
                    {['Immediate', 'Hourly', 'Daily', 'Weekly'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSave} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all', saved ? 'bg-success text-white' : 'bg-brand text-white hover:bg-brand-hover')}>
                    {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Preferences</>}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <h2 className="text-[15px] font-bold">Appearance</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">Theme</p>
                      <p className="text-[12px] text-muted-foreground">Switch between light and dark mode</p>
                    </div>
                    <ThemeSelector />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">Compact Mode</p>
                      <p className="text-[12px] text-muted-foreground">Reduce padding for denser layouts</p>
                    </div>
                    <button className="text-muted-foreground"><ToggleLeft className="h-5 w-5" /></button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">Timezone</p>
                      <p className="text-[12px] text-muted-foreground">Used for SLA countdowns and timestamps</p>
                    </div>
                    <select className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] outline-none focus:border-brand cursor-pointer">
                      <option>Asia/Kolkata (IST +5:30)</option>
                      <option>UTC</option>
                      <option>Europe/London (GMT)</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">Date Format</p>
                      <p className="text-[12px] text-muted-foreground">How dates are displayed across the platform</p>
                    </div>
                    <select className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] outline-none focus:border-brand cursor-pointer">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Organisation */}
            {activeTab === 'org' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h2 className="text-[15px] font-bold">Organisation Details</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Organisation Name', value: 'Meridian Freight Pvt. Ltd.', type: 'text' },
                      { label: 'CRM Account ID', value: 'MF-00128', type: 'text' },
                      { label: 'Support Email', value: 'support@meridianfreight.com', type: 'email' },
                      { label: 'Primary Contact', value: 'Sneha Pillai', type: 'text' },
                      { label: 'Region', value: 'IN-South', type: 'text' },
                      { label: 'Subscription Tier', value: 'Enterprise', type: 'text' },
                    ].map(field => (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{field.label}</label>
                        <input type={field.type} defaultValue={field.value} className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleSave} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all', saved ? 'bg-success text-white' : 'bg-brand text-white hover:bg-brand-hover')}>
                      {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </PageContainer>
  )
}
