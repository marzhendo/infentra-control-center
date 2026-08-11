'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTask, updateTask } from '@/app/division/[slug]/actions'
import { Database } from '@/types/database'
import { format } from 'date-fns'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  divisionId: string
  slug: string
}

export function TaskDialog({ open, onOpenChange, task, divisionId, slug }: TaskDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isEditing = !!task

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: formData.get('title') as string,
      pic: formData.get('pic') as string,
      deadline: formData.get('deadline') as string,
      status: formData.get('status') as Task['status'],
      progress: Number(formData.get('progress')),
      link_attachment: (formData.get('link_attachment') as string) || null,
      division_id: divisionId,
    }

    try {
      if (isEditing && task) {
        await updateTask(task.id, data, slug)
      } else {
        await createTask(data, slug)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of the task here.' : 'Create a new task for your division.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Task</Label>
              <Input id="title" name="title" defaultValue={task?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pic" className="text-right">PIC</Label>
              <Input id="pic" name="pic" defaultValue={task?.pic} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              <Input 
                id="deadline" 
                name="deadline" 
                type="date" 
                defaultValue={task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select name="status" defaultValue={task?.status || 'Not Started'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Waiting Review">Waiting Review</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">Progress (%)</Label>
              <Input 
                id="progress" 
                name="progress" 
                type="number" 
                min="0" 
                max="100" 
                defaultValue={task?.progress || 0} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link_attachment" className="text-right">Link</Label>
              <Input 
                id="link_attachment" 
                name="link_attachment" 
                type="url" 
                defaultValue={task?.link_attachment || ''} 
                placeholder="https://" 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
