import { createClient } from '@/utils/supabase/server'
import { TimelineClientPage } from './client-page'

export default async function TimelinePage() {
  const supabase = (await createClient()) as any
  
  // Fetch timeline events
  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Timeline</h2>
          <p className="text-muted-foreground">Keep track of important milestones, oprec, and event days.</p>
        </div>
      </div>
      <TimelineClientPage initialEvents={events || []} />
    </div>
  )
}
