import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MathKix · Question Review',
  robots: { index: false, follow: false },
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {children}
    </div>
  )
}
