'use client'

import * as React from 'react'
import { Database } from '@/types/database'
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Plus, Search, ExternalLink, Edit, AlertCircle, Clock, Trash } from 'lucide-react'
import { TaskDialog } from '@/components/division/task-dialog'
import { getTaskDateStatus } from '@/utils/task-status'
import { Checkbox } from '@/components/ui/checkbox'
import { deleteTask, updateTask } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Task = Database['public']['Tables']['tasks']['Row']
type Division = Database['public']['Tables']['divisions']['Row']

// Move badge logic outside to prevent recreation
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Done': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Done</Badge>
    case 'In Progress': return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
    case 'Waiting Review': return <Badge className="bg-amber-500 hover:bg-amber-600 text-amber-950">Review</Badge>
    case 'Overdue': return <Badge variant="destructive">Overdue</Badge>
    default: return <Badge variant="secondary">Not Started</Badge>
  }
}

// Extract TaskRow and memoize it to prevent re-renders of the whole table
const TaskRow = React.memo(({ 
  task, 
  onToggleCompletion, 
  onEdit, 
  onDelete 
}: { 
  task: Task, 
  onToggleCompletion: (task: Task, checked: boolean) => void,
  onEdit: (task: Task) => void,
  onDelete: (task: Task) => void
}) => {
  return (
    <TableRow key={task.id}>
      <TableCell>
        <Checkbox 
          checked={task.status === 'Done'} 
          onCheckedChange={(checked) => onToggleCompletion(task, checked as boolean)} 
        />
      </TableCell>
      <TableCell className={`font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : ''}`}>
        {task.title}
        {task.link_attachment && (
          <a href={task.link_attachment} target="_blank" rel="noopener noreferrer" className="inline-flex ml-2 text-muted-foreground hover:text-primary">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </TableCell>
      <TableCell>{task.pic}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 items-start">
          <span className={`
            ${getTaskDateStatus(task.deadline, task.status) === 'overdue' ? 'text-destructive font-medium' : ''}
            ${getTaskDateStatus(task.deadline, task.status) === 'approaching' ? 'text-amber-500 font-medium' : ''}
          `}>
            {format(new Date(task.deadline), 'MMM dd, yyyy')}
          </span>
          {getTaskDateStatus(task.deadline, task.status) === 'overdue' && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0 gap-1">
              <AlertCircle className="w-3 h-3" /> Overdue
            </Badge>
          )}
          {getTaskDateStatus(task.deadline, task.status) === 'approaching' && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 gap-1 border-amber-500 text-amber-500">
              <Clock className="w-3 h-3" /> Near Deadline
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={task.progress} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">{task.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-red-500 hover:bg-red-500/10" onClick={() => onDelete(task)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
})
TaskRow.displayName = 'TaskRow'

export function DivisionClientPage({ division, initialTasks, slug }: { division: Division, initialTasks: Task[], slug: string }) {
  const { tasks, setTasks } = useRealtimeTasks(initialTasks, division.id)
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const [statusFilter, setStatusFilter] = React.useState<string>('All')
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                            task.pic.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tasks, debouncedSearchQuery, statusFilter])

  // Calculate division progress based on completed tasks or average progress
  const overallProgress = React.useMemo(() => {
    return tasks.length > 0 
      ? Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)
      : 0
  }, [tasks])

  const openNewTaskDialog = React.useCallback(() => {
    setEditingTask(null)
    setIsDialogOpen(true)
  }, [])

  const openEditDialog = React.useCallback((task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteClick = React.useCallback((task: Task) => {
    setTaskToDelete(task)
  }, [])

  const confirmDelete = async () => {
    if (!taskToDelete) return
    setIsDeleting(true)
    // Optimistic delete
    const previousTasks = [...tasks]
    setTasks(tasks.filter(t => t.id !== taskToDelete.id))
    try {
      await deleteTask(taskToDelete.id, slug)
    } catch (error) {
      console.error(error)
      // Rollback
      setTasks(previousTasks)
      alert("Failed to delete task.")
    } finally {
      setIsDeleting(false)
      setTaskToDelete(null)
    }
  }

  const handleToggleCompletion = React.useCallback(async (taskToToggle: Task, checked: boolean) => {
    const newStatus = checked ? 'Done' : 'In Progress'
    const newProgress = checked ? 100 : 0
    
    // Save previous state for rollback
    const previousTasks = [...tasks]
    
    // Optimistic UI Update
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskToToggle.id 
        ? { ...t, status: newStatus, progress: newProgress } 
        : t
    ))

    try {
      await updateTask(taskToToggle.id, { status: newStatus, progress: newProgress }, slug)
    } catch (error) {
      console.error('Failed to toggle task:', error)
      // Rollback on failure
      setTasks(previousTasks)
      alert("Failed to update task status.")
    }
  }, [tasks, setTasks, slug])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Overall Progress</h3>
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="h-2 mt-2" />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Target Progress</h3>
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{division.target_progress}%</div>
            <p className="text-xs text-muted-foreground mt-2">Target for this week</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Tasks</h3>
          </div>
          <div className="pt-4">
            <div className="text-2xl font-bold">{tasks.length}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Waiting Review">Waiting Review</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNewTaskDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Task Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onToggleCompletion={handleToggleCompletion}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={editingTask} 
        divisionId={division.id} 
        slug={slug}
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tugas?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
