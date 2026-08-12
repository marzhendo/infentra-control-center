'use client'

import React, { useState } from 'react'
import { CheckCircle2, Clock, ListTodo, ExternalLink } from 'lucide-react'
import { Database } from '@/types/database'
import Link from 'next/link'
import { format } from 'date-fns'

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
      
      {/* 1. Total Divisions - Dialog */}
      <Dialog>
        <DialogTrigger className="text-left rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Divisions</h3>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{divisions.length}</div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Divisions Progress Overview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4 px-2">
            {divisions.map(div => (
              <div key={div.id} className="flex flex-col gap-2 p-4 rounded-lg border bg-muted/20">
                <div className="flex justify-between items-center text-sm">
                  <Link href={`/division/${div.slug}`} className="font-semibold text-lg hover:underline flex items-center gap-2">
                    {div.name} <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <span className="font-bold">{div.currentProgress}%</span>
                </div>
                <Progress value={div.currentProgress} className="h-2" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Total Tasks - Dialog */}
      <Dialog>
        <DialogTrigger 
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
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Tasks Overview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 px-2 pb-4">
            {tasks.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No tasks found.</p>
            )}
            {tasks.map(task => (
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
        </DialogContent>
      </Dialog>

      {/* 3. Completed Tasks - Dialog */}
      <Dialog>
        <DialogTrigger 
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
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completed Tasks Overview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 px-2 pb-4">
            {tasks.filter(t => t.status === 'Done').length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No completed tasks yet.</p>
            )}
            {tasks.filter(t => t.status === 'Done').map(task => (
              <div key={task.id} className="p-4 rounded-lg border bg-emerald-500/10 flex flex-col gap-2 border-emerald-500/20">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-through text-slate-500">{task.title}</h4>
                  <Badge variant="default" className="text-[10px] bg-emerald-500">
                    Done
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{getDivisionName(task.division_id)}</span>
                  <span>PIC: {task.pic}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
          <div className="mt-4 flex flex-col gap-3 px-2 pb-4">
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
