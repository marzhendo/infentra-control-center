import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DivisionClientPage } from './client-page'

export default async function DivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = (await createClient()) as any
  
  // Fetch division
  const { data: division } = await supabase
    .from('divisions')
    .select('id, name, slug, target_progress')
    .eq('slug', slug)
    .single()

  if (!division) {
    notFound()
  }

  // Fetch initial tasks for this division
  const { data: initialTasks } = await supabase
    .from('tasks')
    .select('id, division_id, title, pic, deadline, status, progress, link_attachment, created_at')
    .eq('division_id', division.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{division.name} Dashboard</h2>
      </div>
      <DivisionClientPage division={division} initialTasks={initialTasks || []} slug={slug} />
    </div>
  )
}
