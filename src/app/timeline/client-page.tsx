'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, Trash2, Filter } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { EventDialog } from '@/components/timeline/event-dialog'
import { deleteEvent } from '@/app/timeline/actions'
import Link from 'next/link'

export type UnifiedTimelineItem = {
  id: string
  original_id: string
  type: 'event' | 'task'
  event_name: string
  date: string
  category: string
  description: string | null
  division_slug?: string | null
}

export function TimelineClientPage({ initialEvents }: { initialEvents: UnifiedTimelineItem[] }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All')

  const openNewEventDialog = () => {
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, type: 'event' | 'task') => {
    if (type === 'task') {
      alert("This is a task. Please delete or modify it from its respective division workspace.")
      return
    }
    
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
      case 'Division Task': return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">High Priority Task</Badge>
      default: return <Badge variant="outline">{category}</Badge>
    }
  }

  // Filter events by selected category
  const filteredEvents = React.useMemo(() => {
    if (selectedCategory === 'All') return initialEvents
    return initialEvents.filter(e => e.category === selectedCategory)
  }, [initialEvents, selectedCategory])

  // Find events for the selected date (use unfiltered for calendar behavior)
  const selectedDateEvents = date 
    ? initialEvents.filter(e => isSameDay(new Date(e.date), date))
    : []

  // Create modifiers for the calendar
  const redDotDays = initialEvents.filter(e => e.type === 'task').map(e => new Date(e.date))
  const cyanDotDays = initialEvents.filter(e => e.category === 'Milestone' || e.category === 'Event Day').map(e => new Date(e.date))
  const purpleDotDays = initialEvents.filter(e => e.category === 'Internal' || e.category === 'Oprec').map(e => new Date(e.date))

  const modifiers = {
    redDot: redDotDays,
    cyanDot: cyanDotDays,
    purpleDot: purpleDotDays,
  }

  const modifiersClassNames = {
    redDot: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full font-bold",
    cyanDot: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-cyan-500 after:rounded-full font-bold",
    purpleDot: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-purple-500 after:rounded-full font-bold",
  }

  const categories = ['All', 'Milestone', 'Event Day', 'Internal', 'Division Task', 'Oprec']

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
            modifiersClassNames={modifiersClassNames}
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
              selectedDateEvents.map(event => {
                const isTask = event.type === 'task'
                const ItemWrapper = isTask && event.division_slug ? Link : 'div'
                const itemProps = isTask && event.division_slug ? { href: `/division/${event.division_slug}` } : {}

                return (
                  <ItemWrapper key={event.id} {...itemProps as any} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/50 ${isTask ? 'hover:bg-muted/80 hover:border-red-500/50 cursor-pointer transition-colors' : ''}`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-lg">{event.event_name}</h4>
                        {isTask && new Date(event.date) < new Date() && (
                          <Badge variant="destructive" className="bg-red-600 font-bold">OVERDUE</Badge>
                        )}
                        {getCategoryBadge(event.category)}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    {!isTask && (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); handleDelete(event.original_id, event.type) }} className="text-destructive mt-2 sm:mt-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </ItemWrapper>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No events scheduled for this date.
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">All Upcoming Events</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground mr-1" />
                {categories.map(cat => (
                  <Badge 
                    key={cat} 
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">No events match the selected category.</p>
              ) : (
                filteredEvents.map(event => {
                  const isTask = event.type === 'task'
                  const ItemWrapper = isTask && event.division_slug ? Link : 'div'
                  const itemProps = isTask && event.division_slug ? { href: `/division/${event.division_slug}` } : {}

                  return (
                    <ItemWrapper key={`all-${event.id}`} {...itemProps as any} className={`flex items-center justify-between p-3 border-b last:border-0 ${isTask ? 'hover:bg-muted/50 cursor-pointer rounded transition-colors' : ''}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.event_name}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isTask && new Date(event.date) < new Date() && (
                          <Badge variant="destructive" className="bg-red-600 text-[10px] px-1 py-0 h-4">OVERDUE</Badge>
                        )}
                        {getCategoryBadge(event.category)}
                      </div>
                    </ItemWrapper>
                  )
                })
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
