'use client'

import * as React from 'react'
import { Database } from '@/types/database'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { EventDialog } from '@/components/timeline/event-dialog'
import { deleteEvent } from '@/app/timeline/actions'

type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']

export function TimelineClientPage({ initialEvents }: { initialEvents: TimelineEvent[] }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const openNewEventDialog = () => {
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id)
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Milestone': return <Badge className="bg-purple-500 hover:bg-purple-600">Milestone</Badge>
      case 'Oprec': return <Badge className="bg-blue-500 hover:bg-blue-600">Oprec</Badge>
      case 'Event Day': return <Badge className="bg-rose-500 hover:bg-rose-600">Event Day</Badge>
      case 'Internal': return <Badge variant="secondary">Internal</Badge>
      default: return <Badge variant="outline">{category}</Badge>
    }
  }

  // Find events for the selected date
  const selectedDateEvents = date 
    ? initialEvents.filter(e => isSameDay(new Date(e.date), date))
    : []

  // Create modifiers for the calendar
  const eventDays = initialEvents.map(e => new Date(e.date))
  const modifiers = {
    hasEvent: eventDays
  }

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      borderBottom: '2px solid currentColor'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Button onClick={openNewEventDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar View */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 col-span-1 flex flex-col items-center">
          <h3 className="tracking-tight text-lg font-semibold w-full text-left mb-4">Event Calendar</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </div>

        {/* Selected Date Events & Upcoming */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-6">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="tracking-tight text-lg font-semibold">
              {date ? format(date, 'MMMM d, yyyy') : 'Upcoming Events'}
            </h3>
          </div>

          <div className="space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{event.event_name}</h4>
                      {getCategoryBadge(event.category)}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-destructive mt-2 sm:mt-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No events scheduled for this date.
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground mb-4 uppercase">All Upcoming Events</h3>
            <div className="space-y-3">
              {initialEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
              ) : (
                initialEvents.map(event => (
                  <div key={`all-${event.id}`} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{event.event_name}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                    </div>
                    {getCategoryBadge(event.category)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <EventDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        selectedDate={date}
      />
    </div>
  )
}
