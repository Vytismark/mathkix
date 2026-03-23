import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'

export async function GET() {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminClient()
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.slug || !body.title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }
  const { data, error } = await createAdminClient()
    .from('blog_posts')
    .insert([{
      slug: body.slug,
      title: body.title,
      description: body.description ?? '',
      category: body.category ?? 'General',
      date: body.date ?? new Date().toISOString().split('T')[0],
      read_time: body.read_time ?? 5,
      author: body.author ?? 'The MathKix Team',
      content: body.content ?? '',
      published: body.published ?? false,
    }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
