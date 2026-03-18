'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft, Lock, Download, Trash2, AlertTriangle,
  Shield, Bell, Eye, Mail, BookOpen, Megaphone, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPasswordStrength } from '@/lib/password'

/* ─── Shared styles ─────────────────────────────────────────────────────── */
const inputClass =
  'w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/10 outline-none focus:border-white/25 transition-colors placeholder:text-slate-600'
const inputStyle = { background: 'rgba(255,255,255,0.06)' }
const cardClass = 'rounded-3xl border border-white/10 overflow-hidden'
const cardBg = { background: 'rgba(255,255,255,0.05)' }
const headerClass = 'px-6 py-4 border-b border-white/[0.07] flex items-center gap-2.5'

/* ─── Toggle switch ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 disabled:opacity-40"
      style={{
        background: checked
          ? 'linear-gradient(135deg, #C0392B, #E74C3C)'
          : 'rgba(255,255,255,0.1)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

/* ─── Password strength bar ─────────────────────────────────────────────── */
function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label, color } = getPasswordStrength(password)
  if (level === 0) return null
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{ background: i <= level ? color : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <span className="text-xs font-medium shrink-0" style={{ color }}>{label}</span>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()

  // ── init state ──
  const [initialized, setInitialized] = useState(false)
  const [isEmailUser, setIsEmailUser] = useState(true)

  // ── profile ──
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // ── password ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // ── notifications ──
  const [notifPrefs, setNotifPrefs] = useState({
    support_updates: true,
    weekly_reports: true,
    product_updates: false,
  })
  const [notifLoading, setNotifLoading] = useState<string | null>(null)

  // ── export ──
  const [exportLoading, setExportLoading] = useState(false)

  // ── delete ──
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Load user data ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')

      // Detect if user has email/password auth
      const providers = (user.app_metadata?.providers as string[] | undefined) ?? []
      setIsEmailUser(providers.includes('email') || user.app_metadata?.provider === 'email')

      supabase
        .from('profiles')
        .select('full_name, notification_preferences')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setFullName(data?.full_name ?? '')
          const prefs = (data?.notification_preferences ?? {}) as Record<string, boolean>
          setNotifPrefs({
            support_updates: prefs.support_updates ?? true,
            weekly_reports: prefs.weekly_reports ?? true,
            product_updates: prefs.product_updates ?? false,
          })
          setInitialized(true)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    if (error) toast.error('Failed to update profile')
    else toast.success('Profile updated!')
    setProfileLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    const strength = getPasswordStrength(newPassword)
    if (strength.level < 2) {
      toast.error('Password is too weak')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/account/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update password')
      } else {
        toast.success('Password updated!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
    setPasswordLoading(false)
  }

  async function handleToggleNotif(key: keyof typeof notifPrefs) {
    const prev = notifPrefs[key]
    const updated = { ...notifPrefs, [key]: !prev }
    setNotifPrefs(updated)
    setNotifLoading(key)
    try {
      const res = await fetch('/api/account/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: !prev }),
      })
      if (!res.ok) {
        setNotifPrefs({ ...notifPrefs, [key]: prev }) // revert
        toast.error('Failed to update preference')
      }
    } catch {
      setNotifPrefs({ ...notifPrefs, [key]: prev }) // revert
      toast.error('Failed to update preference')
    }
    setNotifLoading(null)
  }

  async function handleExportData() {
    setExportLoading(true)
    try {
      const res = await fetch('/api/account/export-data', { method: 'POST' })
      if (!res.ok) {
        toast.error('Failed to export data')
        setExportLoading(false)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mathkix-data-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data export downloaded!')
    } catch {
      toast.error('Failed to export data')
    }
    setExportLoading(false)
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') return
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account')
        setDeleteLoading(false)
        return
      }
      await supabase.auth.signOut()
      toast.success('Account deleted')
      router.push('/')
    } catch {
      toast.error('An unexpected error occurred')
      setDeleteLoading(false)
    }
  }

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading…</div>
  }

  let delay = 0
  function nextDelay() {
    delay += 60
    return `${delay}ms`
  }

  return (
    <div className="max-w-2xl pb-16">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Dashboard
      </Link>

      <h1 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-white mb-1">
        Account Settings
      </h1>
      <p
        className="animate-fade-in-up text-slate-500 text-sm mb-8"
        style={{ animationDelay: nextDelay() }}
      >
        Manage your profile, security, and data
      </p>

      {/* ═══════════════════════ 1. Profile ═══════════════════════ */}
      <div className={`animate-fade-in-up ${cardClass} mb-5`} style={{ ...cardBg, animationDelay: nextDelay() }}>
        <div className={headerClass}>
          <Shield className="w-4 h-4 text-slate-500" />
          <h2 className="text-white font-semibold">Profile</h2>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email</label>
              <input
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-white/10 outline-none cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
              <p className="text-xs text-slate-600">
                To change your email, please <Link href="/support/new" className="text-red-400 hover:text-red-300 underline underline-offset-2">contact support</Link>.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-400">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="cta-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
              }}
            >
              {profileLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>

      {/* ═══════════════════════ 2. Change Password ═══════════════════════ */}
      <div className={`animate-fade-in-up ${cardClass} mb-5`} style={{ ...cardBg, animationDelay: nextDelay() }}>
        <div className={headerClass}>
          <Lock className="w-4 h-4 text-slate-500" />
          <h2 className="text-white font-semibold">Change Password</h2>
        </div>
        <div className="px-6 py-6">
          {isEmailUser ? (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-slate-400">Current password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={inputClass}
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-slate-400">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass}
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <PasswordStrengthBar password={newPassword} />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-400">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={inputClass}
                  style={inputStyle}
                  autoComplete="new-password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>
              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="cta-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                  boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
                }}
              >
                {passwordLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium mb-1">Signed in with Google</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your password is managed by your Google account. To change it, visit your{' '}
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    Google account settings
                  </a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════ 3. Email Notifications ═══════════════════════ */}
      <div className={`animate-fade-in-up ${cardClass} mb-5`} style={{ ...cardBg, animationDelay: nextDelay() }}>
        <div className={headerClass}>
          <Bell className="w-4 h-4 text-slate-500" />
          <h2 className="text-white font-semibold">Email Notifications</h2>
        </div>
        <div className="px-6 py-2">
          {([
            {
              key: 'support_updates' as const,
              icon: Mail,
              label: 'Support ticket updates',
              desc: 'Get notified when there\'s a reply to your support tickets',
            },
            {
              key: 'weekly_reports' as const,
              icon: BookOpen,
              label: 'Weekly progress reports',
              desc: 'Receive a summary of your children\'s learning progress each week',
            },
            {
              key: 'product_updates' as const,
              icon: Megaphone,
              label: 'Product updates & tips',
              desc: 'Occasional emails about new features and learning tips',
            },
          ]).map(({ key, icon: Icon, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.07] last:border-0"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
              <Toggle
                checked={notifPrefs[key]}
                onChange={() => handleToggleNotif(key)}
                disabled={notifLoading === key}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ 4. Your Data ═══════════════════════ */}
      <div className={`animate-fade-in-up ${cardClass} mb-5`} style={{ ...cardBg, animationDelay: nextDelay() }}>
        <div className={headerClass}>
          <Eye className="w-4 h-4 text-slate-500" />
          <h2 className="text-white font-semibold">Your Data</h2>
        </div>
        <div className="px-6 py-6 space-y-5">
          <div>
            <p className="text-sm text-slate-300 mb-3">We store the following information to provide personalized learning:</p>
            <ul className="space-y-2">
              {[
                'Account information (name, email)',
                'Subscription and billing status',
                'Your children\'s profiles and learning preferences',
                'Learning progress, quiz results, and practice sessions',
                'Support conversation history',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-slate-600 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="p-4 rounded-2xl border border-emerald-500/20"
            style={{ background: 'rgba(16,185,129,0.05)' }}
          >
            <p className="text-sm text-emerald-300/90 leading-relaxed">
              As a children&apos;s educational service, we take data privacy seriously.
              We collect only what&apos;s needed to provide personalized learning experiences.
              We never sell personal data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white border border-white/10 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Preparing download…' : 'Export all your data'}
            </button>
            <Link
              href="/children"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/[0.06] transition-colors"
            >
              Manage children&apos;s data
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ 5. Danger Zone ═══════════════════════ */}
      <div
        className={`animate-fade-in-up rounded-3xl border border-red-500/30 overflow-hidden mb-8`}
        style={{ background: 'rgba(255,255,255,0.05)', animationDelay: nextDelay() }}
      >
        <div
          className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2.5"
          style={{ background: 'rgba(239,68,68,0.05)' }}
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-red-400 font-semibold">Danger Zone</h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-slate-300 mb-3">
            Deleting your account is <span className="text-red-400 font-medium">permanent and cannot be undone</span>. This will:
          </p>
          <ul className="space-y-1.5 mb-5">
            {[
              'Cancel any active subscription',
              'Delete all children\'s profiles and learning data',
              'Delete all support conversations',
              'Remove your account from our system',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                <span className="w-1 h-1 rounded-full bg-red-500/60 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete my account
          </button>
        </div>
      </div>

      {/* ═══════════════════════ 6. Legal Footer ═══════════════════════ */}
      <div className="animate-fade-in-up text-center space-y-2 pb-4" style={{ animationDelay: nextDelay() }}>
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-xs text-slate-600">
          MathKix is committed to protecting children&apos;s privacy in compliance with COPPA.
        </p>
      </div>

      {/* ═══════════════════════ Delete Confirmation Dialog ═══════════════════════ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => { if (!deleteLoading) setShowDeleteDialog(false) }}
          />
          {/* Dialog */}
          <div
            className="relative animate-scale-in w-full max-w-md rounded-3xl border border-red-500/30 p-6"
            style={{ background: '#0e0f16' }}
          >
            <button
              onClick={() => { if (!deleteLoading) setShowDeleteDialog(false) }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold text-white">Are you sure?</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              This action is permanent. All your data and your children&apos;s learning progress
              will be permanently deleted. This cannot be undone.
            </p>
            <div className="space-y-2 mb-5">
              <label htmlFor="deleteConfirm" className="text-sm font-medium text-slate-400">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm
              </label>
              <input
                id="deleteConfirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className={inputClass}
                style={inputStyle}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmation('') }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-colors"
                style={{
                  background: deleteConfirmation === 'DELETE'
                    ? 'linear-gradient(135deg, #991b1b, #dc2626)'
                    : 'rgba(255,255,255,0.06)',
                }}
              >
                {deleteLoading ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
