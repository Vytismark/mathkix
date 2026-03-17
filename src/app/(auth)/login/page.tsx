import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in - MathKix' }

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-2">Sign in to your account</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  )
}
