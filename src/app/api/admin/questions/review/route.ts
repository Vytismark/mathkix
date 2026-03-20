import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'
import type { Json } from '@/types/database'

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ref, source, status, comment, suggested_fix, snapshot } = await request.json() as {
    ref: string
    source: string
    status: 'approved' | 'flagged'
    comment?: string
    suggested_fix?: string
    snapshot: Record<string, unknown>
  }

  if (!ref || !source || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (status === 'flagged' && !comment?.trim()) {
    return NextResponse.json({ error: 'Comment required when flagging' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  await adminClient
    .from('question_reviews')
    .upsert({
      question_ref:      ref,
      question_source:   source,
      question_snapshot: snapshot as Json,
      status,
      comment:           comment?.trim() ?? null,
      suggested_fix:     suggested_fix?.trim() ?? null,
      reviewed_at:       new Date().toISOString(),
      is_ai_review:      false,
    }, { onConflict: 'question_ref' })

  return NextResponse.json({ ok: true })
}
