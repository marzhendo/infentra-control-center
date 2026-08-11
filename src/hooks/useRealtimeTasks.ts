import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

export function useRealtimeTasks(initialTasks: Task[], divisionId: string) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const supabase = createClient()

  useEffect(() => {
    // Reset tasks when initialTasks changes (e.g., SSR re-fetches)
    setTasks(initialTasks)

    const channel = supabase
      .channel(`postgres_changes_${divisionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `division_id=eq.${divisionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) => (task.id === payload.new.id ? (payload.new as Task) : task))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [divisionId, supabase, initialTasks])

  return tasks
}
