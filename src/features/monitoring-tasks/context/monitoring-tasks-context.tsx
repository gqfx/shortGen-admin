import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  MonitoringTask,
  MonitoringTaskUpdate,
  analysisApi,
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface MonitoringTasksContextType {
  tasks: MonitoringTask[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    size: number
    total: number
    pages: number
  }
  filters: {
    accountId?: string
    videoId?: string
    taskType?: string
    status?: string
  }

  // Actions
  fetchTasks: () => Promise<void>
  updateTask: (taskId: string, data: MonitoringTaskUpdate) => Promise<boolean>
  setFilters: (filters: Partial<MonitoringTasksContextType['filters']>) => void
  setPagination: (pagination: Partial<MonitoringTasksContextType['pagination']>) => void
  resetFilters: () => void
}

const MonitoringTasksContext = createContext<MonitoringTasksContextType | undefined>(undefined)

export function useMonitoringTasks() {
  const context = useContext(MonitoringTasksContext)
  if (context === undefined) {
    throw new Error('useMonitoringTasks must be used within a MonitoringTasksProvider')
  }
  return context
}

interface MonitoringTasksProviderProps {
  children: React.ReactNode
}

export function MonitoringTasksProvider({ children }: MonitoringTasksProviderProps) {
  const [tasks, setTasks] = useState<MonitoringTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    page: 1,
    size: 10,
    total: 0,
    pages: 1,
  })
  const [filters, setFiltersState] = useState<MonitoringTasksContextType['filters']>({})

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await analysisApi.getTasks({
        page: pagination.page,
        size: pagination.size,
        account_id: filters.accountId,
        video_id: filters.videoId,
        task_type: filters.taskType,
        status: filters.status,
      })

      if (response.code === 0) {
        const { items, total, page, size, pages } = response.data
        setTasks(items)
        setPaginationState({ total, page, size, pages })
      } else {
        setError(response.msg || 'Failed to fetch monitoring tasks')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      // console.error('Failed to fetch monitoring tasks:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, filters.accountId, filters.videoId, filters.taskType, filters.status])

  const updateTask = useCallback(async (taskId: string, data: MonitoringTaskUpdate): Promise<boolean> => {
    try {
      const response = await analysisApi.updateTask(taskId, data)
      
      if (response.code === 0) {
        toast.success('Task updated successfully')
        await fetchTasks()
        return true
      } else {
        toast.error(response.msg || 'Failed to update task')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTasks])

  const setFilters = useCallback((newFilters: Partial<MonitoringTasksContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, page: 1 })) // Reset to first page when filters change
  }, [])

  const setPagination = useCallback((newPagination: Partial<MonitoringTasksContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPaginationState(prev => ({ ...prev, page: 1 }))
  }, [])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const value: MonitoringTasksContextType = {
    tasks,
    loading,
    error,
    pagination,
    filters,
    fetchTasks,
    updateTask,
    setFilters,
    setPagination,
    resetFilters,
  }

  return (
    <MonitoringTasksContext.Provider value={value}>
      {children}
    </MonitoringTasksContext.Provider>
  )
}