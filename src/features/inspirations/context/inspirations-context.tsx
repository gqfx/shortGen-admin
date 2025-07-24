import { createContext, useContext, ReactNode, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inspirationsApi, Inspiration } from '@/lib/api'
import { toast } from 'sonner'

interface InspirationsContextType {
  inspirations: Inspiration[]
  isLoading: boolean
  error: any
  selectedInspiration: Inspiration | null
  setSelectedInspiration: (inspiration: Inspiration | null) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDetailDialogOpen: boolean
  setIsDetailDialogOpen: (open: boolean) => void
  createInspiration: (data: any) => Promise<void>
  updateInspiration: (id: string, data: any) => Promise<void>
  deleteInspiration: (id: string) => Promise<void>
  approveInspiration: (id: string, data?: any) => Promise<void>
  rejectInspiration: (id: string, data?: any) => Promise<void>
  regenerateInspiration: (id: string, data?: any) => Promise<void>
  refreshInspirations: () => void
}

const InspirationsContext = createContext<InspirationsContextType | undefined>(undefined)

export const useInspirations = () => {
  const context = useContext(InspirationsContext)
  if (context === undefined) {
    throw new Error('useInspirations must be used within a InspirationsProvider')
  }
  return context
}

interface InspirationsProviderProps {
  children: ReactNode
}

export default function InspirationsProvider({ children }: InspirationsProviderProps) {
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch inspirations
  const { data: inspirations = [], isLoading, error, refetch } = useQuery<Inspiration[]>({
    queryKey: ['inspirations'],
    queryFn: () => inspirationsApi.getAll(0, 100),
    
  })
  console.log('📊 Processed inspirations:', inspirations)

  // Create inspiration mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => inspirationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success('Inspiration created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update inspiration mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inspirationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success('Inspiration updated successfully')
      setIsEditDialogOpen(false)
      setSelectedInspiration(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete inspiration mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => inspirationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success('Inspiration deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedInspiration(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Approve inspiration mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => inspirationsApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success('Inspiration approved successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to approve inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Reject inspiration mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => inspirationsApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success('Inspiration rejected successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to reject inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Regenerate inspiration mutation
  const regenerateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => inspirationsApi.regenerate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspirations'] })
      toast.success(`Inspiration regeneration started successfully. Execution ID: ${data.execution_id}`)
    },
    onError: (error: any) => {
      toast.error(`Failed to regenerate inspiration: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshInspirations = () => {
    refetch()
  }

  const createInspiration = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const updateInspiration = async (id: string, data: any) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteInspiration = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const approveInspiration = async (id: string, data?: any) => {
    await approveMutation.mutateAsync({ id, data })
  }

  const rejectInspiration = async (id: string, data?: any) => {
    await rejectMutation.mutateAsync({ id, data })
  }

  const regenerateInspiration = async (id: string, data?: any) => {
    await regenerateMutation.mutateAsync({ id, data })
  }

  return (
    <InspirationsContext.Provider
      value={{
        inspirations,
        isLoading,
        error,
        selectedInspiration,
        setSelectedInspiration,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDetailDialogOpen,
        setIsDetailDialogOpen,
        createInspiration,
        updateInspiration,
        deleteInspiration,
        approveInspiration,
        rejectInspiration,
        regenerateInspiration,
        refreshInspirations,
      }}
    >
      {children}
    </InspirationsContext.Provider>
  )
}