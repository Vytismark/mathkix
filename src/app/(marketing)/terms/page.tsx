import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'

export const metadata: Metadata = {
  title: 'Terms of Service - MathKix',
  description: 'Terms of Service for MathKix, the adaptive math learning platform for Grades 1-5.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service - MathKix',
    description: 'Terms of Service for MathKix, the adaptive math learning platform for Grades 1-5.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - MathKix',
    description: 'Terms of Service for MathKix, the adaptive math learning platform for Grades 1-5.',
  },
}

export default function TermsPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'
  const updated = 'March 22, 2026'

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: 'white' }}>
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: {updated}</p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-0 [&_p+p]:mt-3">

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account or using {appName} (&quot;the Service&quot;), you agree to these Terms of Service.
              If you are a parent or guardian creating an account on behalf of a child, you accept these terms on their behalf.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>
              {appName} is designed for children in Grades 1-5 (approximately ages 5-11), used under parental supervision.
              Only parents or legal guardians aged 18 or older may create accounts. Children access the Service through
              child profiles managed by their parent&apos;s account.
            </p>
          </section>

          <section>
            <h2>3. Account and Child Profiles</h2>
            <p>
              You are responsible for maintaining the security of your account credentials. Each account supports up to
              2 child profiles on the free trial and up to 10 on a paid plan. You agree to provide accurate information
              when creating child profiles.
            </p>
          </section>

          <section>
            <h2>4. Free Trial and Subscriptions</h2>
            <p>
              New accounts receive a 30-day free trial with full access to all features. No credit card is required to
              start a trial. After the trial, continued access requires a paid subscription (monthly, annual, or lifetime).
            </p>
            <p>
              Subscription fees are billed through Stripe. Monthly and annual plans renew automatically unless cancelled
              before the renewal date. You may cancel at any time from your account settings; your access continues until
              the end of your current billing period. We do not offer refunds for partial billing periods.
            </p>
            <p>
              We reserve the right to change pricing with 30 days' notice to existing subscribers. Lifetime plans are
              not subject to future price changes.
            </p>
          </section>

          <section>
            <h2>5. Children&apos;s Privacy and COPPA</h2>
            <p>
              We comply with the Children&apos;s Online Privacy Protection Act (COPPA). We collect only the minimum
              information necessary to provide the Service. Children interact with the platform only through profiles
              created and managed by their parent or guardian. See our{' '}
              <a href="/privacy" className="text-red-400 hover:text-red-300 underline underline-offset-2">Privacy Policy</a>{' '}
              for full details on how we handle children&apos;s data.
            </p>
          </section>

          <section>
            <h2>6. AI Tutoring</h2>
            <p>
              {appName} uses AI technology (powered by Anthropic&apos;s Claude) to provide personalized tutoring.
              The AI tutor (&quot;Ms. Owl&quot;) is designed to be age-appropriate, encouraging, and educationally focused.
              While we take extensive measures to ensure safe and helpful responses, AI-generated content may occasionally
              contain errors. The AI tutor is a supplement to, not a replacement for, human instruction.
            </p>
          </section>

          <section>
            <h2>7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Share your account credentials with others</li>
              <li>Attempt to reverse-engineer, scrape, or interfere with the Service</li>
              <li>Use the Service for any purpose other than educational math learning</li>
              <li>Attempt to manipulate the AI tutor to produce inappropriate content</li>
              <li>Create accounts with false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>
              All content, curriculum, question banks, algorithms, and branding are the property of {appName}.
              The curriculum is aligned to Common Core State Standards for Mathematics but is independently authored.
              You may not reproduce, distribute, or create derivative works from any Service content.
            </p>
          </section>

          <section>
            <h2>9. Service Availability</h2>
            <p>
              We strive to keep {appName} available at all times but do not guarantee uninterrupted access.
              We may perform maintenance, updates, or modifications that temporarily affect availability.
              We are not liable for any disruption caused by circumstances beyond our reasonable control.
            </p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate accounts that violate these terms.
              Upon termination, your data will be handled according to our Privacy Policy.
            </p>
          </section>

          <section>
            <h2>11. Limitation of Liability</h2>
            <p>
              {appName} is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the Service. Our total liability is limited
              to the amount you paid for the Service in the 12 months preceding any claim.
            </p>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify registered users of material changes via email.
              Continued use after changes take effect constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of Delaware,
              without regard to its conflict of law provisions. Any dispute arising from these Terms or your use
              of the Service will be resolved through binding arbitration under the rules of the American
              Arbitration Association, except that either party may seek injunctive or equitable relief in a court
              of competent jurisdiction. You waive any right to participate in a class action lawsuit or class-wide
              arbitration.
            </p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:hello@mathkix.com" className="text-white font-medium">hello@mathkix.com</a>.
            </p>
          </section>

        </div>
      </article>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span>&copy; {new Date().getFullYear()} {appName}</span>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-slate-400">Terms</a>
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
