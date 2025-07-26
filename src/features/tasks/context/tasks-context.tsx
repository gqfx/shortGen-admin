import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import { Task } from '@/features/tasks/data/schema'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import' | 'detail'

interface ApiError {
  response?: {
    data?: {
      msg?: string
    }
  }
  message: string
}

export interface PaginationState {
  page: number
  size: number
  total: number
  pages: number
}

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  // API data
  tasks: Task[]
  isLoading: boolean
  error: Error | null
  // Pagination
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  // API operations
  createTask: (data: unknown) => Promise<void>
  updateTask: (id: string, data: unknown) => Promise<void>
  enqueueTask: (id: string) => Promise<void>
  refreshTasks: () => void
}

const TasksContext = React.createContext<TasksContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TasksProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const queryClient = useQueryClient()

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    size: 10,
    total: 0,
    pages: 1,
  })

  // Fetch tasks
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', pagination.page, pagination.size],
    queryFn: () => tasksApi.listTasks({ page: pagination.page, size: pagination.size }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  React.useEffect(() => {
    if (apiResponse?.data) {
      setPagination(prev => ({
        ...prev,
        total: apiResponse.data.total,
        pages: apiResponse.data.pages,
        page: apiResponse.data.page,
        size: apiResponse.data.size,
      }))
    }
  }, [apiResponse])

  const tasks = apiResponse?.data?.items || []

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: unknown) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
      setOpen(null)
    },
    onError: (error: Error) => {
      const apiError = error as ApiError
      toast.error(`Failed to create task: ${apiError.response?.data?.msg || apiError.message}`)
    },
  })

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      tasksApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: Error) => {
      const apiError = error as ApiError
      toast.error(`Failed to update task: ${apiError.response?.data?.msg || apiError.message}`)
    },
  })


  // Enqueue task mutation
  const enqueueMutation = useMutation({
    mutationFn: (id: string) => tasksApi.enqueue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task enqueued successfully')
    },
    onError: (error: Error) => {
      const apiError = error as ApiError
      toast.error(`Failed to enqueue task: ${apiError.response?.data?.msg || apiError.message}`)
    },
  })

  const refreshTasks = () => {
    refetch()
  }

  const createTask = async (data: unknown) => {
    await createMutation.mutateAsync(data)
  }

  const updateTask = async (id: string, data: unknown) => {
    await updateMutation.mutateAsync({ id, data })
  }


  const enqueueTask = async (id: string) => {
    await enqueueMutation.mutateAsync(id)
  }

  return (
    <TasksContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        tasks,
        isLoading,
        error,
        pagination,
        setPagination,
        createTask,
        updateTask,
        enqueueTask,
        refreshTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}