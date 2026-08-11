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
import { createEvent } from '@/app/timeline/actions'
import { Database } from '@/types/database'

type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date | null
}

export function EventDialog({ open, onOpenChange, selectedDate }: EventDialogProps) {
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      event_name: formData.get('event_name') as string,
      date: formData.get('date') as string,
      category: formData.get('category') as TimelineEvent['category'],
      description: (formData.get('description') as string) || null,
    }

    try {
      await createEvent(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const defaultDate = selectedDate 
    ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Schedule a new milestone, oprec, or event day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_name" className="text-right">Event Name</Label>
              <Input id="event_name" name="event_name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                defaultValue={defaultDate} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <div className="col-span-3">
                <Select name="category" defaultValue="Milestone" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                    <SelectItem value="Oprec">Oprec</SelectItem>
                    <SelectItem value="Event Day">Event Day</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input 
                id="description" 
                name="description" 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
