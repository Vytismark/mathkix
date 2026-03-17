import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = { title: 'Create account - MathKix' }

export default function SignupPage() {
  return (
    <>
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
        <p className="text-slate-500 text-sm mt-2">Start your free 30-day trial today</p>
      </div>
      <SignupForm />
    </>
  )
}
