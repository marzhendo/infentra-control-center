export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      divisions: {
        Row: {
          id: string
          name: string
          target_progress: number
        }
        Insert: {
          id?: string
          name: string
          target_progress?: number
        }
        Update: {
          id?: string
          name?: string
          target_progress?: number
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
  }
}
