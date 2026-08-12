import { createClient } from '@/utils/supabase/server'
import { TimelineClientPage, UnifiedTimelineItem } from './client-page'
import { Database } from '@/types/database'

export default async function TimelinePage() {
  const supabase = (await createClient()) as any
  
  // Fetch timeline events
  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .order('date', { ascending: true })

  // Fetch High Priority tasks
  const { data: highPriorityTasks } = await supabase
    .from('tasks')
    .select('*, divisions (name, slug)')
    .eq('priority', 'High')
    .neq('status', 'Done')
    .order('deadline', { ascending: true })

  // Merge into UnifiedTimelineItem array
  let unifiedEvents: UnifiedTimelineItem[] = []

  if (events) {
    unifiedEvents = unifiedEvents.concat(
      events.map((e: any) => ({
        id: `event-${e.id}`,
        original_id: e.id,
        type: 'event',
        event_name: e.event_name,
        date: e.date,
        category: e.category,
        description: e.description,
      }))
    )
  }

  if (highPriorityTasks) {
    unifiedEvents = unifiedEvents.concat(
      highPriorityTasks.map((t: any) => ({
        id: `task-${t.id}`,
        original_id: t.id,
        type: 'task',
        event_name: t.title,
        date: t.deadline,
        category: 'Division Task',
        description: `[${t.divisions?.name || 'Unknown'}] High Priority Task - PIC: ${t.pic}`,
        division_slug: t.divisions?.slug || null,
      }))
    )
  }

  // Sort unified events by date
  unifiedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Timeline</h2>
          <p className="text-muted-foreground">Keep track of important milestones, oprec, event days, and high-priority tasks.</p>
        </div>
      </div>
      <TimelineClientPage initialEvents={unifiedEvents} />
    </div>
  )
}
