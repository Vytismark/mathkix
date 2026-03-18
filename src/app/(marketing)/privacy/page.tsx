import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'

export const metadata: Metadata = {
  title: 'Privacy Policy - MathKix',
  description: 'Privacy Policy for MathKix. Learn how we protect your data and your children\'s privacy. COPPA compliant.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - MathKix',
    description: 'Learn how MathKix protects your data and your children\'s privacy. COPPA compliant.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - MathKix',
    description: 'Learn how MathKix protects your data and your children\'s privacy. COPPA compliant.',
  },
}

export default function PrivacyPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'
  const updated = 'March 17, 2026'

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: 'white' }}>
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: {updated}</p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-0 [&_p+p]:mt-3">

          <section>
            <h2>1. Overview</h2>
            <p>
              {appName} is a math learning platform for children in Grades 1-5. We take privacy seriously -
              especially when it comes to children&apos;s data. This policy explains what information we collect,
              how we use it, and how we protect it.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <p className="text-white font-semibold mt-4 mb-2">From parents (account holders):</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Name and email address (for account creation and communication)</li>
              <li>Payment information (processed securely by Stripe - we never store card details)</li>
              <li>Account preferences and settings</li>
            </ul>

            <p className="text-white font-semibold mt-4 mb-2">From child profiles:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>First name (chosen by the parent)</li>
              <li>School grade level</li>
              <li>Learning preferences (pace, challenge preference, attention span - set by parent)</li>
              <li>Learning data: quiz answers, scores, mastery levels, lesson progress, XP, streaks, and achievements</li>
              <li>AI tutor conversation history (messages exchanged with Ms. Owl during sessions)</li>
              <li>Behavioral signals: response times, error patterns, and session duration (used to adapt difficulty in real time)</li>
            </ul>

            <p className="text-white font-semibold mt-4 mb-2">Automatically collected:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Basic device and browser information for compatibility</li>
              <li>Usage patterns (pages visited, feature usage) for improving the Service</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong className="text-white">Personalized learning:</strong> Adaptive question selection, difficulty adjustment, spaced repetition scheduling, and AI tutoring all rely on the child&apos;s learning data</li>
              <li><strong className="text-white">Progress reporting:</strong> Parents can view detailed progress, mastery levels, and domain scores for each child</li>
              <li><strong className="text-white">Service improvement:</strong> Aggregated, anonymized data helps us improve our curriculum, algorithms, and AI tutor quality</li>
              <li><strong className="text-white">Communication:</strong> We use parent email addresses for account-related messages (billing, security, major updates)</li>
            </ul>
          </section>

          <section>
            <h2>4. Children&apos;s Privacy (COPPA Compliance)</h2>
            <p>
              We comply with the Children&apos;s Online Privacy Protection Act (COPPA):
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Children cannot create their own accounts - only parents/guardians can create and manage child profiles</li>
              <li>We collect only the minimum data necessary to provide personalized math learning</li>
              <li>We do not collect personal contact information from children (no email, phone, or address)</li>
              <li>We do not display advertising or allow third-party tracking on child-facing pages</li>
              <li>Child data is never sold or shared with third parties for marketing purposes</li>
              <li>Parents can review, modify, or delete their child&apos;s data at any time</li>
            </ul>
          </section>

          <section>
            <h2>5. AI Tutor and Data Processing</h2>
            <p>
              Our AI tutor (Ms. Owl) is powered by Anthropic&apos;s Claude. When a child interacts with Ms. Owl:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Conversation context (the current question, child&apos;s grade level, and recent chat history) is sent to Anthropic&apos;s API to generate responses</li>
              <li>We do not send the child&apos;s real name to the API - only their first name as set by the parent</li>
              <li>Anthropic does not use this data to train their models (per their data usage policy)</li>
              <li>Conversation history is stored to provide continuity within sessions and is not retained indefinitely</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Sharing</h2>
            <p>We share data only with the following service providers, strictly for operating the Service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li><strong className="text-white">Supabase:</strong> Database hosting and authentication</li>
              <li><strong className="text-white">Stripe:</strong> Payment processing (parents only)</li>
              <li><strong className="text-white">Anthropic:</strong> AI tutoring responses</li>
            </ul>
            <p>
              We do not sell, rent, or share personal information with advertisers, data brokers, or any other third parties.
            </p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>
              We retain account and learning data for as long as your account is active. If you delete your account,
              we will delete all associated data (including child profiles and learning history) within 30 days.
              Some anonymized, aggregated data may be retained for service improvement purposes.
            </p>
          </section>

          <section>
            <h2>8. Data Security</h2>
            <p>
              We use industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>All data is encrypted in transit (TLS/HTTPS)</li>
              <li>Database access is restricted with row-level security policies</li>
              <li>Authentication is handled by Supabase Auth with secure session management</li>
              <li>Payment data is processed by Stripe (PCI DSS compliant) - we never see or store card numbers</li>
            </ul>
          </section>

          <section>
            <h2>9. Parental Rights</h2>
            <p>As a parent or guardian, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Review all data collected about your child</li>
              <li>Request correction of inaccurate information</li>
              <li>Delete your child&apos;s profile and all associated data</li>
              <li>Refuse further collection of your child&apos;s information (by deleting the profile or account)</li>
              <li>Export your child&apos;s learning data</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <span className="text-white font-medium">privacy@mathkix.com</span>.
            </p>
          </section>

          <section>
            <h2>10. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use advertising
              or tracking cookies. No third-party cookies are set on child-facing pages.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material
              changes via email. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your parental rights, contact us at:
            </p>
            <p className="mt-2">
              <span className="text-white font-medium">privacy@mathkix.com</span>
            </p>
          </section>

        </div>
      </article>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span>&copy; {new Date().getFullYear()} {appName}</span>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="/privacy" className="text-slate-400">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
