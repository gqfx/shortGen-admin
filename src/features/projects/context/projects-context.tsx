import { createContext, useContext, ReactNode, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectsApi } from '@/lib/api'
import {
  Project,
  CreateProjectFormData,
  UpdateProjectFormData,
} from '../data/schema'

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isRecalculating: boolean
  isRegenerating: boolean
  selectedProject: Project | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedProject: (project: Project | null) => void
  refreshProjects: () => void
  createProject: (data: CreateProjectFormData) => Promise<void>
  updateProject: (id: string, data: UpdateProjectFormData) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  recalculateProjectTasks: (id: string) => Promise<void>
  regenerateProject: (id: string, params?: Record<string, unknown>) => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export const useProjects = () => {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}

interface ProjectsProviderProps {
  children: ReactNode
}

export default function ProjectsProvider({ children }: ProjectsProviderProps) {
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch projects
  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await projectsApi.getAll(0, 100)
      } catch (err) {
        const error = err as Error & { response?: { data?: { msg?: string } } };
        toast.error('Failed to fetch projects: ' + (error.response?.data?.msg || error.message))
        throw err
      }
    },
  })

  const projects = apiResponse?.data || []

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectFormData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: Error & { response?: { data?: { msg?: string } } }) => {
      toast.error('Failed to create project: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectFormData }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
      setIsEditDialogOpen(false)
    },
    onError: (error: Error & { response?: { data?: { msg?: string } } }) => {
      toast.error('Failed to update project: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedProject(null)
    },
    onError: (error: Error & { response?: { data?: { msg?: string } } }) => {
      toast.error('Failed to delete project: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Recalculate tasks mutation
  const recalculateMutation = useMutation({
    mutationFn: (id: string) => projectsApi.recalculateTasks(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project tasks recalculation initiated.')
    },
    onError: (error: Error & { response?: { data?: { msg?: string } } }) => {
      toast.error('Failed to recalculate tasks: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Regenerate project mutation
  const regenerateMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params?: Record<string, unknown> }) =>
      projectsApi.regenerate(id, params),
    onSuccess: (data: { data: { execution_id: string } }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(`Project regeneration started. Execution ID: ${data.data.execution_id}`)
    },
    onError: (error: Error & { response?: { data?: { msg?: string } } }) => {
      toast.error('Failed to regenerate project: ' + (error.response?.data?.msg || error.message))
    },
  })

  const refreshProjects = () => {
    refetch()
  }

  const createProject = async (data: CreateProjectFormData) => {
    await createMutation.mutateAsync(data)
  }

  const updateProject = async (id: string, data: UpdateProjectFormData) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteProject = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const recalculateProjectTasks = async (id: string) => {
    await recalculateMutation.mutateAsync(id)
  }

  const regenerateProject = async (id: string, params?: Record<string, unknown>) => {
    await regenerateMutation.mutateAsync({ id, params })
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isRecalculating: recalculateMutation.isPending,
        isRegenerating: regenerateMutation.isPending,
        selectedProject,
        isCreateDialogOpen,
        isEditDialogOpen,
        isDeleteDialogOpen,
        setIsCreateDialogOpen,
        setIsEditDialogOpen,
        setIsDeleteDialogOpen,
        setSelectedProject,
        refreshProjects,
        createProject,
        updateProject,
        deleteProject,
        recalculateProjectTasks,
        regenerateProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}