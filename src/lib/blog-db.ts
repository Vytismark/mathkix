import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from './supabase/admin'

export interface DbBlogPost {
  id: string
  slug: string
  title: string
  description: string
  category: string
  date: string
  read_time: number
  author: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getPublishedDbPosts(): Promise<DbBlogPost[]> {
  const { data } = await anonClient()
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
  return (data as DbBlogPost[]) ?? []
}

export async function getPublishedDbPostBySlug(slug: string): Promise<DbBlogPost | null> {
  const { data } = await anonClient()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  return data as DbBlogPost | null
}

export async function getAllDbPostsAdmin(): Promise<DbBlogPost[]> {
  const { data } = await createAdminClient()
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false })
  return (data as DbBlogPost[]) ?? []
}

export async function getDbPostBySlugAdmin(slug: string): Promise<DbBlogPost | null> {
  const { data } = await createAdminClient()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data as DbBlogPost | null
}
