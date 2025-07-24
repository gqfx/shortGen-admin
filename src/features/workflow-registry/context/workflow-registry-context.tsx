import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowRegistryApi, WorkflowRegistry, WorkflowRegistryCreate, WorkflowRegistryUpdate } from '@/lib/api'
import { toast } from 'sonner'

interface WorkflowRegistryContextType {
  workflows: WorkflowRegistry[]
  isLoading: boolean
  error: any
  selectedWorkflow: WorkflowRegistry | null
  setSelectedWorkflow: React.Dispatch<React.SetStateAction<WorkflowRegistry | null>>
  
  // Dialog states
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDetailDialogOpen: boolean
  setIsDetailDialogOpen: (open: boolean) => void
  
  // API operations
  createWorkflow: (data: WorkflowRegistryCreate) => Promise<void>
  updateWorkflow: (id: string, data: WorkflowRegistryUpdate) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  activateWorkflow: (id: string) => Promise<void>
  deactivateWorkflow: (id: string) => Promise<void>
  refreshWorkflows: () => void
}

const WorkflowRegistryContext = React.createContext<WorkflowRegistryContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function WorkflowRegistryProvider({ children }: Props) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRegistry | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch workflows
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-registry'],
    queryFn: async () => {
      console.log('🔄 Fetching workflows from API...')
      try {
        const response = await workflowRegistryApi.getAll(0, 100)
        console.log('✅ Workflows API Response:', response)
        return response
      } catch (err) {
        console.error('❌ Workflows API Error:', err)
        throw err
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const workflows = apiResponse || []
  console.log('📊 Processed workflows:', workflows)

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: (data: WorkflowRegistryCreate) => workflowRegistryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-registry'] })
      toast.success('Workflow created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create workflow: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update workflow mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkflowRegistryUpdate }) => workflowRegistryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-registry'] })
      toast.success('Workflow updated successfully')
      setIsEditDialogOpen(false)
      setSelectedWorkflow(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update workflow: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete workflow mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowRegistryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-registry'] })
      toast.success('Workflow deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedWorkflow(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete workflow: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Activate workflow mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => workflowRegistryApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-registry'] })
      toast.success('Workflow activated successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to activate workflow: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Deactivate workflow mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => workflowRegistryApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-registry'] })
      toast.success('Workflow deactivated successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to deactivate workflow: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshWorkflows = () => {
    refetch()
  }

  const createWorkflow = async (data: WorkflowRegistryCreate) => {
    await createMutation.mutateAsync(data)
  }

  const updateWorkflow = async (id: string, data: WorkflowRegistryUpdate) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteWorkflow = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const activateWorkflow = async (id: string) => {
    await activateMutation.mutateAsync(id)
  }

  const deactivateWorkflow = async (id: string) => {
    await deactivateMutation.mutateAsync(id)
  }

  return (
    <WorkflowRegistryContext.Provider
      value={{
        workflows,
        isLoading,
        error,
        selectedWorkflow,
        setSelectedWorkflow,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDetailDialogOpen,
        setIsDetailDialogOpen,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        activateWorkflow,
        deactivateWorkflow,
        refreshWorkflows,
      }}
    >
      {children}
    </WorkflowRegistryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkflowRegistry = () => {
  const workflowRegistryContext = React.useContext(WorkflowRegistryContext)

  if (!workflowRegistryContext) {
    throw new Error('useWorkflowRegistry has to be used within <WorkflowRegistryContext>')
  }

  return workflowRegistryContext
}