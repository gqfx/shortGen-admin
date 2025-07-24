import { createContext, useContext, ReactNode, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workerConfigsApi, WorkerConfig, CreateWorkerConfigRequest, UpdateWorkerConfigRequest } from '@/lib/api'
import { toast } from 'sonner'

import { ConfigAssignmentRequest, TaskConfigAssignment, ApiResponse } from '@/lib/api'

type ApiError = {
  response?: {
    data?: ApiResponse<unknown>
  }
} & Error

interface WorkerConfigsContextType {
  workerConfigs: WorkerConfig[]
  isLoading: boolean
  error: ApiError | null
  filters: {
    workerType?: string
    configType?: string
    isActive?: boolean
  }
  setFilters: (filters: Partial<WorkerConfigsContextType['filters']>) => void
  selectedConfig: WorkerConfig | null
  setSelectedConfig: (config: WorkerConfig | null) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDetailDialogOpen: boolean
  setIsDetailDialogOpen: (open: boolean) => void
  isAssignDialogOpen: boolean
  setIsAssignDialogOpen: (open: boolean) => void
  createConfig: (data: CreateWorkerConfigRequest) => Promise<void>
  updateConfig: (id: string, data: UpdateWorkerConfigRequest) => Promise<void>
  deleteConfig: (id: string) => Promise<void>
  refreshConfigs: () => void
  assignToTask: (taskId: string, data: ConfigAssignmentRequest) => Promise<TaskConfigAssignment[]>
  getTaskConfigs: (taskId: string) => Promise<Record<string, WorkerConfig>>
}

const WorkerConfigsContext = createContext<WorkerConfigsContextType | undefined>(undefined)

export const useWorkerConfigs = () => {
  const context = useContext(WorkerConfigsContext)
  if (context === undefined) {
    throw new Error('useWorkerConfigs must be used within a WorkerConfigsProvider')
  }
  return context
}

interface WorkerConfigsProviderProps {
  children: ReactNode
}

export default function WorkerConfigsProvider({ children }: WorkerConfigsProviderProps) {
  const [selectedConfig, setSelectedConfig] = useState<WorkerConfig | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [filters, setFilters] = useState<Partial<WorkerConfigsContextType['filters']>>({})

  const queryClient = useQueryClient()

  const handleSetFilters = (newFilters: Partial<WorkerConfigsContextType['filters']>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Fetch worker configs
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['workerConfigs', filters],
    queryFn: async () => {
      const response = await workerConfigsApi.getAll(0, 100, filters.workerType, filters.configType, filters.isActive)
      return response.data
    },
  })

  const workerConfigs = apiResponse?.data || []

  // Create config mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateWorkerConfigRequest) => workerConfigsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: ApiError) => {
      toast.error(`Failed to create worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerConfigRequest }) => workerConfigsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration updated successfully')
      setIsEditDialogOpen(false)
      setSelectedConfig(null)
    },
    onError: (error: ApiError) => {
      toast.error(`Failed to update worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete config mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workerConfigsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedConfig(null)
    },
    onError: (error: ApiError) => {
      toast.error(`Failed to delete worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  const assignToTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: ConfigAssignmentRequest }) =>
      workerConfigsApi.assignToTask(taskId, data),
    onSuccess: () => {
      toast.success('Configurations assigned to task successfully')
    },
    onError: (error: ApiError) => {
      toast.error(`Failed to assign configurations: ${error.response?.data?.msg || error.message}`)
    },
  })

  const getTaskConfigs = async (taskId: string): Promise<Record<string, WorkerConfig>> => {
    try {
      const response = await workerConfigsApi.getTaskConfigs(taskId)
      toast.success('Task configurations fetched successfully')
      return response.data.data
    } catch (error) {
      const apiError = error as ApiError
      toast.error(`Failed to fetch task configurations: ${apiError.response?.data?.msg || apiError.message}`)
      throw apiError
    }
  }

  const refreshConfigs = () => {
    refetch()
  }

  const createConfig = async (data: CreateWorkerConfigRequest) => {
    await createMutation.mutateAsync(data)
  }

  const updateConfig = async (id: string, data: UpdateWorkerConfigRequest) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteConfig = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const assignToTask = async (taskId: string, data: ConfigAssignmentRequest): Promise<TaskConfigAssignment[]> => {
    const response = await assignToTaskMutation.mutateAsync({ taskId, data })
    return response.data.data
  }
  
    return (
      <WorkerConfigsContext.Provider
        value={{
          workerConfigs,
          isLoading,
          error,
          filters,
          setFilters: handleSetFilters,
          selectedConfig,
          setSelectedConfig,
          isCreateDialogOpen,
          setIsCreateDialogOpen,
          isEditDialogOpen,
          setIsEditDialogOpen,
          isDeleteDialogOpen,
          setIsDeleteDialogOpen,
          isDetailDialogOpen,
          setIsDetailDialogOpen,
          isAssignDialogOpen,
          setIsAssignDialogOpen,
          createConfig,
          updateConfig,
          deleteConfig,
          refreshConfigs,
          assignToTask,
          getTaskConfigs,
        }}
      >
      {children}
    </WorkerConfigsContext.Provider>
  )
}