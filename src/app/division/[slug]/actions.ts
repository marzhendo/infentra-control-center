'use server'

import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function createTask(data: Database['public']['Tables']['tasks']['Insert'], slug: string) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from('tasks').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath(`/division/${slug}`)
  revalidatePath(`/`)
}

export async function updateTask(id: string, updates: Database['public']['Tables']['tasks']['Update'], slug: string) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/division/${slug}`)
  revalidatePath(`/`)
}

export async function deleteTask(id: string, slug: string) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/division/${slug}`)
  revalidatePath(`/`)
}
