import { notFound } from 'next/navigation'
import { getDbPostBySlugAdmin } from '@/lib/blog-db'
import { BlogEditor } from '@/components/admin/BlogEditor'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getDbPostBySlugAdmin(slug)
  if (!post) notFound()
  return <BlogEditor post={post} />
}
