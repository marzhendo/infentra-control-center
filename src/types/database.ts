export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      divisions: {
        Row: {
          id: string
          name: string
          slug: string
          target_progress: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          target_progress?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          target_progress?: number
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: 'master_admin' | 'division_admin'
          division_slug: string | null
        }
        Insert: {
          id: string
          email?: string | null
          role?: 'master_admin' | 'division_admin'
          division_slug?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          role?: 'master_admin' | 'division_admin'
          division_slug?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          division_id: string
          title: string
          pic: string
          deadline: string
          status: 'Not Started' | 'In Progress' | 'Waiting Review' | 'Done' | 'Overdue'
          progress: number
          priority: 'Low' | 'Medium' | 'High'
          link_attachment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          division_id: string
          title: string
          pic: string
          deadline: string
          status: 'Not Started' | 'In Progress' | 'Waiting Review' | 'Done' | 'Overdue'
          progress?: number
          priority?: 'Low' | 'Medium' | 'High'
          link_attachment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          division_id?: string
          title?: string
          pic?: string
          deadline?: string
          status?: 'Not Started' | 'In Progress' | 'Waiting Review' | 'Done' | 'Overdue'
          progress?: number
          priority?: 'Low' | 'Medium' | 'High'
          link_attachment?: string | null
          created_at?: string
        }
      }
      timeline_events: {
        Row: {
          id: string
          event_name: string
          date: string
          category: 'Milestone' | 'Oprec' | 'Event Day' | 'Internal'
          description: string | null
        }
        Insert: {
          id?: string
          event_name: string
          date: string
          category: 'Milestone' | 'Oprec' | 'Event Day' | 'Internal'
          description?: string | null
        }
        Update: {
          id?: string
          event_name?: string
          date?: string
          category?: 'Milestone' | 'Oprec' | 'Event Day' | 'Internal'
          description?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'master_admin' | 'division_admin'
      task_priority: 'Low' | 'Medium' | 'High'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
