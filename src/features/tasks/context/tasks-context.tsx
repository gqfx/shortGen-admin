import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi, Task } from '@/lib/api'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { CreateTaskRequest, UpdateTaskRequest } from '@/lib/api'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import' | 'detail'

interface ApiError {
  response?: {
    data?: {
      msg?: string
    }
  }
  message: string
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
  // API operations
  createTask: (data: unknown) => Promise<void>
  updateTask: (id: string, data: unknown) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  claimTasks: (taskTypes: string[]) => Promise<void>
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

  // Fetch tasks
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await tasksApi.getAll(0, 100)
      return response
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const tasks = apiResponse?.data?.data || []

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: unknown) => tasksApi.create(data as CreateTaskRequest),
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
      tasksApi.update(id, data as UpdateTaskRequest),
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

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: Error) => {
      const apiError = error as ApiError
      toast.error(`Failed to delete task: ${apiError.response?.data?.msg || apiError.message}`)
    },
  })

  // Claim tasks mutation
  const claimMutation = useMutation({
    mutationFn: (taskTypes: string[]) => tasksApi.claim(taskTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tasks claimed successfully')
    },
    onError: (error: Error) => {
      const apiError = error as ApiError
      toast.error(`Failed to claim tasks: ${apiError.response?.data?.msg || apiError.message}`)
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

  const deleteTask = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const claimTasks = async (taskTypes: string[]) => {
    await claimMutation.mutateAsync(taskTypes)
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
        createTask,
        updateTask,
        deleteTask,
        claimTasks,
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