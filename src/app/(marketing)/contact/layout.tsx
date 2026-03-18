import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact MathKix - Support & Inquiries',
  description:
    'Get in touch with the MathKix team. Questions about pricing, curriculum, or technical issues? We respond within hours.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact MathKix - Support & Inquiries',
    description:
      'Get in touch with the MathKix team. Questions about pricing, curriculum, or technical issues? We respond within hours.',
    type: 'website',
  },
  twitter: {
    title: 'Contact MathKix - Support & Inquiries',
    description:
      'Get in touch with the MathKix team. Questions about pricing, curriculum, or technical issues?',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
