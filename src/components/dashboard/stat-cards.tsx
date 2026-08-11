'use client'

import React, { useState } from 'react'
import { CheckCircle2, Clock, ListTodo, ExternalLink } from 'lucide-react'
import { Database } from '@/types/database'
import Link from 'next/link'
import { format } from 'date-fns'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

type Division = Database['public']['Tables']['divisions']['Row'] & { currentProgress: number }
type Task = Database['public']['Tables']['tasks']['Row']

interface StatCardsProps {
  divisions: Division[]
  tasks: Task[]
  totalTasks: number
  completedTasks: number
  overdueTasks: number
}

export function StatCards({ divisions, tasks, totalTasks, completedTasks, overdueTasks }: StatCardsProps) {
  const [taskFilter, setTaskFilter] = useState<'All' | 'Completed'>('All')

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'Completed') return t.status === 'Done'
    return true
  })

  const getDivisionName = (id: string) => divisions.find(d => d.id === id)?.name || 'Unknown'

  const today = new Date()
  const overdueTasksList = tasks.filter(t => new Date(t.deadline) < today && t.status !== 'Done')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      
      {/* 1. Total Divisions - Popover */}
      <Popover>
        <PopoverTrigger className="text-left rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Divisions</h3>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{divisions.length}</div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Divisions Progress</h4>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
              {divisions.map(div => (
                <div key={div.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <Link href={`/division/${div.slug}`} className="font-medium hover:underline flex items-center gap-1">
                      {div.name} <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span>{div.currentProgress}%</span>
                  </div>
                  <Progress value={div.currentProgress} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* 2 & 3. Total Tasks & Completed Tasks - Sheet */}
      <Sheet>
        <SheetTrigger 
          onClick={() => setTaskFilter('All')} 
          className="text-left rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Tasks</h3>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{totalTasks}</div>
          </div>
        </SheetTrigger>
        <SheetTrigger 
          onClick={() => setTaskFilter('Completed')} 
          className="text-left rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Completed Tasks</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% of total
            </p>
          </div>
        </SheetTrigger>

        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Task Overview ({taskFilter})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex gap-2">
            <Badge 
              variant={taskFilter === 'All' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setTaskFilter('All')}
            >
              All Tasks
            </Badge>
            <Badge 
              variant={taskFilter === 'Completed' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setTaskFilter('Completed')}
            >
              Completed
            </Badge>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {filteredTasks.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No tasks found.</p>
            )}
            {filteredTasks.map(task => (
              <div key={task.id} className="p-4 rounded-lg border bg-card flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Badge variant={task.status === 'Done' ? 'default' : 'secondary'} className="text-[10px]">
                    {task.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{getDivisionName(task.division_id)}</span>
                  <span>PIC: {task.pic}</span>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 4. Overdue Tasks - Dialog */}
      <Dialog>
        <DialogTrigger className="text-left rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:bg-red-500/10 transition-colors border-red-500/20 outline-none focus-visible:ring-2 focus-visible:ring-red-500">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Overdue Tasks</h3>
            <Clock className="h-4 w-4 text-destructive" />
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Clock className="w-5 h-5" /> Overdue Tasks Action Required
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            {overdueTasksList.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Great job! No overdue tasks.</p>
            ) : (
              overdueTasksList.map(task => {
                const daysOverdue = Math.floor((today.getTime() - new Date(task.deadline).getTime()) / (1000 * 3600 * 24))
                return (
                  <div key={task.id} className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <Badge variant="destructive" className="text-[10px]">
                        {daysOverdue} Day{daysOverdue > 1 ? 's' : ''} Overdue
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span className="font-medium">{getDivisionName(task.division_id)}</span>
                      <span>PIC: {task.pic}</span>
                      <span>Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
