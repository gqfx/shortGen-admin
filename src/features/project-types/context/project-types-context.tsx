import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectTypesApi, ProjectType } from '@/lib/api'
import { toast } from 'sonner'

interface ProjectTypesContextType {
  projectTypes: ProjectType[]
  isLoading: boolean
  error: any
  selectedProjectType: ProjectType | null
  setSelectedProjectType: React.Dispatch<React.SetStateAction<ProjectType | null>>
  
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
  createProjectType: (data: any) => Promise<void>
  updateProjectType: (code: string, data: any) => Promise<void>
  deleteProjectType: (code: string) => Promise<void>
  activateProjectType: (code: string) => Promise<void>
  deactivateProjectType: (code: string) => Promise<void>
  updateSortOrder: (code: string, sortOrder: number) => Promise<void>
  refreshProjectTypes: () => void
}

const ProjectTypesContext = React.createContext<ProjectTypesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ProjectTypesProvider({ children }: Props) {
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch project types
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['project-types'],
    queryFn: async () => {
      console.log('🔄 Fetching project types from API...')
      try {
        const response = await projectTypesApi.getAll(0, 100)
        console.log('✅ Project Types API Response:', response.data)
        return response
      } catch (err) {
        console.error('❌ Project Types API Error:', err)
        throw err
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const projectTypes = apiResponse?.data?.data || []
  console.log('📊 Processed project types:', projectTypes)

  // Create project type mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => projectTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Project type created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create project type: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update project type mutation
  const updateMutation = useMutation({
    mutationFn: ({ code, data }: { code: string; data: any }) => projectTypesApi.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Project type updated successfully')
      setIsEditDialogOpen(false)
      setSelectedProjectType(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update project type: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete project type mutation
  const deleteMutation = useMutation({
    mutationFn: (code: string) => projectTypesApi.delete(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Project type deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedProjectType(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete project type: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Activate project type mutation
  const activateMutation = useMutation({
    mutationFn: (code: string) => projectTypesApi.activate(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Project type activated successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to activate project type: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Deactivate project type mutation
  const deactivateMutation = useMutation({
    mutationFn: (code: string) => projectTypesApi.deactivate(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Project type deactivated successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to deactivate project type: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update sort order mutation
  const sortOrderMutation = useMutation({
    mutationFn: ({ code, sortOrder }: { code: string; sortOrder: number }) => 
      projectTypesApi.updateSortOrder(code, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] })
      toast.success('Sort order updated successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to update sort order: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshProjectTypes = () => {
    refetch()
  }

  const createProjectType = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const updateProjectType = async (code: string, data: any) => {
    await updateMutation.mutateAsync({ code, data })
  }

  const deleteProjectType = async (code: string) => {
    await deleteMutation.mutateAsync(code)
  }

  const activateProjectType = async (code: string) => {
    await activateMutation.mutateAsync(code)
  }

  const deactivateProjectType = async (code: string) => {
    await deactivateMutation.mutateAsync(code)
  }

  const updateSortOrder = async (code: string, sortOrder: number) => {
    await sortOrderMutation.mutateAsync({ code, sortOrder })
  }

  return (
    <ProjectTypesContext.Provider
      value={{
        projectTypes,
        isLoading,
        error,
        selectedProjectType,
        setSelectedProjectType,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDetailDialogOpen,
        setIsDetailDialogOpen,
        createProjectType,
        updateProjectType,
        deleteProjectType,
        activateProjectType,
        deactivateProjectType,
        updateSortOrder,
        refreshProjectTypes,
      }}
    >
      {children}
    </ProjectTypesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectTypes = () => {
  const projectTypesContext = React.useContext(ProjectTypesContext)

  if (!projectTypesContext) {
    throw new Error('useProjectTypes has to be used within <ProjectTypesContext>')
  }

  return projectTypesContext
}