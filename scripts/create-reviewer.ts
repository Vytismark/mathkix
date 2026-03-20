/**
 * Creates a reviewer account in Supabase with a random email + password.
 * Run: npx tsx scripts/create-reviewer.ts
 *
 * Outputs credentials to copy-paste and send to the freelancer.
 * The email is added to REVIEWER_EMAILS automatically — just add it to Vercel too.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local manually
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* no .env.local */ }

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

function randomStr(len: number, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') {
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function randomPassword(len = 16) {
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower   = 'abcdefghijklmnopqrstuvwxyz'
  const digits  = '0123456789'
  const special = '!@#$%^&*'
  const all     = upper + lower + digits + special
  // Guarantee at least one of each
  const pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
    ...Array.from({ length: len - 4 }, () => all[Math.floor(Math.random() * all.length)]),
  ]
  return pwd.sort(() => Math.random() - 0.5).join('')
}

async function main() {
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email    = `reviewer-${randomStr(6)}@mathkix.com`
  const password = randomPassword(16)

  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // skip email verification
  })

  if (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }

  console.log('\n✅  Reviewer account created!\n')
  console.log('─'.repeat(40))
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  URL:      https://mathkix.com/review`)
  console.log('─'.repeat(40))
  console.log('\n📋  Next steps:')
  console.log(`  1. Add  ${email}  to REVIEWER_EMAILS in Vercel`)
  console.log('  2. Copy the credentials above and send them to the freelancer')
  console.log('  3. She goes to https://mathkix.com/review and signs in with email + password\n')
}

main()
