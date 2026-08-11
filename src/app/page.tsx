import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react'
import { getTaskDateStatus } from '@/utils/task-status'
import { StatCards } from '@/components/dashboard/stat-cards'

type Division = Database['public']['Tables']['divisions']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export default async function GlobalDashboard() {
  const supabase = (await createClient()) as any
  
  // Fetch all divisions and tasks
  const { data: divisions } = await supabase.from('divisions').select('*').order('name')
  const { data: tasks } = await supabase.from('tasks').select('*')
  
  const divList = (divisions || []) as Division[]
  const taskList = (tasks || []) as Task[]

  // Calculate Global Metrics
  const totalTasks = taskList.length
  const completedTasks = taskList.filter(t => t.status === 'Done').length
  const today = new Date();
  const overdueTasks = taskList.filter((task) => {
    const isPastDeadline = new Date(task.deadline) < today;
    return isPastDeadline && task.status !== 'Done';
  }).length;
  
  // Calculate Progress per division
  const divisionProgress = divList.map(div => {
    const divTasks = taskList.filter(t => t.division_id === div.id)
    const currentProgress = divTasks.length > 0 
      ? Math.round(divTasks.reduce((acc, t) => acc + t.progress, 0) / divTasks.length)
      : 0
    
    let overdueCount = 0
    let nearDeadlineCount = 0

    divTasks.forEach(t => {
      const status = getTaskDateStatus(t.deadline, t.status)
      if (status === 'overdue') {
        overdueCount++
      } else if (status === 'approaching' && t.status !== 'Done' && t.progress < 50) {
        nearDeadlineCount++
      }
    })
    
    const isBehindTarget = currentProgress < div.target_progress
    const isAtRisk = overdueCount > 0 || nearDeadlineCount > 0 || isBehindTarget

    let highestRiskLevel: 'critical' | 'warning' | 'lag' | null = null
    if (overdueCount > 0) highestRiskLevel = 'critical'
    else if (nearDeadlineCount > 0) highestRiskLevel = 'warning'
    else if (isBehindTarget) highestRiskLevel = 'lag'

    return {
      ...div,
      currentProgress,
      isAtRisk,
      highestRiskLevel,
      taskCount: divTasks.length,
      overdueCount,
      nearDeadlineCount
    }
  })

  // Calculate Global Progress
  const globalProgress = divisionProgress.length > 0
    ? Math.round(divisionProgress.reduce((acc, div) => acc + div.currentProgress, 0) / divisionProgress.length)
    : 0

  const atRiskDivisions = divisionProgress.filter(div => div.isAtRisk)

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
      </div>

      {/* Global Progress Hero */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-2">
          <h3 className="tracking-tight text-lg font-medium text-muted-foreground">Overall Event Readiness</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{globalProgress}%</span>
          </div>
          <Progress value={globalProgress} className="h-4 mt-4" />
        </div>
      </div>

      {/* Interactive Metrics Grid */}
      <StatCards 
        divisions={divisionProgress}
        tasks={taskList}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        overdueTasks={overdueTasks}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* At-Risk Divisions */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 flex flex-row items-center justify-between">
            <div>
              <h3 className="tracking-tight text-lg font-semibold">⚠️ Status Risiko Divisi</h3>
              <p className="text-sm text-muted-foreground">Daftar divisi yang memiliki tugas terlambat (overdue) atau mendekati deadline.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="p-6 pt-0 flex-1">
            {atRiskDivisions.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-8">
                All divisions are on track! 🎉
              </div>
            ) : (
              <div className="space-y-4">
                {atRiskDivisions.map(div => {
                  let bgColor = ''
                  let borderColor = ''
                  let textColor = ''
                  let Icon = AlertTriangle
                  let riskMessage = ''

                  if (div.highestRiskLevel === 'critical') {
                    bgColor = 'bg-red-500/10 dark:bg-red-500/20'
                    borderColor = 'border-red-500/20 dark:border-red-500/30'
                    textColor = 'text-red-600 dark:text-red-400'
                    Icon = AlertTriangle
                    riskMessage = `${div.overdueCount} Overdue Task${div.overdueCount > 1 ? 's' : ''}`
                  } else if (div.highestRiskLevel === 'warning') {
                    bgColor = 'bg-amber-500/10 dark:bg-amber-500/20'
                    borderColor = 'border-amber-500/20 dark:border-amber-500/30'
                    textColor = 'text-amber-600 dark:text-amber-400'
                    Icon = Clock
                    riskMessage = `${div.nearDeadlineCount} Task${div.nearDeadlineCount > 1 ? 's' : ''} Near Deadline (<50%)`
                  } else {
                    bgColor = 'bg-blue-500/10 dark:bg-blue-500/20'
                    borderColor = 'border-blue-500/20 dark:border-blue-500/30'
                    textColor = 'text-blue-600 dark:text-blue-400'
                    Icon = TrendingDown
                    riskMessage = 'Behind Target Progress'
                  }

                  return (
                    <div key={div.id} className={`flex items-center justify-between p-4 border rounded-lg ${bgColor} ${borderColor}`}>
                      <div>
                        <div className="font-semibold">{div.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
                          <span>Target: {div.target_progress}%</span>
                          <span className={`${textColor} font-medium flex items-center gap-1`}>
                            <Icon className="h-3 w-3" /> {riskMessage}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${textColor}`}>{div.currentProgress}%</div>
                        <Link href={`/division/${div.slug}`} className="text-xs text-muted-foreground hover:underline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Division Overview */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="tracking-tight text-lg font-semibold">Division Overview</h3>
            <p className="text-sm text-muted-foreground">Quick glance at all divisions.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-6">
              {divisionProgress.map(div => (
                <div key={div.id} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/division/${div.slug}`} className="font-medium hover:underline">
                      {div.name}
                    </Link>
                    <span className="text-sm font-medium">{div.currentProgress}%</span>
                  </div>
                  <Progress 
                    value={div.currentProgress} 
                    className={`h-2 ${div.isAtRisk ? '[&>div]:bg-amber-500' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
