import { createContext, useContext, ReactNode, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workerConfigsApi, WorkerConfig } from '@/lib/api'
import { toast } from 'sonner'

interface WorkerConfigsContextType {
  workerConfigs: WorkerConfig[]
  isLoading: boolean
  error: any
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
  createConfig: (data: any) => Promise<void>
  updateConfig: (id: number, data: any) => Promise<void>
  deleteConfig: (id: number) => Promise<void>
  refreshConfigs: () => void
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

  const queryClient = useQueryClient()

  // Fetch worker configs
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['workerConfigs'],
    queryFn: async () => {
      console.log('🔄 Fetching worker configs from API...')
      try {
        const response = await workerConfigsApi.getAll(0, 100)
        console.log('✅ Worker Configs API Response:', response.data)
        return response
      } catch (err) {
        console.error('❌ Worker Configs API Error:', err)
        throw err
      }
    },
  })

  const workerConfigs = apiResponse?.data?.data || []
  console.log('📊 Processed worker configs:', workerConfigs)

  // Create config mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => workerConfigsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => workerConfigsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration updated successfully')
      setIsEditDialogOpen(false)
      setSelectedConfig(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete config mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => workerConfigsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerConfigs'] })
      toast.success('Worker configuration deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedConfig(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete worker config: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshConfigs = () => {
    refetch()
  }

  const createConfig = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const updateConfig = async (id: number, data: any) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteConfig = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <WorkerConfigsContext.Provider
      value={{
        workerConfigs,
        isLoading,
        error,
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
        createConfig,
        updateConfig,
        deleteConfig,
        refreshConfigs,
      }}
    >
      {children}
    </WorkerConfigsContext.Provider>
  )
}