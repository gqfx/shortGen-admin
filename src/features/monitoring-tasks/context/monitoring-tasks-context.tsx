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
  selectedTasks: Set<string>

  // Actions
  fetchTasks: () => Promise<void>
  updateTask: (taskId: string, data: MonitoringTaskUpdate) => Promise<boolean>
  deleteTask: (taskId: string) => Promise<boolean>
  batchDeleteTasks: (taskIds: string[]) => Promise<boolean>
  setFilters: (filters: Partial<MonitoringTasksContextType['filters']>) => void
  setPagination: (pagination: Partial<MonitoringTasksContextType['pagination']>) => void
  resetFilters: () => void
  toggleTaskSelection: (taskId: string) => void
  selectAllTasks: () => void
  clearSelection: () => void
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
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
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

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const response = await analysisApi.deleteTask(taskId)
      
      if (response.code === 0) {
        toast.success('监控任务已删除')
        await fetchTasks()
        // Clear selection after deletion
        setSelectedTasks(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        return true
      } else {
        toast.error(response.msg || '删除任务失败')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTasks])

  const batchDeleteTasks = useCallback(async (taskIds: string[]): Promise<boolean> => {
    try {
      const response = await analysisApi.batchDeleteTasks(taskIds)
      
      if (response.code === 0) {
        const { deleted, skipped, not_found, processing, summary } = response.data
        
        // Show detailed results
        if (summary.total_deleted > 0) {
          toast.success(`成功删除 ${summary.total_deleted} 个任务`)
        }
        
        if (summary.total_processing > 0) {
          toast.warning(`${summary.total_processing} 个任务正在执行中，无法删除`)
        }
        
        if (summary.total_skipped > 0) {
          toast.info(`跳过 ${summary.total_skipped} 个已删除的任务`)
        }
        
        if (summary.total_not_found > 0) {
          toast.error(`${summary.total_not_found} 个任务未找到`)
        }
        
        await fetchTasks()
        setSelectedTasks(new Set())
        return true
      } else {
        toast.error(response.msg || '批量删除失败')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTasks])

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  const selectAllTasks = useCallback(() => {
    setSelectedTasks(new Set(tasks.map(task => task.id)))
  }, [tasks])

  const clearSelection = useCallback(() => {
    setSelectedTasks(new Set())
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
    selectedTasks,
    fetchTasks,
    updateTask,
    deleteTask,
    batchDeleteTasks,
    setFilters,
    setPagination,
    resetFilters,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
  }

  return (
    <MonitoringTasksContext.Provider value={value}>
      {children}
    </MonitoringTasksContext.Provider>
  )
}