import { differenceInDays, startOfDay } from 'date-fns'

export type TaskDateStatus = 'normal' | 'approaching' | 'overdue'

export function getTaskDateStatus(deadlineStr: string, status: string): TaskDateStatus {
  if (status === 'Done') return 'normal'

  const today = startOfDay(new Date())
  const deadlineDate = startOfDay(new Date(deadlineStr))

  const daysDifference = differenceInDays(deadlineDate, today)

  if (daysDifference < 0) {
    return 'overdue'
  }

  if (daysDifference >= 0 && daysDifference <= 3) {
    return 'approaching'
  }

  return 'normal'
}
