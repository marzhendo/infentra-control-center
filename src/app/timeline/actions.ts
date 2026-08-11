'use server'

import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function createEvent(data: Database['public']['Tables']['timeline_events']['Insert']) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from('timeline_events').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/timeline')
  revalidatePath('/')
}

export async function deleteEvent(id: string) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from('timeline_events').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/timeline')
  revalidatePath('/')
}
