import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin/auth'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await verifyAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminShell>{children}</AdminShell>
    </div>
  )
}
