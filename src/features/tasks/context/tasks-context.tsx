import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi, Task } from '@/lib/api'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import' | 'detail'

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  // API data
  tasks: Task[]
  isLoading: boolean
  error: any
  // API operations
  createTask: (data: any) => Promise<void>
  updateTask: (id: number, data: any) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  claimTasks: (taskTypes: string[]) => Promise<void>
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
      console.log('🔄 Fetching tasks from API...')
      try {
        const response = await tasksApi.getAll(0, 100)
        console.log('✅ Tasks API Response:', response.data)
        return response
      } catch (err) {
        console.error('❌ Tasks API Error:', err)
        throw err
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const tasks = apiResponse?.data?.data || []
  console.log('📊 Processed tasks:', tasks)

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
      setOpen(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to create task: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update task: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete task: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Claim tasks mutation
  const claimMutation = useMutation({
    mutationFn: (taskTypes: string[]) => tasksApi.claim(taskTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tasks claimed successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to claim tasks: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshTasks = () => {
    refetch()
  }

  const createTask = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const updateTask = async (id: number, data: any) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteTask = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  const claimTasks = async (taskTypes: string[]) => {
    await claimMutation.mutateAsync(taskTypes)
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